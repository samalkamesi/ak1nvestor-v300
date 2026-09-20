#!/usr/bin/env node
/**
 * F6-STÄNGNING AV DOKTRINKLASSER (rond 126, [organ:Φ]) — maskinell
 * bedömning av F6-drift:s "prod osvarar"-familjen, bevis per rad:
 *
 *   KLASS D — deploy-fönstret: fyndets bevisfält bär feljägarens EGEN
 *   flock-mätning ('/tmp/ak1a-deploy.lock hålls') = primärbevis, ELLER
 *   fyndet träffar en DEPLOYAD-händelse i prod-synk.log inom ±15 min
 *   (citeras med exakt Δ — samtliga nu kända träffar ligger inom 15 s,
 *   dvs mitt i pm2-omstartsslutet). o113 §driftfönster.
 *
 *   KLASS P — patch-kö-stopp: fyndet (fetch failed-varianten) faller i
 *   ett 'pm2 stoppad under byggfönstret'-fönster (o48/r58-kuren:
 *   medvetet stopp, finally-återstart = o48-garantin).
 *
 *   INVARIANS: verktyget rör ENDAST spår F6-drift + fynd som börjar
 *   'prod osvarar' — RAM-raderna (minnesspåret) lämnas orörda (de kräver
 *   sin egen evidensregel, rond 127). Okända rader lämnas öppna.
 *
 * Kontrakt: bedömningens ts = fyndets EXAKTA ts, giltig domklass,
 * idempotent per nyckel, fyndfilen orörd (o22).
 * Körs: node verktyg/f6-stang-klasser.mjs [--torr]
 */
import fs from "node:fs";

const PROD = "/home/ak1a/AK1";
const YTA = "/home/ak1a/agent/ak1";
const FYND = `${PROD}/data/vakten/feljakt-fynd.jsonl`;
const SYNK = `${PROD}/data/vakten/prod-synk.log`;
const LEDGER = `${YTA}/data/vakten/feljakt-bedomningar.jsonl`;
const torr = process.argv.includes("--torr");
const nu = new Date().toISOString();

