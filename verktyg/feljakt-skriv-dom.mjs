#!/usr/bin/env node
/**
 * FELJAKT-SKRIV-DOM (spår 8, o145) — den ENDA vägen att skriva bedömningar
 * =====================================================================
 * Rotorsaka (bevisad i o145 §2–§3, 8 rader): bedömningar skrevs för hand med
 * (a) fritext i dom-fältet ("äkta + LÄKT", "frisk — …") — feljakt-lage.mjs
 * ignorerar raden (VARN "ogiltig domklass") och dess fynd förblir öppet
 * trots äkta bedömning; och (b) hemgjorda nycklar (bedömarens egen tid och
 * spår-etikett i stället för fyndradens exakta ts|spår|fynd — t.o.m. en-
 * dash mot bindestreak skilde) — raden matchar ALDRIG någon fyndrad och
 * döljer sanningen åt fel håll.
 *
 * KUR: detta verktyg är skrivgrinden. Det VÄGRAR:
 *   - dom utanför de fyra giltiga klasserna;
 *   - nyckel som inte matcher EXAKT EN fyndrad i feljakt-fynd.jsonl
 *     (exakt nyckel först; annars entydig prefix på "ts|spår|fynd");
 *   - bedömning utan fyndrad överhuvud taget — eskalerings-bedömningar
 *     hör inte i fynd-ledgern (o145 §3: de två hemlösa arkiverades).
 * Inga undantagsflaggor: kontraktet ska vara omöjligt att missa.
 *
 * Kontrakt: bedömningens ts/spår/fynd/allvar KOPIERAS ur fyndraden (aldrig
 * handskrivna), domdTs = nu, raden appendas som EN JSON-rad. Filhuvudet i
 * feljakt-lage.mjs (o22/o69) gäller oförändrat.
 *
 * Körs:
 *   node verktyg/feljakt-skriv-dom.mjs --fynd "<ts>|<spår>|<fynd (eller prefix)>" \
 *     --dom rotkurad --rotorsaka "…" --kur "…" --bevis "…" [--lag "…"] \
 *     --protokoll "o145 §4" [--vaktkatalog=/tmp/test]
 * Exit: 0 = skriven (kvitto med nyckel), 1 = avslag (orskak på stdout).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argKat = process.argv.find((a) => a.startsWith("--vaktkatalog="));
const VAKT = argKat ? argKat.slice("--vaktkatalog=".length) : path.join(ROT, "data", "vakten");
const FYNDLOGG = path.join(VAKT, "feljakt-fynd.jsonl");
const LEDGER = path.join(VAKT, "feljakt-bedomningar.jsonl");

const DOMER = ["falskt-pos", "rotkurad", "pagaende", "transient-design"];
const avslag = (orsak) => {
  console.log(JSON.stringify({ ok: false, fel: orsak }));
  process.exit(1);
};

const arg = (namn) => {
  const i = process.argv.indexOf(namn);
  if (i !== -1) return process.argv[i + 1] ?? true;
  const pre = namn + "=";
  const a = process.argv.find((x) => x.startsWith(pre));
  return a ? a.slice(pre.length) : undefined;
};

const nyckelMal = arg("--fynd");
const dom = arg("--dom");
const rotorsaka = arg("--rotorsaka");
const kur = arg("--kur");
const bevis = arg("--bevis");
const lag = arg("--lag");
const protokoll = arg("--protokoll");

if (!nyckelMal || typeof nyckelMal !== "string") avslag("--fynd krävs: \"<ts>|<spår>|<fynd eller prefix\"");
if (!dom) avslag("--dom krävs");
if (!DOMER.includes(dom)) avslag(`ogiltig dom "${dom}" — giltiga: ${DOMER.join(" · ")} (fritext-dom är den klass o145 §3 kurade)`);
if (!rotorsaka) avslag("--rotorsaka krävs (dom utan rotorsaka är ingen bedömning)");
if (!bevis) avslag("--bevis krävs (Lag 1: färsk mätning/gravning)");

if (!fs.existsSync(FYNDLOGG)) avslag(`fyndlogg saknas: ${FYNDLOGG}`);

const fyndRader = fs.readFileSync(FYNDLOGG, "utf8").split("\n").filter((r) => r.trim())
  .map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
const nk = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;

let taff = fyndRader.filter((f) => nk(f) === nyckelMal);
let metod = "exakt";
if (!taff.length) {
  taff = fyndRader.filter((f) => nk(f).startsWith(nyckelMal));
  metod = "prefix";
}
if (!taff.length) {
  const narhet = fyndRader.filter((f) => (f.fynd ?? "").includes(nyckelMal.split("|")[2] ?? "\u0000"));
  avslag(`nyckeln matchar ingen fyndrad — den ÄR nyckelglidning (o145 §2b). ${narhet.length} fynd med liknande text: ${narhet.slice(0, 3).map((f) => nk(f)).join(" ;; ")}`);
}
if (metod === "prefix" && taff.length > 1) {
  avslag(`nyckeln matchar ${taff.length} OLIKA fyndrader (tvetydig) — förläng prefixet. Kandidater: ${taff.slice(0, 3).map((f) => nk(f)).join(" ;; ")}`);
}
// exakt nyckel med FLER än en identisk fyndrad = o69-kollisionsgrupp: basdom
// (utan bevisHash) är KONTRAKTET som täcker hela gruppen i feljakt-lage —
// tillåts, med antalTäckta i kvittot så täckningen aldrig är tyst.

const f = taff[0];
if (metod === "exakt" && taff.length > 1) metod = "kollisionsgrupp";
const rad = {
  ts: f.ts,
  "spår": f["spår"] ?? f.spar ?? null,
  allvar: f.allvar ?? null,
  fynd: f.fynd,
  dom,
  domdTs: new Date().toISOString(),
  rotorsaka,
  ...(kur ? { kur } : {}),
  bevis,
  ...(lag ? { lag } : {}),
  ...(protokoll ? { protokoll } : {}),
  skrivverktyg: "feljakt-skriv-dom (o145)",
};

const befintlig = fs.existsSync(LEDGER) ? fs.readFileSync(LEDGER, "utf8") : "";
if (befintlig && !befintlig.endsWith("\n")) avslag("ledgern slutar utan radbrytning — vägrar skriva (korrupt radrisk)");
fs.appendFileSync(LEDGER, JSON.stringify(rad) + "\n");
console.log(JSON.stringify({ ok: true, metod, antalTäckta: taff.length, nyckel: nk(f).slice(0, 120), dom, domdTs: rad.domdTs }));
