#!/usr/bin/env node
/**
 * FELJÄKT-LÄGE (spår 8, o22) — fyndloggens SANNA öppna läge
 * =====================================================================
 * Rotorsakan detta verktyg kurerar: fynd i feljakt-fynd.jsonl saknar
 * bedömningsstatus — varje läsare (rond, session, pulshjärta) måste
 * om-gräva arkivet för att skilja äkta fynd från bevisat falska.
 * Bevisat pris: o14-f7 lade en hel våg på att motbevisa KRITISK-
 * nyckelfyndet från feljägarens födelseminut; 2026-09-16 03:57Z
 * felmärktes en lasttimeout som syntaxfel (filen grön + orörd i 6 dygn)
 * och lär ha kostat nästa rond samma gravning.
 *
 * MEKANISM: fyndloggen förblir append-only och orörd (feljägarens
 * ägodata). Bedömningar bor i SEPARAT ledger data/vakten/feljakt-
 * bedomningar.jsonl — en rad per PROTOKOLLBEVISAD klassificering:
 *   falskt-pos        fyndet var aldrig äkta (bevis i protokoll)
 *   rotkurad          äkta fynd, rot kurad, klassen kommer inte tillbaka
 *   pagaende          äkta fynd, rot känd, åtgärd pågår (visas, räknas ej öppet)
 *   transient-design  designat avbrott (t.ex. deployfönster) med protokollbevis
 *
 * Matchnyckel: (ts, spår, fynd) — ts ensam räcker ej (fynd skrivs i
 * salvor samma sekund). Flera bedömningar på samma nyckel: senaste
 * domdTs vinner. Bedömning utan matchande fynd varnas (änkla) så att
 * en roterad fyndlogg aldrig döljer sanning.
 *
 * NYCKELKONTRAKTET (o69, 2026-09-18 — härdning av o65 §5 F1):
 * basnyckeln kan KOLLIDERA när F5:s generiska fyndtext matchar två
 * loggrader i samma millisekunds-skanning (bevisat ×2 09-17). Därför:
 * kollisionsgrupp = flera fyndrader med samma basnyckel; en bedömning
 * med valfritt fält `bevisHash` (10 hex av sha256 på fyndradens bevis)
 * matchar ENDAST raden med den hashen (precis dom); bedömning utan
 * fältet täcker hela gruppen (legacy — de historiska radernas kontrakt
 * är heligt). Per rad vinner senaste domdTs; oavgjort ⇒ precis dom.
 * Kollisionsgrupper rapporteras explicit (de döljer annars en
 * tvetydighet: en bedömning som täcker två rader).
 *
 * Körs: på begäran av ronder/sessioner (läsverktyg, exit 0 alltid —
 * läget är information, inte ett grind beslut).
 *   node verktyg/feljakt-lage.mjs
 *   node verktyg/feljakt-lage.mjs --vaktkatalog=/tmp/feljaktlagetest
 */
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOMER = ["falskt-pos", "rotkurad", "pagaende", "transient-design"];

// ── inläsning ──────────────────────────────────────────────────────────────
const argKatalog = process.argv.find((a) => a.startsWith("--vaktkatalog="));
const VAKT = argKatalog ? argKatalog.slice("--vaktkatalog=".length) : path.join(ROT, "data", "vakten");
const FYNDLOGG = path.join(VAKT, "feljakt-fynd.jsonl");
const BEDOMNINGAR = path.join(VAKT, "feljakt-bedomningar.jsonl");

function lasJsonl(fil, etikett) {
  if (!fs.existsSync(fil)) return { rader: [], saknas: etikett };
  const ut = [];
  const rader = fs.readFileSync(fil, "utf8").split("\n");
  for (let i = 0; i < rader.length; i++) {
    const rad = rader[i].trim();
    if (!rad) continue;
    try {
      const j = JSON.parse(rad);
      if (j && typeof j === "object") ut.push(j);
    } catch {
      console.log(`[FELJAKT-LAGE VARN] ${etikett} rad ${i + 1}: ogiltig JSON hoppas över`);
    }
  }
  return { rader: ut, saknas: null };
}

const nyckel = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;

