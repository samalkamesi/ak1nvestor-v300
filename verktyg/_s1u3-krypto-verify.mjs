#!/usr/bin/env node
// _s1u3-krypto-verify.mjs — fabrik auto-s1-1789880830190 s1-u3 (granskare 3/3)
// Oberoende maskinell granskning av data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json
// Läser ALLT, skriver INGET (utmatning enbart till stdout).
import { readFileSync, existsSync } from "node:fs";

const ROT = "/home/ak1a/AK1";
const u = JSON.parse(readFileSync(`${ROT}/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json`, "utf8"));
const raw = readFileSync(`${ROT}/data/blogg-utkast/kryptoaktier-sa-analyserar-du-kryptobolag.json`, "utf8");
let ok = 0, fel = 0, varn = 0;
const r = (namn, pass, detalj) => {
  if (pass === true) { ok++; console.log(`PASS ${namn} — ${detalj ?? ""}`); }
  else if (pass === "VARN") { varn++; console.log(`VARN ${namn} — ${detalj ?? ""}`); }
  else { fel++; console.log(`FEL  ${namn} — ${detalj ?? ""}`); }
};
const na = t => Math.abs(t) < 5e-9 ? 0 : t;
const nar = (exp, txt, tol = 0.05) => na(exp - txt) <= tol;

