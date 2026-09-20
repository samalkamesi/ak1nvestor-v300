#!/usr/bin/env node
/**
 * F5-STÄNGNING AV DOKTRINKLASSER (rond 124, [organ:Φ]) — maskinell
 * bedömning av fyndloggens två DOMKUMENTERADE F5-klasser, med bevis per rad:
 *
 *   KLASS A — "AGENTARBETSYTA-SYNK MISSLYCKADES": prod-synkens agentyte-skydd
 *   vägrar skriva över en yta med ocommittade ändringar (doktrin: "håll trädet
 *   committat — en smutsig yta får ALDRIG skrivas över"). Väntandet är
 *   DESIGNAT skydd, inte fel: fyndet är transient-design med fyndradens eget
 *   bevisfält som protokoll (o11 rotanalys + rond 121:s precedent-dom för
 *   samma klass + OPTIMERING/o125-kraschvakt-aterstallningsbevis-s8.md).
 *
 *   KLASS B — "hjartslag.log FEL: TypeError: fetch failed":hjärtats
 *   prod-mätning under deploy/omstart. Stängs ENDAST när prod-synk.log bär
 *   en deployhändelse (NY KOD/DEPLOYAD/bygg MISSLYCKADES/bygg OOM/MÅL
 *   återarmat) inom ±15 min för fel-tiden (fel-tiden står i fyndradens
 *   bevis och är hjärtslagets EGNA tidsstämpel). Ingen träff ⇒ raden lämnas
 *   ÖPPEN (ärlighet: okända fetch-fel döljs aldrig).
 *
 * Kontrakt: bedömningens ts = fyndradens EXAKTA ts (lage-nyckeln),
 * domdTs = nu, dom = giltig klass. Idempotent per nyckel. Fyndfilen är
 * append-only och rörs ALDRIG — bedömningar bor i ledgern (o22).
 *
 * Körs: node verktyg/f5-stang-klasser.mjs [--torr]  (--torr = räkna bara)
 * Läser prod-trädets fyndfil (sanningsägaren); bedömningar appendas i
 * ARBETSYTANS ledger som commit:as + push:as till prod (establisherat mönster).
 */
import fs from "node:fs";

const PROD = "/home/ak1a/AK1";
const YTA = "/home/ak1a/agent/ak1";
const FYND = `${PROD}/data/vakten/feljakt-fynd.jsonl`;
const SYNK = `${PROD}/data/vakten/prod-synk.log`;
const LEDGER = `${YTA}/data/vakten/feljakt-bedomningar.jsonl`;
const torr = process.argv.includes("--torr");
const nu = new Date().toISOString();