// o69-nyckelkontraktet: se filhuvudet. Samma härledning som verktyg/
// feljakt-stormar.mjs (duplicerad med avsikt — detta är ett renodlat
// skript utan importbar kärna, och IMPORT AV DETTA SKRIPTET SKULLE KÖRA DET)
const bevisHash = (f) => createHash("sha256").update(String(f?.bevis ?? "")).digest("hex").slice(0, 10);
const radEffektivNyckel = (b) =>
  typeof b?.bevisHash === "string" && b.bevisHash ? `${nyckel(b)}#${b.bevisHash}` : nyckel(b);

// ── bedömningar: senaste vinner per nyckel, dom måste vara känd klass ──────
function byggaBedomningar(rader) {
  const karta = new Map();
  const skral = [];
  for (const b of rader) {
    if (!b || typeof b.ts !== "string" || typeof b.fynd !== "string" || !DOMER.includes(b.dom)) {
      skral.push(b);
      continue;
    }
    const k = radEffektivNyckel(b);
    const nuvarande = karta.get(k);
    if (!nuvarande || (b.domdTs ?? "") >= (nuvarande.domdTs ?? "")) karta.set(k, b);
  }
  return { karta, skral };
}

// kollisionsgrupper bland fyndraderna: basnyckel → antal rader (>1 = krock)
function kollisionsGrupper(fyndRader) {
  const antal = new Map();
  for (const f of fyndRader) {
    const b = nyckel(f);
    antal.set(b, (antal.get(b) ?? 0) + 1);
  }
  return new Map([...antal.entries()].filter(([, n]) => n > 1));
}

// per fyndrad: precis dom (bas#hash) slår bas-dom vid oavgjort, senaste
// domdTs vinner annars; ingen träff ⇒ raden förblir öppen
function hittaBedomning(f, krock, karta) {
  const b = nyckel(f);
  const precist = krock.has(b) ? karta.get(`${b}#${bevisHash(f)}`) : undefined;
  const bas = karta.get(b);
  if (!precist) return bas;
  if (!bas) return precist;
  return (bas.domdTs ?? "") > (precist.domdTs ?? "") ? bas : precist;
}

// ── huvudlöpning ───────────────────────────────────────────────────────────
const { rader: fynd, saknas: fyndSaknas } = lasJsonl(FYNDLOGG, "fyndlogg");
const { rader: bedomRader, saknas: bedomSaknas } = lasJsonl(BEDOMNINGAR, "bedömningar");
const { karta: bedomda, skral } = byggaBedomningar(bedomRader);
const krock = kollisionsGrupper(fynd);

const oppna = [];
const klassade = { "falskt-pos": [], rotkurad: [], pagaende: [], "transient-design": [] };
const anklade = [];

for (const f of fynd) {
  const b = hittaBedomning(f, krock, bedomda);
  if (b) {
    klassade[b.dom].push({ fynd: f, bedomning: b });
  } else {
    oppna.push(f);
  }
}
for (const [k, b] of bedomda) {
  const match = fynd.some((f) => nyckel(f) === k || (krock.has(nyckel(f)) && `${nyckel(f)}#${bevisHash(f)}` === k));
  if (!match) anklade.push(b);
}

const perSpår = {};
const oppnaHoga = oppna.filter((f) => f.allvar === "HÖG" || f.allvar === "KRITISK");
for (const f of oppna) perSpår[f["spår"] ?? f.spar ?? "?"] = (perSpår[f["spår"] ?? f.spar ?? "?"] ?? 0) + 1;