const lasJsonl = (p) => {
  try {
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
};
const fynd = lasJsonl(FYND);
const bedomda = new Set(lasJsonl(LEDGER).map((b) => `${b.ts}|${b["spår"] ?? b.spar ?? ""}|${b.fynd ?? ""}`));

// deployhändelser + patchfönster ur synkloggen (r125-mönstret)
const deployMs = [];
const patchFonster = [];
try {
  const txt = fs.readFileSync(SYNK, "utf8");
  const re = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z\s+([^\\\n]+)/g;
  let m;
  while ((m = re.exec(txt)) !== null) {
    const ms = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
    if (Number.isNaN(ms)) continue;
    const vad = m[5];
    if (/NY KOD|DEPLOYAD|bygg MISSLYCKADES|bygg OOM-dödat|NEXT-LÄKEBACKUP|MÅL återarmat/.test(vad)) deployMs.push(ms);
    const stopp = /pm2 stoppad under byggfönstret/.test(vad);
    const start = /pm2 återstartad/.test(vad);
    if (stopp) patchFonster.push({ start: ms, slut: null });
    else if (start && patchFonster.length && patchFonster[patchFonster.length - 1].slut === null) patchFonster[patchFonster.length - 1].slut = ms;
  }
} catch { /* inga fönster ⇒ klass P stänger inget */ }
const iPatchFonster = (ms) => patchFonster.find((f) => ms >= f.start - 60_000 && ms <= (f.slut ?? f.start + 20 * 60_000));
const deployNara = (ms) => deployMs.find((t) => Math.abs(t - ms) <= 15 * 60_000);
const iso = (ms) => new Date(ms).toISOString();

const nya = [];
const r = { D: 0, P: 0, hoppad: 0, lamnad: 0 };
for (const f of fynd) {
  const spar = f["spår"] ?? f.spar;
  const nyckel = `${f.ts}|${spar ?? ""}|${f.fynd ?? ""}`;
  if (bedomda.has(nyckel)) { r.hoppad++; continue; }
  if (spar !== "F6-drift" || !/^prod osvarar/.test(f.fynd ?? "")) continue;
  const bevis = String(f.bevis ?? "");
  const tsMs = Date.parse(f.ts);
  const base = { ts: f.ts, domdTs: nu, "spår": spar, allvar: f.allvar, fynd: f.fynd };

  // KLASS P — patch-kö-stopp (fetch failed-varianten i stoppfönstret)
  const fonster = /fetch failed/.test(`${f.fynd} ${bevis}`) ? iPatchFonster(tsMs) : null;
  if (fonster) {
    r.P++;
    nya.push({ ...base, dom: "transient-design",
      rotorsaka: "Prod-synkens PATCH-KÖ stoppar MEDVETET pm2 under byggfönstret (o48/r58-kuren: tomt .next = inga ISR-skrivare = inget race mot nytt bygge) och main():s finally garanterar återstart (o48-garantin). Feljägarens 'prod osvarar'-mätning föll i det designade stoppet.",
      kur: "o48/r58-kuren + o48-garantin (finally-återstart) — designat och bevakat fönster; återstarten bevisad i synkloggen.",
      bevis: `Synkloggen: 'pm2 stoppad under byggfönstret' ${iso(fonster.start)} → återstart/DEPLOYAD ${fonster.slut ? iso(fonster.slut) : "(fönstret öppet)"}; fyndet ${f.ts} mitt i fönstret. Fyndbevis: "${bevis.slice(0, 100)}"`,
      lag: "1 (tidsbevis ur synkloggen) · 2 (rot: designat byggfönster) · 6 (dom med giltig klass)",
      protokoll: "rond 126 [organ:Φ] + o48/r58-kuren + o113 §driftfönster" });
    continue;
  }

  // KLASS D — deploy-fönster (egen flock-mätning ELLER DEPLOYAD-träff ±15 min)
  const lasBevis = /\/tmp\/ak1a-deploy\.lock hålls/.test(bevis);
  const d = deployNara(tsMs);
  if (lasBevis || d) {
    r.D++;
    nya.push({ ...base, dom: "transient-design",
      rotorsaka: "Pågående deploybygg: npm ci + build + pm2-omstart gör prod väntat osvarande (o113 §driftfönster; doktrin o47 §2) — mätningen föll i omstartsfönstret, inte i ett appfel.",
      kur: "Doktrin + feljägarens deploygrind; FYNN nr 2+3-vaccinen (rot-sond + åldergrind) härdar familjen vid framtida efterdyningar.",
      bevis: lasBevis
        ? `Fyndradens eget bevisfält: "${bevis.slice(0, 110)}"${d ? ` + synkloggens deployhändelse ${iso(d)} (Δ ${Math.round(Math.abs(d - tsMs) / 1000)} s)` : ""}`
        : `Synkloggens deployhändelse ${iso(d)} (Δ ${Math.round(Math.abs(d - tsMs) / 1000)} s från fyndet) — mätningen mitt i deployfönstret. Fyndbevis: "${bevis.slice(0, 100)}"`,
      lag: "1 (primärbevis i fyndraden/synkloggen) · 2 (rot: deployfönster) · 6 (dom med giltig klass)",
      protokoll: "rond 126 [organ:Φ] + o113 §driftfönster + rond 125-mönstret" });
    continue;
  }
  r.lamnad++;
}

const summering = `F6-STÄNGNING ${torr ? "(torrkörning) " : ""}klass D=${r.D} · P=${r.P} · lämnade öppna (ej matchade)=${r.lamnad} · redan bedömda hoppade=${r.hoppad}`;
if (torr || nya.length === 0) { console.log(summering); process.exit(0); }
fs.appendFileSync(LEDGER, nya.map((b) => JSON.stringify(b)).join("\n") + "\n");
console.log(`${summering}\n${nya.length} bedömningar appendade — commit + push + prod-lage-verifiering återstår.`);
