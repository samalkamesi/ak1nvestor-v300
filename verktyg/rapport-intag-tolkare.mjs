#!/usr/bin/env node
/** rapport-intag-tolkare.mjs — KARANTÄNENS ISOLERADE PDF-TOLKARE (barnprocess).
 * Anropas ALDRIG direkt av människa — rapport-intag-karantan.mjs spawnar med
 * timeout + avlivning. Kontrakt: argv[2] = PDF-sökväg, stdout = en JSON-rad
 * { ok, sektioner[], begransning? }, exit 0 vid leverans (även med
 * begränsning), exit 2 vid oparsbar fil.
 *
 * STYRELSEBESLUT 2026-09-20 (styrelse-muacmgtw): "PDF-parsning i isolerad
 * process" — denna fil är den isolerade processen; en hängande eller
 * minnesätande parsning dör med barnet, aldrig med pipelinen.
 *
 * ÄRLIGA GRÄNSER (dokumentarerade, inte dolda): stödjer okrypterade PDF:er
 * med okomprimerade och FlateDecode-komprimerade innehållsströmmar samt
 * Tj/TJ/'/"-textoperatorer med latin1-escapes. Krypterade PDF:er,
 * CID-fontkodning och bilder returnerar begränsning — DÅ failar intaget
 * kontrollerat (uppgraderingsspår: pdf-parse i prod-trädet, RAM-fönster krävs). */
import fs from "node:fs";
import zlib from "node:zlib";

/** Avkoda en PDF-literalsträng med \( \) \\ \n \r \t \b \f och oktala \ddd. */
function avkodaStrang(rå) {
  let ut = "";
  for (let i = 0; i < rå.length; i++) {
    const c = rå[i];
    if (c !== "\\") { ut += c; continue; }
    const n = rå[++i];
    if (n === undefined) break;
    if (n === "n") ut += "\n";
    else if (n === "r") ut += "\r";
    else if (n === "t") ut += "\t";
    else if (n === "b") ut += "\b";
    else if (n === "f") ut += "\f";
    else if (/[0-7]/.test(n)) {
      let okt = n;
      while (okt.length < 3 && /[0-7]/.test(rå[i + 1] || "")) okt += rå[++i];
      ut += String.fromCharCode(parseInt(okt, 8));
    } else ut += n; // \( \) \\ och okända: bokstaven själv
  }
  return ut;
}

/** Hitta alla strömobjekt och returnera deras (avkomprimerade) innehåll. */
function strommar(buf) {
  const ut = [];
  const text = buf.toString("latin1");
  // (?<!end) — "endstream" får ALDRIG räknas som strömstart (gömde
  // FlateDecode-objektet efter första endstream i svitens T1c)
  const re = /(?<!end)stream\r?\n?/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const start = m.index + m[0].length;
    const slut = text.indexOf("endstream", start);
    if (slut === -1) break;
    // hitta objekthuvudet före strömmen för /FlateDecode-detektering
    const huvudStart = Math.max(0, m.index - 600);
    const huvud = text.slice(huvudStart, m.index);
    const rå = buf.subarray(start, slut);
    if (/\/FlateDecode/.test(huvud)) {
      try { ut.push(zlib.inflateSync(rå).toString("latin1")); } catch { /* korrupt ström: hoppa över */ }
    } else {
      ut.push(rå.toString("latin1"));
    }
    re.lastIndex = slut;
  }
  return ut;
}

/** Extrahera text ur en innehållsström via Tj/TJ/'/"-operatorerna. */
function textUrInnehall(innehall) {
  let ut = "";
  // TJ-array: [(A) -3 (B) 2 (C)] TJ
  const tjRe = /\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/g;
  let m;
  while ((m = tjRe.exec(innehall)) !== null) {
    const inre = m[1];
    const strRe = /\(((?:[^()\\]|\\.)*)\)/g;
    let s;
    while ((s = strRe.exec(inre)) !== null) ut += avkodaStrang(s[1]);
  }
  // enkla: (text) Tj  |  (text) '  |  (text) "
  const enkelRe = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
  while ((m = enkelRe.exec(innehall)) !== null) ut += avkodaStrang(m[1]) + "\n";
  return ut;
}

/** Dela råtext i sektioner: stycken åtskilda av tomma rader; rubrik = första
 * raden om kort (≤ 80 tkn) — annars "Sektion N". Enkel, ärlig heuristik;
 * strukturdjupet fördjupas i PDF-sektionsextraktionsvågen (10-bolagsprovet). */
function tillSektioner(text) {
  const rensad = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  if (!rensad) return [];
  const stycken = rensad.split(/\n{2,}/).map(p => p.replace(/\n/g, " ").trim()).filter(Boolean);
  return stycken.map((p, i) => {
    const förstaRad = p.split(" ")[0] || "";
    const harRubrik = p.length > 80 && förstaRad.length <= 60 && /:$|^[\d\s.]+$|[A-ZÅÄÖ]{3,}/.test(p);
    const klipp = harRubrik ? Math.min(p.indexOf(" ", 60) + 1 || p.length, p.length) : 0;
    return harRubrik
      ? { rubrik: p.slice(0, klipp).trim().slice(0, 120), text: p.slice(klipp).trim() }
      : { rubrik: `Sektion ${i + 1}`, text: p };
  });
}

// ── huvud ───────────────────────────────────────────────────────────────────
const sida = process.argv[2];
if (!sida || !fs.existsSync(sida)) {
  console.log(JSON.stringify({ ok: false, fel: `PDF saknas: ${sida || "(inget argument)"}` }));
  process.exit(2);
}
const buf = fs.readFileSync(sida);
const huvud = buf.subarray(0, 2048).toString("latin1");
if (!huvud.startsWith("%PDF-")) {
  console.log(JSON.stringify({ ok: false, fel: "inte en PDF (saknar %PDF-huvud)" }));
  process.exit(2);
}
if (/\/Encrypt\s+\d+\s+\d+\s+R/.test(buf.toString("latin1").slice(0, 200000))) {
  console.log(JSON.stringify({ ok: false, fel: "krypterad PDF — parser-gräns (uppgraderingsspår: pdf-parse)" }));
  process.exit(2);
}
const allt = strommar(buf).map(textUrInnehall).filter(Boolean).join("\n\n");
const sektioner = tillSektioner(allt);
if (!sektioner.length) {
  console.log(JSON.stringify({ ok: false, fel: "ingen text extraherad — bilder/CID-font (uppgraderingsspår: pdf-parse)" }));
  process.exit(2);
}
console.log(JSON.stringify({
  ok: true,
  sektioner,
  begransning: "minimal extraktor: FlateDecode + Tj/TJ, latin1 — se verktyg/rapport-intag-tolkare.mjs ärliga gränser",
  ts: new Date().toISOString(),
}));