// ── utskrift ───────────────────────────────────────────────────────────────
console.log("FELJÄKT-LÄGE — sann lägesbild av fyndloggen");
if (fyndSaknas) console.log(`[FELJAKT-LAGE VARN] fyndlogg saknas (${fyndSaknas}) — inget läge att läsa`);
if (bedomSaknas) console.log(`[FELJAKT-LAGE NOT] bedömningsledger saknas (${bedomSaknas}) — alla fynd visas öppna`);
if (skral.length) console.log(`[FELJAKT-LAGE VARN] ${skral.length} bedömningsrad(er) utan giltig domklass ignorerades`);
if (anklade.length) {
  console.log(`[FELJAKT-LAGE VARN] ${anklade.length} bedömning(ar) matchar inget fynd (änkel — fyndlogg roterad? kontrollera att bedömningen inte döljer sanning):`);
  for (const b of anklade.slice(0, 5)) console.log(`    änkel: ${b.ts} ${b.dom} — ${b.fynd}`);
}
if (krock.size) {
  console.log(`[FELJAKT-LAGE NOT] ${krock.size} nyckelkollision(er) — basnyckeln täcker ${[...krock.values()].reduce((a, n) => a + n, 0)} fyndrader (${krock.size} nycklar); precis dom = bevisHash-fält (o69):`);
  for (const [b, n] of [...krock.entries()].slice(0, 5)) {
    const tacker = klassade["falskt-pos"].concat(klassade.rotkurad, klassade.pagaende, klassade["transient-design"])
      .filter(({ fynd: f }) => nyckel(f) === b).length;
    console.log(`    kollision: ${b} — ${n} rader, ${tacker} täckta av bedömning`);
  }
}
console.log(`Totalt fynd: ${fynd.length} · bedömda: ${fynd.length - oppna.length} · ÖPPNA ÄKTA: ${oppna.length} (varav HÖG/KRITISK: ${oppnaHoga.length})`);
const domSumma = DOMER.map((d) => `${d}: ${klassade[d].length}`).join(" · ");
console.log(`Bedömda per klass: ${domSumma}`);
const spårSumma = Object.entries(perSpår).map(([s, n]) => `${s} ${n}`).join(" · ");
if (spårSumma) console.log(`Öppna per spår: ${spårSumma}`);
console.log("");
console.log("ÖPPNA ÄKTA fynd (det ronder skall arbeta — äldst först):");
const enrad = (s) => (s ?? "").replace(/\s+/g, " ").trim();
for (const f of oppna.slice(0, 40)) console.log(`  ${f.ts} [${f.allvar}] ${enrad(f["spår"] ?? f.spar)}: ${enrad(f.fynd)} — ${enrad(f.bevis).slice(0, 70)}`);
if (oppna.length > 40) console.log(`  … +${oppna.length - 40} fler (se JSON-rapporten)`);
console.log("");
console.log("BEDÖMDA fynd (grävda redan — aldrig om-gräv dem):");
for (const d of DOMER) {
  for (const { fynd: f, bedomning: b } of klassade[d].slice(-10)) {
    console.log(`  ${f.ts} [${f.allvar}] ${d} — ${f.fynd} (${b.protokoll ?? "protokoll saknas"}: ${b.rotorsaka ?? "?"})`);
  }
}

// ── maskinläsbar rapport + resultat ────────────────────────────────────────
const rapport = {
  ts: new Date().toISOString(),
  totalt: fynd.length,
  oppna: oppna.length,
  oppnaHogaKritiska: oppnaHoga.length,
  bedomda: fynd.length - oppna.length,
  perDom: Object.fromEntries(DOMER.map((d) => [d, klassade[d].length])),
  oppnaPerSpar: perSpår,
  oppnaLista: oppna.map((f) => ({ ts: f.ts, allvar: f.allvar, spar: f["spår"] ?? f.spar, fynd: f.fynd, bevis: (f.bevis ?? "").slice(0, 140) })),
  ankladeBedomningar: anklade.map((b) => ({ ts: b.ts, dom: b.dom, fynd: b.fynd, bevisHash: b.bevisHash ?? null })),
  nyckelkollisioner: [...krock.entries()].map(([bas, antalRader]) => ({
    basnyckel: bas,
    antalRader,
    tackerAvBedomning: klassade["falskt-pos"].concat(klassade.rotkurad, klassade.pagaende, klassade["transient-design"])
      .filter(({ fynd: f }) => nyckel(f) === bas).length,
  })),
};
try {
  fs.mkdirSync(VAKT, { recursive: true });
  fs.writeFileSync(path.join(VAKT, "feljakt-lage-SENASTE.json"), JSON.stringify(rapport, null, 1) + "\n");
} catch (e) {
  console.log(`[FELJAKT-LAGE VARN] kunde ej skriva rapport: ${e.message}`);
}
console.log(`RESULTAT_JSON=${JSON.stringify({ totalt: rapport.totalt, oppna: rapport.oppna, oppnaHogaKritiska: rapport.oppnaHogaKritiska, bedomda: rapport.bedomda })}`);
