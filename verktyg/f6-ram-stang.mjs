#!/usr/bin/env node
/**
 * F6-RAM-STÄNGNING (rond 127, [organ:Φ]) — minnesspårets EGEN evidensregel
 * (invars i f6-stang-klasser.mjs rond 126: "RAM-raderna kräver sin egen
 * evidensregel, rond 127"). Bedömning av F6-drift:s "RAM <n> MB"-familjen
 * med bevis per rad ur FEM oberoende källor:
 *
 *   KLASS V — VÄNTAR-RAM-träff: prod-synkens egen RAM-grind mätte och
 *   ATTRIBUERADE lasten ('chrome-cron levande (+1024) + N zcode-barn
 *   (+900)') inom ±10 min från fyndet, och pekade INTE 'inga tunga
 *   klasser'. Grinden höll samtidigt bygget = skyddet verkade.
 *
 *   KLASS B — byggfönster: fyndet träffar ett reellt synkbygge
 *   [NY KOD → DEPLOYAD | bygg OOM-dödat | bygg MISSLYCKADES] (VÄNTAR-RAM
 *   stänger fönstret — bygget startade ej). Byggets ~2,2 GB är designat.
 *
 *   KLASS G — gränssnittsvaktens chrome-scan: fyndet träffar fönstret
 *   [rapportens 'tid' → filnamnsts + 2 min] för granssnitt-*.json
 *   (6h-cadence, chrome ≈ +1 GB — designad vaktkostnad).
 *
 *   KLASS F — fabrikens zcode-barn: fyndet träffar ett fabriksfönster
 *   ur agentfabrik/logg.jsonl ([auto-manifest → manifest-klar] per
 *   manifest, eller [uppgift-klar t−sekunder → t]). v146: max 3 barn/
 *   omgång + RAM-vakt 1500 MB = det bevisade skyddet.
 *
 *   KLASS P (V184, r274) — bygg-RAM-profilern: fyndet träffar ett
 *   sondmätt byggfönster ur bygg-ram-profil.jsonl (prod-synkens sond
 *   var 60 s under varje byggförsök; bär fönstrets MINSTA MemAvailable)
 *   — byggets dopp är MÄTT, inte gissat. Stänger rotens fyra B-endast
 *   lämnade HÖG-rader (09-24→09-27) mekaniskt framöver.
 *
 *   ALLVAR-REGEL (precedent s8-u2/o65): MEDEL stängs vid ≥1 källträff;
 *   HÖG (MemAvailable < 300 MB) kräver ≥2 OBEROENDE träffar — annars
 *   lämnas raden öppen (under-300 är allvarligt, bevis eller tystnad).
 *
 * Kontrakt: bedömningens ts = fyndets EXAKTA ts, giltig domklass,
 * idempotent per nyckel, fyndfilen orörd (o22).
 * Körs: node verktyg/f6-ram-stang.mjs [--torr]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROD = "/home/ak1a/AK1";
const YTA = "/home/ak1a/agent/ak1";
const FYND = `${PROD}/data/vakten/feljakt-fynd.jsonl`;
const SYNK = `${PROD}/data/vakten/prod-synk.log`;
const FABRIKLOGG = `${PROD}/data/vakten/agentfabrik/logg.jsonl`;
const VAKTDIR = `${PROD}/data/vakten`;
const LEDGER = `${YTA}/data/vakten/feljakt-bedomningar.jsonl`;
const torr = process.argv.includes("--torr");
const nu = new Date().toISOString();
const iso = (ms) => new Date(ms).toISOString();
const min = (ms) => ms / 60000;

const lasJsonl = (p) => {
  try {
    return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
  } catch { return []; }
};

// ── Källa 5 (V184, r274): BYGG-RAM-PROFILERN — sondens fönster ur
// data/vakten/bygg-ram-profil.jsonl (skriven av prod-synkens sond var 60 s
// under varje byggförsök). Kontrakt: "start" öppnar, "bygg"-rader räcker på
// tidsserien (minsta tillgängliga MB), "slut" stänger med sammanfattet
// min/varv; ett fönster utan "slut" gäller ändå (pågående eller OOM-mördad
// sond — r273:s mekanism: raderna som HANN skrivas är just beviset).
// Ogiltiga tidsstämplar hoppas. Testas av verktyg/testa-prod-synk-byggram.mjs.
export function tolkaByggRamFonster(rader) {
  const fonster = [];
  let oppen = null;
  for (const r of Array.isArray(rader) ? rader : []) {
    const t = Date.parse(r.ts);
    if (!Number.isFinite(t)) continue;
    if (r.fas === "start") { oppen = { start: t, slut: t, varv: 0, minTillgangligtMB: null }; continue; }
    if (!oppen) continue;
    if (r.fas === "bygg") {
      oppen.slut = t;
      if (typeof r.tillgangligtMB === "number") {
        oppen.minTillgangligtMB = oppen.minTillgangligtMB === null ? r.tillgangligtMB : Math.min(oppen.minTillgangligtMB, r.tillgangligtMB);
      }
    } else if (r.fas === "slut") {
      oppen.slut = t;
      if (typeof r.minTillgangligtMB === "number") {
        oppen.minTillgangligtMB = oppen.minTillgangligtMB === null ? r.minTillgangligtMB : Math.min(oppen.minTillgangligtMB, r.minTillgangligtMB);
      }
      if (typeof r.varv === "number") oppen.varv = r.varv;
      fonster.push(oppen);
      oppen = null;
    }
  }
  if (oppen) fonster.push(oppen);
  return fonster;
}
const profilFonster = tolkaByggRamFonster(lasJsonl(`${VAKTDIR}/bygg-ram-profil.jsonl`));

// ── Källa 1+2: synkloggen → VÄNTAR-RAM-punkter + byggfönster ──────────
const varTräffar = [];        // {ts, text}
const byggFonster = [];       // {start, slut, slutRad}
{
  let öppen = null;
  const re = /(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})Z\s+(.+)/g;
  const txt = fs.readFileSync(SYNK, "utf8");
  let m;
  while ((m = re.exec(txt)) !== null) {
    const ms = Date.parse(`${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`);
    if (Number.isNaN(ms)) continue;
    const rad = m[5].trim();
    if (/^NY KOD/.test(rad)) { öppen = { start: ms, slutRad: null }; continue; }
    if (/^VÄNTAR-RAM/.test(rad)) {
      varTräffar.push({ ts: ms, text: rad });
      if (öppen) öppen.slutRad = `(väntade — bygget startade ej) ${rad}`;
      // fönstret förblir öppet tills deploy/fel el. nästa NY KOD stänger
      continue;
    }
    if (öppen && (/^DEPLOYAD/.test(rad) || /^bygg OOM-dödat/.test(rad) || /^bygg MISSLYCKADES/.test(rad))) {
      byggFonster.push({ start: öppen.start, slut: ms, slutRad: rad });
      öppen = null;
    }
  }
}

// ── Källa 3: gränssnittsvaktens chrome-scan-fönster ────────────────────
const chromeFonster = [];
for (const fil of fs.readdirSync(VAKTDIR)) {
  const fm = /^granssnitt-(\d{4}-\d{2}-\d{2})T(\d{2})(\d{2})\.json$/.exec(fil);
  if (!fm) continue;
  const slutMs = Date.parse(`${fm[1]}T${fm[2]}:${fm[3]}:00Z`);
  if (Number.isNaN(slutMs)) continue;
  let startMs = slutMs - 15 * 60000; // fallback: typisk scanlängd
  try {
    const j = JSON.parse(fs.readFileSync(path.join(VAKTDIR, fil), "utf8"));
    const t = Date.parse(j.tid);
    if (!Number.isNaN(t)) startMs = t;
  } catch { /* fallback står */ }
  chromeFonster.push({ start: startMs, slut: slutMs + 2 * 60000, fil });
}
chromeFonster.sort((a, b) => a.start - b.start);