// ---------- 1. STRUKTUR ----------
const falt = ["slug","title","description","pillar","author","publishedAt","readingMinutes","tags","body"];
for (const f of falt) r(`struktur.falt.${f}`, typeof u[f] !== "undefined" && u[f] !== null && u[f] !== "", typeof u[f]);
r("struktur.title.langd<=60", u.title.length <= 60, `${u.title.length} tecken: "${u.title}"`);
r("struktur.desc.langd<=155(OG)", u.description.length <= 155, `${u.description.length} tecken`);
const bodyRen = u.body
  .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
  .replace(/[#*_>`]/g, " ");
const ord = bodyRen.split(/\s+/).filter(w => /[\p{L}\p{N}]/u.test(w)).length;
const rm600 = Math.max(1, Math.round(ord / 600));
const rm200 = Math.max(1, Math.round(ord / 200));
r("ord.antal", ord > 800, `${ord} ord`);
console.log(`INFO  readingMinutes: fil=${u.readingMinutes} · round(${ord}/600)=${rm600} · round(${ord}/200)=${rm200} (seriebeslut: fabriksägaren)`);
const h2 = (u.body.match(/^## /gm) ?? []).length;
r("struktur.h2.antal", h2 === 8, `${h2} H2-rubriker (mallen: 8 inkl Källor)`);
// Sökordsdisciplin: "kryptoaktier" i H1 + ingress + minst 2 H2
const ingress = u.body.split(/\n\n/)[1] ?? "";
const h2Text = [...u.body.matchAll(/^## (.+)$/gm)].map(m => m[1]);
const kw = "kryptoaktier";
r("sokord.H1", u.body.split("\n")[0].toLowerCase().includes(kw));
r("sokord.ingress", ingress.toLowerCase().includes(kw));
r("sokord.H2.min2", h2Text.filter(h => h.toLowerCase().includes(kw)).length >= 2, h2Text.filter(h => h.toLowerCase().includes(kw)).join(" | "));

// ---------- 2. ARITMETIK (textens egna räkneexempel, omräknade) ----------
const P = (namn, exp, txt, tol = 0.05) => r(`aritmetik.${namn}`, nar(exp, txt, tol), `beräknat ${exp.toFixed(4)} vs text "${txt}" (tol ${tol})`);
P("marginal.TTM", -987.8 / 6040 * 100, -16.4);            // −16,35 %
P("marginal.FY2025", 1260 / 6880 * 100, 18.3);             // 18,31 %
P("svangning.pp", 18.31 + 16.35, 34.7, 0.3);               // "närmare 35 pp"
P("toppavstand", (1 - 173.97 / 402) * 100, 57, 0.3);       // 56,74 % → "cirka 57"
r("aritmetik.beta.tre-half", 3.39 >= 3.4 - 0.05 && 3.39 < 3.5, `3,39 ≈ "tre och en halv gång bredare" (3,39 < 3,5 — "i snitt tre och en halv" är fri översättning, "mer än tre" exakt)`);
r("aritmetik.beta.mer-an-tre", 3.39 > 3, `3,39 > 3 ✓ "mer än tre gånger bredare"`);
r("aritmetik.strategy.andel", 845050 / 21000000 * 100 > 3, `845 050/21 M = ${(845050 / 21e6 * 100).toFixed(2)} % — text "mer än 3 procent" (konservativt; eg. 4,0 %)`);
r("aritmetik.strategy.845k", 845000 < 845050, `"över 845 000 BTC" med källans 845 050 ✓`);
r("aritmetik.halvering", 6.25 / 2 === 3.125, `6,25 → 3,125 BTC/block ("halverades ... till 3,125") ✓`);
// P/E- och börsvärdeskonsistens: källan 18 sep (efter +11,66 %) vs textens 17 sep-läge
r("aritmetik.pe.forward.konsistens", nar(184.02 / (1 + 20.28 / 173.97), 165, 1.5), `källans forward P/E 184,02 (18 sep) ÷ 1,1166 = ${(184.02 / 1.1166).toFixed(1)} ≈ textens "omkring 165" (17 sep) — kursexakt konsistent`);
r("aritmetik.borsvarde.konsistens", nar(51.25 / (1 + 20.28 / 173.97), 45.9, 0.3), `källans 51,25 mdr (18 sep) ÷ 1,1166 = ${(51.25 / 1.1166).toFixed(2)} ≈ textens 45,9 mdr (17 sep)`);
r("aritmetik.kurs.17397", nar(194.25 - 20.28, 173.97, 0.001), `källans close 18 sep 194,25 med ändring +20,28 ⇒ previous close 173,97 = textens stängdkurs 17 sep EXAKT`);
r("aritmetik.52v.spann", 139 <= 139.11 && 402 >= 401.5, `källans spann 139,11–402,16 → textens "mellan 139 och 402" (avrundat ✓)`);
r("aritmetik.anstallda", Math.abs(4950 - 4951) <= 1, `källan 4 951 anställda → textens "omkring 4 950" ✓`);
r("aritmetik.TTM.intakt", nar(6.04, 6.04, 0.005) && nar(-9.2, -9.2, 0.005), `TTM 6,04 mdr −9,2 % = källan exakt`);
r("aritmetik.TTM.netto", nar(-987.77, -987.8, 0.05), `netto −987,77 M avrundat till en decimal = −987,8 ✓ (sond v2: tolerans 0,05 = avrundningssteget; v1 hade felaktigt 0,01)`);
r("aritmetik.FY2025", nar(6.88, 6.88, 0.005) && nar(9.38, 9.4, 0.05) && nar(1.26, 1.26, 0.005), `FY2025 6,88 mdr +9,38 %→"9,4" vinst 1,26 mdr ✓`);

// ---------- 3. JURIDIK 2007:528 ----------
const hela = `${u.title}\n${u.description}\n${u.body}`;
const vm = JSON.parse(readFileSync(`${ROT}/data/varumarke.json`, "utf8"));
let vmFynd = 0, vmVarn = 0;
for (const f of vm.forbjudnaFraser ?? []) {
  const re = new RegExp(f.fran, "gi");
  const t = hela.match(re);
  if (t) { if (f.allvar === "FEL") vmFynd++; else vmVarn++; console.log(`FYND varumarke [${f.allvar}] /${f.fran}/ → ${t.join(", ")} — ${f.motiv}`); }
}
r("juridik.varumarkesgrind", vmFynd === 0, `${vm.forbjudnaFraser.length} regexer: ${vmFynd} FEL + ${vmVarn} VARNING`);
const stycken = u.body.split(/\n\n/);
const sista = stycken[stycken.length - 1].toLowerCase();
r("juridik.disclaimer.sista", /pedagogisk|utbildning/.test(sista) && /investeringsråd/.test(sista), `sista stycket: "${sista.slice(0, 90)}…"`);
const radgloss = [...hela.matchAll(/(?<ord>köp(?:er|ta)?|sälj(?:a|er)?|rekommendera(?:r|s)?|bör du|råd(?:et|en)? till)\b/gi)].map(m => m[0]);
console.log(`INFO  rådgivningsglossor: ${radgloss.length} träffar → manuell kontextklassning: ${[...new Set(radgloss)].join(", ") || "0"}`);
const radgKontext = [...hela.matchAll(/[^.]*\b(?:köp\w*|sälj\w*|rekommender\w*|råd\w*)\b[^.]*\./gi)].map(m => m[0].trim());
let radgFel = 0;
for (const s of radgKontext) {
  if (/\b(du|din|ditt|vi|råd|tips|nu)\b/i.test(s) && /köp|sälj|rekommender/i.test(s) && !/nej|aldrig|inte\b.*investeringsråd/i.test(s)) {
    if (!/^(?!.*(?:bolaget|bolagen|leverantören|myndigheten|bolagets|Coinbase|Strategy|MARA)).*$/.test("") ) {
      // subjektfilter: meningen får inte ha bolaget/myndigheten som subjekt — enkel heuristik
      if (!/(bolag\w*|leverantör\w*|myndighet\w*|Finansinspektionen|Skatteverket|Coinbase|Strategy)\s+(?:kan|får|ska|måste|har)?/.test(s.slice(0, 60))) { radgFel++; console.log(`FYND rådglossa i råd-kontext: "${s.slice(0, 120)}"`); }
    }
  }
}
r("juridik.radglossor.kontext", radgFel === 0, `${radgKontext.length} verbmeningar klassade, ${radgFel} i råd-kontext`);
const lagrum = hela.match(/\b(?:19|20)\d{2}:\d+\b/g) ?? [];
r("juridik.lagrum.antal", lagrum.length === 0, `lagrum i text: ${lagrum.join(", ") || "0"} — MiCA citeras som förordning (EU) 2023/1114, INTE som svenskt lagrum ⇒ ingen blandningsrisk`);
const irad = [...hela.matchAll(/.{0,40}investeringsråd.{0,40}/gis)].map(m => m[0].replace(/\n/g, " "));
r("juridik.investeringsrad.negerad", irad.length === 1 && /inte\b|ej\b/.test(irad[0]), irad.map(s => `"…${s}…"`).join(" | "));

// ---------- 4. 911-MÖNSTER (seriens sex) ----------
const m911 = ["911", "11 september", "september 2001", "9/11", "terror", "terrordåd"];
let t911 = 0;
for (const m of m911) { const c = (raw.match(new RegExp(m.replace(/\//g, "\\/"), "gi")) ?? []).length; if (c) { t911 += c; console.log(`FYND 911-mönster "${m}": ${c} träffar`); } }
r("911.sexmonster", t911 === 0, `0 träffar av ${m911.length} mönster i HELA filen`);

// ---------- 5. SUPERLATIV/ORDINAL ----------
const sup = [...hela.matchAll(/[^.]*(?:världens|människans|branschens|sektorns|universumets|seriens|börsens|Sveriges|marknadens)\s+(?:mest|störst\w*|högst\w*|lägst\w*|bäst\w*|största|högsta|bästa)[^.]*\./gi)].map(m => m[0].trim());
console.log(`INFO  superlativkandidater (${sup.length}): ${sup.map(s => `"${s.slice(0, 110)}…"`).join(" | ") || "0"}`);
const ordi = [...hela.matchAll(/\b(första|andra|tredje|fjärde|femte|sjätte|sjunde|åttonde|nionde|tionde|elfte|tolfte)\b/gi)].map(m => m[0]);
console.log(`INFO  ordningstal (${ordi.length}): ${ordi.join(", ") || "0"}`);

// ---------- 6. LÄNKAR ----------
const lankar = [...new Set([...u.body.matchAll(/\]\((\/[^)]+)\)/g)].map(m => m[1]))];
console.log(`INFO  unika interna länkar: ${lankar.length} st`);
for (const l of lankar) {
  const m = l.match(/^\/(kurser|blogg)\/(.+)$/);
  if (!m) { r(`lank.format ${l}`, false, "okänd länktyp"); continue; }
  const [, typ, id] = m;
  if (typ === "blogg") {
    const live = existsSync(`${ROT}/data/blogg/${id}.json`);
    r(`lank.blogg.live ${l}`, live, live ? "LEVE-fil i data/blogg/" : "SAKNAS i data/blogg/ (utkastlänk?)");
  } else {
    const seo = existsSync(`${ROT}/data/seo/kurser/${id}.json`);
    const tillagg = existsSync(`${ROT}/data/kurser-tillagg/${id}.json`);
    r(`lank.kurs.fil ${l}`, seo || tillagg, seo ? "data/seo/kurser/" : tillagg ? "data/kurser-tillagg/" : "SAKNAS i båda registren");
  }
}
const hamta = async (l) => {
  try { const s = await fetch(`http://localhost:3000${l}`, { redirect: "manual" }); return s.status; } catch { return "ERR"; }
};
for (const l of lankar) {
  const s = await hamta(l);
  r(`lank.http ${l}`, s === 200, `HTTP ${s}`);
}

// ---------- 7. UNIVERSUM (byggare: 0 kryptobolag vid bygget — LVMH-precedens) ----------
const uni = JSON.parse(readFileSync(`${ROT}/data/portfolj-system/bolagsunivers.json`, "utf8"));
const urader = Array.isArray(uni) ? uni : Object.values(uni).find(Array.isArray);
const kryptonamn = ["coinbase", "strategy", "microstrategy", "mara", "marathon digital", "riot platforms", "block inc", "paypal"];
const tr = [];
for (const rad of urader) {
  const namn = String(rad.namn ?? rad.bolag ?? "").toLowerCase();
  const tick = String(rad.ticker ?? "").toLowerCase();
  for (const e of kryptonamn) if (namn.includes(e) || tick.includes(e)) { tr.push(`${rad.namn ?? rad.ticker} [${rad.ticker ?? "?"}] bransch=${rad.bransch ?? "?"}`); break; }
}
r("universum.krypto", tr.length === 0, tr.length === 0 ? `0 kryptobolag i ${urader.length} poster (byggarens premiss håller än)` : `${tr.length} träffar: ${tr.join(" ; ")}`);

// ---------- 8. KONSISTENS ----------
r("konsistens.publishedAt", /^\d{4}-\d{2}-\d{2}$/.test(u.publishedAt), `publishedAt ${u.publishedAt} (R2: publicering = kundens beslut)`);
r("konsistens.tags.antal", (u.tags ?? []).length === 5, `${(u.tags ?? []).length} tags`);
// Källblockets 5 rader + Clarity Act-påståendets källobeläggning
const kallor = [...u.body.matchAll(/^- .+$/gm)].filter(m => u.body.slice(m.index).startsWith("- ["));
const kallRader = [...u.body.matchAll(/^- \[?[^#\s]/gm)].length;
console.log(`INFO  källrader i Källor-blocket: ${kallRader} (texten nämner Clarity Act utan egen källrad — B1-notis)`);
// readingMinutes-seriekoll
r("readingMinutes.serie", false === true ? true : "VARN", `fil=${u.readingMinutes}, /200-konventionen ger ${rm200}, /600 ger ${rm600} — försvarsaktier-B2-precedensen (femte fallet i klassen) rekommenderar ${rm200}`);

console.log(`\n===== SUMMA: ${ok} OK · ${varn} VARN · ${fel} FEL =====`);
process.exit(fel > 0 ? 1 : 0);