// ── inläsning ──────────────────────────────────────────────────────────────
const lasJsonl = (p) => {
  try {
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
};
const fynd = lasJsonl(FYND);
const bedomda = new Set(lasJsonl(LEDGER).map((b) => `${b.ts}|${b["spår"] ?? b.spar ?? ""}|${b.fynd ?? ""}`));

// deployhändelser ur prod-synk.log → epoch-ms ( båda tidsformfamiljerna:
// loggen bär Z-tider; hjärtslagets fel-tid tolkas i samma zona som synken)
const deployEvent = [];
try {
  const re = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z\s+(NY KOD|DEPLOYAD|MÅL återarmat|bygg MISSLYCKADES|bygg OOM-dödat|NEXT-LÄKEBACKUP)/g;
  const txt = fs.readFileSync(SYNK, "utf8");
  let m;
  while ((m = re.exec(txt)) !== null) {
    deployEvent.push({ ms: Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`), vad: m[5] });
  }
} catch { /* tom lista ⇒ klass B stänger inget */ }

const tolkaTid = (s) => {
  const m = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})/.exec(s || "");
  if (!m) return null;
  const ms = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
  return Number.isNaN(ms) ? null : ms;
};
const FONSTER = 15 * 60 * 1000;
const deployNara = (ms) => {
  if (ms === null) return null;
  let bast = null;
  for (const e of deployEvent) {
    const d = Math.abs(e.ms - ms);
    if (d <= FONSTER && (bast === null || d < bast.d)) bast = { d, vad: e.vad, ts: e.ms };
  }
  return bast;
};

// ── klassificering ─────────────────────────────────────────────────────────
const nya = [];
const rapport = { A: 0, B: 0, B_oppet: 0, hoppad: 0 };
for (const f of fynd) {
  const spar = f["spår"] ?? f.spar;
  const nyckel = `${f.ts}|${spar ?? ""}|${f.fynd ?? ""}`;
  if (spar !== "F5-logg" || bedomda.has(nyckel)) { if (spar === "F5-logg" && bedomda.has(nyckel)) rapport.hoppad++; continue; }
  const bevis = String(f.bevis ?? "");

  // KLASS A — agentyte-synkens designade väntan (bevisfältet ÄR protokollet)
  if (/AGENTARBETSYTA-SYNK MISSLYCKADES/.test(bevis)) {
    rapport.A++;
    nya.push({
      ts: f.ts, domdTs: nu, "spår": "F5-logg", allvar: f.allvar ?? "MEDEL",
      fynd: f.fynd, dom: "transient-design",
      rotorsaka: "Prod-synkens agentyte-skydd (o11 rotanalys): git pull --ff-only vägrar en yta med ocommittade ändringar — doktrinen 'håll trädet committat; en smutsig yta får ALDRIG skrivas över' gör väntandet DESIGNAT skydd, inte fel. Fyndradens bevisfält bär själva skyddsraden.",
      kur: "Doktrin (träd committat i små steg) + rond 121-precedenten för samma klass. Massstängning rond 124 med per-rad-nyckel — klassen är stängd som domkategori; nya rader av exakt denna signatur stängs mekaniskt.",
      bevis: `Fyndradens eget bevis: "${bevis.slice(0, 140)}"`,
      lag: "2 (rot: doktrinskydd, känt sedan o11) · 3 (maskinell bedömning per exakt nyckel) · 6 (klassens andra framträdande kurat med precedent)",
      protokoll: "rond 124 [organ:Φ] + OPTIMERING/o11-feljakt-f5-rotorsaksfix.md + rond 121-precedens + o125",
    });
    continue;
  }

  // KLASS B — hjärtslagets fetch-fel, ENDAST med deploy-tidsbevis
  if (/hjartslag\.log/.test(f.fynd ?? "") && /fetch failed/.test(bevis)) {
    const felMs = tolkaTid(bevis);
    const traff = deployNara(felMs);
    if (!traff) { rapport.B_oppet++; continue; } // okända fetch-fel döljs aldrig
    rapport.B++;
    const iso = (ms) => new Date(ms).toISOString().slice(0, 19) + "Z";
    nya.push({
      ts: f.ts, domdTs: nu, "spår": "F5-logg", allvar: f.allvar ?? "MEDEL",
      fynd: f.fynd, dom: "transient-design",
      rotorsaka: "Hjärtats prod-mätning (fetch) under deploy/omstart — deployfönsterdoktrinen (o47 §2, systematiserad o113): vaktlösning kan inte mäta mitt i ett pågående bygg/omstart av appen.",
      kur: "Doktrin; klassen även kurad i F3 (rot-sond + åldergrind rond 122–123) och F6 (deploygrind).",
      bevis: `Tidsbevis: fel ${iso(felMs)} och prod-synk-händelse "${traff.vad}" ${iso(traff.ts)} (Δ ${Math.round(traff.d / 1000)} s, fönster ±900 s) — ur prod-synk.log.`,
      lag: "1 (tidsbevis maskinellt ur synkloggen) · 2 (rot: deployfönster) · 6 (dom med giltig klass)",
      protokoll: "rond 124 [organ:Φ] + o113 §driftfönster + o125",
    });
  }
}

// ── skriv + rapport ────────────────────────────────────────────────────────
if (torr || nya.length === 0) {
  console.log(`F5-STÄNGNING ${torr ? "(torrkörning)" : "(inget nytt)"}: klass A=${rapport.A} · klass B(stängd)=${rapport.B} · klass B(lämnad öppen, inget deploybevis)=${rapport.B_oppet} · redan bedömda hoppade=${rapport.hoppad}`);
  process.exit(0);
}
fs.appendFileSync(LEDGER, nya.map((b) => JSON.stringify(b)).join("\n") + "\n");
console.log(`F5-STÄNGNING: ${nya.length} bedömningar appendade i ytans ledger (klass A=${rapport.A} · klass B=${rapport.B} · B lämnad öppen=${rapport.B_oppet} · hoppade=${rapport.hoppad}). Commit + push + prod-lage-verifiering återstår.`);