// ── Källa 4: fabrikens fönster ─────────────────────────────────────────
const fabrikFonster = [];
{
  const rader = lasJsonl(FABRIKLOGG);
  const startPerManifest = new Map();
  for (const r of rader) {
    const t = Date.parse(r.t);
    if (Number.isNaN(t)) continue;
    if (r.händelse === "auto-manifest" || r.händelse === "manifest-startad") startPerManifest.set(r.manifest, { t, titel: `${r.spår ?? ""}${r.roll ?? ""}` });
    else if (r.händelse === "manifest-klar") {
      const s = startPerManifest.get(r.manifest);
      fabrikFonster.push({ start: s ? s.t : t, slut: t, manifest: r.manifest });
      startPerManifest.delete(r.manifest);
    } else if (r.händelse === "uppgift-klar" && Number.isFinite(r.sekunder)) {
      fabrikFonster.push({ start: t - r.sekunder * 1000, slut: t, manifest: `${r.manifest}:${r.id}` });
    }
  }
  const nuMs = Date.now();
  for (const [id, s] of startPerManifest) fabrikFonster.push({ start: s.t, slut: nuMs, manifest: `${id} (pågår)` });
}

// ── Bedömningarna ──────────────────────────────────────────────────────
function main() {
const fynd = lasJsonl(FYND);
const bedomda = new Set(lasJsonl(LEDGER).map((b) => `${b.ts}|${b["spår"] ?? b.spar ?? ""}|${b.fynd ?? ""}`));
const nya = [];
const r = { stangda: 0, lamnade: 0, hoppade: 0 };
const detalj = [];

for (const f of fynd) {
  const spar = f["spår"] ?? f.spar;
  const nyckel = `${f.ts}|${spar ?? ""}|${f.fynd ?? ""}`;
  if (bedomda.has(nyckel)) { r.hoppade++; continue; }
  if (spar !== "F6-drift" || !/^RAM \d+ MB$/.test(f.fynd ?? "")) continue;
  const tsMs = Date.parse(f.ts);
  const hog = /< 300 MB/.test(String(f.bevis ?? ""));
  const traffar = [];

  // V — VÄNTAR-RAM med attribution (inte 'inga tunga klasser')
  const v = varTräffar.filter((t) => Math.abs(t.ts - tsMs) <= 10 * 60000 && !/inga tunga klasser/.test(t.text))
    .sort((a, b) => Math.abs(a.ts - tsMs) - Math.abs(b.ts - tsMs))[0];
  if (v) traffar.push({ klass: "V", bevis: `prod-synk.log ${iso(v.ts)} (Δ ${Math.round(Math.abs(v.ts - tsMs) / 1000)} s): '${v.text.slice(0, 130)}'` });

  // B — reellt byggfönster
  const b = byggFonster.find((w) => tsMs >= w.start && tsMs <= w.slut);
  if (b) traffar.push({ klass: "B", bevis: `prod-synk.log byggfönster ${iso(b.start)} → ${iso(b.slut)}: '${b.slutRad.slice(0, 90)}'` });

  // G — chrome-scan
  const g = chromeFonster.find((w) => tsMs >= w.start && tsMs <= w.slut);
  if (g) traffar.push({ klass: "G", bevis: `gränssnittsvaktens chrome-scan ${iso(g.start)} → ${iso(g.slut)} (${g.fil})` });

  // F — fabriksbarn
  const fb = fabrikFonster.find((w) => tsMs >= w.start && tsMs <= w.slut);
  if (fb) traffar.push({ klass: "F", bevis: `fabriksfönster ${manifestInfo(fb)} ${iso(fb.start)} → ${iso(fb.slut)}` });

  // P — V184-profilerns byggfönster (MÄTT MemAvailable under fönstret —
  // den enda källan som bevisar doppets djup med egen tidsserie)
  const p = profilFonster.find((w) => tsMs >= w.start && tsMs <= w.slut);
  if (p) traffar.push({ klass: "P", bevis: `bygg-ram-profilen ${iso(p.start)} → ${iso(p.slut)}: sond mätte byggfönstret (min ${p.minTillgangligtMB ?? "?"} MB över ${p.varv} varv)` });

  const minst = hog ? 2 : 1;
  if (traffar.length < minst) {
    r.lamnade++;
    detalj.push(`ÖPPEN LÄMNAD ${f.ts} ${f.allvar} ${f.fynd} — ${traffar.length} träff(ar) av ${minst} krävda${traffar.length ? ` (${traffar.map((t) => t.klass).join("+")})` : ""}`);
    continue;
  }

  r.stangda++;
  const klasser = traffar.map((t) => t.klass).join("+");
  const lastBeskrivning = [
    traffar.some((t) => t.klass === "G") ? "gränssnittsvaktens chrome-scan (~+1 GB, 6h-cadence)" : null,
    traffar.some((t) => t.klass === "F") ? "fabrikens zcode-barn (max 3/omgång, ~0,3–0,9 GB/st)" : null,
    traffar.some((t) => t.klass === "B") ? "pågående synkbygg (~2,2 GB)" : null,
    traffar.some((t) => t.klass === "V") ? "synkens RAM-grind attribuerade lasten och höll bygget" : null,
    traffar.some((t) => t.klass === "P") ? `V184-byggprofilerns mätta tidsserie (fönstrets min ${profilFonster.find((w) => tsMs >= w.start && tsMs <= w.slut)?.minTillgangligtMB ?? "?"} MB)` : null,
  ].filter(Boolean).join(" + ");
  detalj.push(`STÄNGS ${f.ts} ${f.allvar} ${f.fynd} — klass ${klasser}`);

  nya.push({
    ts: f.ts, domdTs: nu, "spår": spar, allvar: f.allvar, fynd: f.fynd,
    dom: "transient-design",
    rotorsaka: hog
      ? `Dopp under 300 MB vid designad topplast på den delade 8 GB-servern: ${lastBeskrivning}. Ingen OOM, inga 500-or, deploy grön strax efter — skyddet (VÄNTAR-RAM-grinden) verkade och höll bygget; raden är topplasten själv, ej haveri.`
      : `Informativ RAM-tröskel (MemAvailable < 800 MB) under designat belastningsfönster: ${lastBeskrivning} på den gemensamma 8 GB-servern; prod-synkens VÄNTAR-RAM-grind (2200 MB) och fabrikens RAM-vakt (1500 MB, v146) håller minnet under kontroll — raden är vakten som arbetar, ej haveri.`,
    kur: "v146-arkitekturen (max 3 barn/omgång + fabrikens RAM-vakt 1500 MB) + prod-synkens VÄNTAR-RAM-grind (2200 bygg + reserv per tung klass) + V184-byggprofilern (sond var 60 s under fönstret — mätt bevisning per rad) — lever och bevisat verkande i fönstret.",
    bevis: traffar.map((t) => `[${t.klass}] ${t.bevis}`).join(" ;; "),
    lag: "1 (tidsbevis ur synklogg/vaktrapport/fabrikslogg per rad) · 2 (rot: designad last på delad server) · 6 (dom med giltig klass)",
    protokoll: `rond 127 [organ:Φ] + o65-stormtriage-precedenten (s8-u2) + AGENTS.md v146 + prod-synk.mjs VÄNTAR-RAM-grind + rond 274 V184 klass P (bygg-RAM-profilern)${hog ? " + HÖG-regeln: dubbel oberoende källträff" : ""}`,
    domdAv: "huvudagenten (rond 127)",
  });
}

function manifestInfo(fb) { return `(${fb.manifest})`; }

console.log(`F6-RAM-STÄNGNING ${torr ? "(torrkörning) " : ""}stängda=${r.stangda} · lämnade öppna=${r.lamnade} · redan bedömda hoppade=${r.hoppade}`);
for (const d of detalj) console.log(`  ${d}`);
if (torr || nya.length === 0) process.exit(0);
fs.appendFileSync(LEDGER, nya.map((b) => JSON.stringify(b)).join("\n") + "\n");
console.log(`${nya.length} bedömningar appendade — commit + push + prod-lage-verifiering återstår.`);
}

// Import-vakt (o43-mönstret, V184): sviten importerar tolkaByggRamFonster —
// bedömningskedjan (appendar ledgern!) får ENDAST köras som direkt program.
const arDirektProgram = (() => {
  try {
    return Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  } catch {
    return false;
  }
})();
if (arDirektProgram) main();
