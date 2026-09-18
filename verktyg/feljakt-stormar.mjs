#!/usr/bin/env node
/**
 * FELJÄKT-STORMAR (spår 8, o34) — incident-salvornas granskningsunderlag
 * =====================================================================
 * Rotorsakan detta verktyg kurerar: feljaktloggen (append-only, sann
 * journal) skriver fynd PER RAD, men maskinen faller PER INCIDENT — en
 * enda prod-död föder 22 rader (1×F2 + 18×F3 + 2×F5 + 1×F6) och varje
 * läsare måste hand-gräva loggarna för att förstå att raderna är ETT
 * fynd. o25 lämnade 174 öppna "äkta" (97 HÖG) varav större delen var
 * kända incidenters salvor — o25 §5 bokade denna våg: "storm-
 * klassificering transient-design med per-salv-bevis".
 *
 * MEKANISM (tre lägen):
 *   node verktyg/feljakt-stormar.mjs
 *     Klustrar ÖPPNA fynd (tidsgrannskap, default 10 min) till salvor,
 *     hämtar maskinell kontext ur driftloggarna (prod-synk, kraschvakt,
 *     hjärtslag, pulsvakt, agentfabrik — readonly) inom ±15 min, föreslår
 *     familj via dokumenterad heuristik och skriver underlag till
 *     stdout + data/vakten/feljakt-stormar-SENASTE.json. Läget är
 *     information — exit 0 alltid (läsverktyg).
 *
 *   node verktyg/feljakt-stormar.mjs --bekrafta <fil.jsonl>
 *     VALIDERAR en bedömningsfil från den grävande vågen och appendar
 *     GRÖNA rader till data/vakten/feljakt-bedomningar.jsonl (o25:s
 *     ledger — dom utan maskinell grund skall aldrig komma in).
 *     Regler: dom ∈ {falskt-pos, rotkurad, pagaende, transient-design};
 *     ts+spår+fynd måste matcha ett ÖPPET fynd; nyckeln får inte redan
 *     finnas i ledgern (re-dom görs som ny rad av ny grävande våg);
 *     rotorsaka+bevis+protokoll+domdAv obligatoriska; domdTs sätts av
 *     verktyget. Valideringsfel ⇒ INGEN rad appendas (allt-eller-inget).
 *
 * NYCKELKONTRAKTET (o69, 2026-09-18 — härdning av o65 §5 F1):
 *     Basnyckeln (ts, spår, fynd) kan kollidera när F5:s generiska
 *     fyndtext matchar två loggrader i samma millisekunds-skanning —
 *     bevisat ×2 09-17. Effektiv nyckel utökas därför med bevis-hash
 *     (`bas#hash10`) för fyndrader som INGÅR i en kollisionsgrupp.
 *     Bedömningsrader kan bära valfritt fält `bevisHash` (10 hex) för
 *     precis dom av EN rad i paret; utan fältet gäller basnyckeln
 *     (legacy — täcker hela gruppen, de 243 historiska radernas
 *     kontrakt är heligt). Precis dom är en precisionsuppgradering,
 *     aldrig ett ogiltigförklaringande av bas-domens räckvidd.
 *
 *   node verktyg/feljakt-stormar.mjs --torr --bekrafta <fil>
 *     Validera utan append (kvitto om vad som SKULLE skrivas).
 *
 * Familjeheuristiken är FÖRSLAG, inte dom — domklasserna kräver den
 * grävande vågens protokollbevis (o25: "upptäckaren ej domaren"; här är
 * feljägaren upptäckaren och stormvågan domaren).
 *
 * Körs: av ronder/stormvågor i spår 8. Loggfilerna läses readonly;
 * fyndloggen och ledgern skrivs ALDRIG av underlaget (bara --bekrafta
 * appendar ledger).
 */
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DOMER = ["falskt-pos", "rotkurad", "pagaende", "transient-design"];
export const KALLLOGGAR = [
  { fil: "prod-synk.log", etikett: "prod-synk" },
  { fil: "kraschvakt.log", etikett: "kraschvakt" },
  { fil: "hjartslag.log", etikett: "hjartslag" },
  { fil: "pulsvakt-larm.log", etikett: "pulsvakt" },
  { fil: "agentfabrik/logg.jsonl", etikett: "agentfabrik" },
];
const GAP_MIN_STANDARD = 10;
const KONTEXT_MIN = 15;

// ── inläsning (delad kultur med feljakt-lage.mjs) ──────────────────────────
export function lasJsonl(fil) {
  if (!fs.existsSync(fil)) return [];
  const ut = [];
  for (const rad of fs.readFileSync(fil, "utf8").split("\n")) {
    const t = rad.trim();
    if (!t) continue;
    try {
      const j = JSON.parse(t);
      if (j && typeof j === "object") ut.push(j);
    } catch { /* ogiltig rad hoppas — journalen är sanningsägaren */ }
  }
  return ut;
}

export const nyckel = (f) => `${f.ts}|${f["spår"] ?? f.spar ?? ""}|${f.fynd ?? ""}`;

// ── nyckelkontraktet (o69): bevis-hash för kollisionsgrupper ───────────────
// sha256(fyndradens bevis), 10 hex — kort nog att läsas, långt nog att
// skilja de bevisade kollisionsparen (olika matchrad i bevisfältet).
export function bevisHash(f) {
  return createHash("sha256").update(String(f?.bevis ?? "")).digest("hex").slice(0, 10);
}

// Effektiv nyckel för en FYNDRAD: bas#hash endast när basen ingår i en
// kollisionsgrupp (kollisionsbasNycklar = Set av basnycklar med >1 rad).
export function effektivNyckel(f, kollisionsbasNycklar) {
  const b = nyckel(f);
  return kollisionsbasNycklar?.has(b) ? `${b}#${bevisHash(f)}` : b;
}

// Effektiv nyckel för en BEDÖMNINGSRAD: hash-suffix enbart när raden
// självt bär bevisHash (precis dom) — annars basnyckeln (legacy-dom).
export function radEffektivNyckel(rad) {
  const b = nyckel(rad);
  return typeof rad?.bevisHash === "string" && rad.bevisHash ? `${b}#${rad.bevisHash}` : b;
}

// Kollisionsgrupper bland fyndrader: bas → antal rader (ren, testad).
export function kollisionsGrupper(fynd) {
  const antal = new Map();
  for (const f of fynd) {
    const b = nyckel(f);
    antal.set(b, (antal.get(b) ?? 0) + 1);
  }
  return new Set([...antal.entries()].filter(([, n]) => n > 1).map(([b]) => b));
}

// ── klustringskärna (ren — testas maskinellt) ─────────────────────────────
export function klustra(fynd, gapMin = GAP_MIN_STANDARD) {
  const sorterade = [...fynd].sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  const salvor = [];
  let aktuell = null;
  let foregaendeTs = null;
  for (const f of sorterade) {
    const t = Date.parse(f.ts);
    if (!aktuell || foregaendeTs === null || t - foregaendeTs > gapMin * 60_000) {
      aktuell = { start: f.ts, slut: f.ts, rader: [] };
      salvor.push(aktuell);
    }
    aktuell.rader.push(f);
    aktuell.slut = f.ts;
    foregaendeTs = t;
  }
  for (let i = 0; i < salvor.length; i++) salvor[i].id = `salv-${i + 1}`;
  return salvor;
}

// ── kontextkärna (ren): rader ur en logg inom fönstret ────────────────────
// Loggarnas tidsstämplar är UTC men de flesta SKRIVER ej Z (o32 §6:s
// kända fälla: Date.parse utan Z tolkar lokal tid = +2 h fel på servern)
// — här antas UTC explicit och Z-lösa stämplar tillåts aldrig ligga till.
export function hamtaKontext(rader, startTs, slutTs, marginalMin = KONTEXT_MIN) {
  const fran = Date.parse(startTs) - marginalMin * 60_000;
  const till = Date.parse(slutTs) + marginalMin * 60_000;
  const ut = [];
  for (const rad of rader) {
    const m = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?)(Z|[+-]\d{2}:?\d{2})?/.exec(rad);
    if (!m) continue;
    const t = Date.parse(m[1] + (m[2] ? "" : "Z") + (m[2] ?? ""));
    if (Number.isNaN(t)) continue;
    if (t >= fran && t <= till) ut.push(rad.trim());
  }
  return ut;
}

// ── familjeförslag (dokumenterad heuristik — aldrig dom) ──────────────────
export function forslagFamilj(salv, kontext) {
  const text = salv.rader.map((r) => `${r.fynd} ${r.bevis ?? ""}`).join(" ¶ ");
  const k = Array.isArray(kontext) ? kontext.join(" ¶ ") : String(kontext ?? "");
  if (/deploybygg pågår/i.test(text)) return "deploybygg (feljägarens eget låsmärke)";
  if (/AGENTARBETSYTA-SYNK MISSLYCKADES/i.test(text) || /AGENTARBETSYTA-SYNK MISSLYCKADES/i.test(k))
    return "agentträd-smutsigt (o11-familjen)";
  if (/KRASCHLOOP-MISSTANKE|kooldown/i.test(k)) return "kraschvakt-trigg/räddning";
  if (/VÄNTAR-RAM|OOM-dödat/i.test(k)) return "ram-/byggfönster (prod-synk)";
  if (/pm2 restart ak1a|WEB-VAKT: appen osvarar/i.test(k)) return "designad omstart (pulsvakt/hjärta)";
  if (/NY KOD:/.test(k)) return "deployfönster (prod-synk)";
  if (uppgiftAktiva(k, salv)) return "fabriksomgång (parallella barn)";
  if (/^RAM /i.test(salv.rader[0]?.fynd ?? "")) return "ram (enkelvariablet — kontext saknas)";
  if (/nätverksfel|prod osvarar/i.test(text)) return "prod nere (kontext saknas)";
  return "okänd (gräv manuellt)";
}

function uppgiftAktiva(kontextText, salv) {
  // fabriksloggens rader bär "t" i ISO; en grind/uppgift-klar inom 30 min
  // före salvstarten tyder på aktiva barn under salven
  const fran = Date.parse(salv.start) - 30 * 60_000;
  for (const match of kontextText.matchAll(/"t":"(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})[^"]*","händelse":"(grind|uppgift-klar|auto-manifest)"/g)) {
    const t = Date.parse(match[1]);
    if (!Number.isNaN(t) && t >= fran && t <= Date.parse(salv.slut) + 5 * 60_000) return true;
  }
  return false;
}

// ── valideringskärna (ren) ─────────────────────────────────────────────────
// oppnaEffektiva/ledgerEffektiva: Set av EFFEKTIVA nycklar — för varje öppet
// fynd dess basnyckel, plus bas#hash för rader i kollisionsgrupper (precision
// existerar bara där kollisioner existerar); ledgerns nycklar härleds ur
// radernas egna fält (radEffektivNyckel).
export function valideraBedomning(rad, oppnaEffektiva, ledgerEffektiva) {
  const fel = [];
  for (const falt of ["ts", "spår", "fynd", "dom", "rotorsaka", "bevis", "protokoll", "domdAv"])
    if (!rad || typeof rad[falt] !== "string" || !rad[falt].trim()) fel.push(`saknar ${falt}`);
  if (fel.length) return fel;
  if (!DOMER.includes(rad.dom)) fel.push(`okänd domklass '${rad.dom}' (kända: ${DOMER.join(", ")})`);
  if (rad.bevisHash !== undefined && !/^[0-9a-f]{10}$/.test(String(rad.bevisHash)))
    fel.push(`bevisHash fel format (10 hex, gemener): '${rad.bevisHash}'`);
  const n = radEffektivNyckel(rad);
  if (!oppnaEffektiva.has(n))
    fel.push(rad.bevisHash
      ? `bevisHash matchar ingen öppen kollisionsrad (hashen måste vara effektivNyckel-suffixet på fyndraden): ${n}`
      : `matchar inget ÖPPET fynd (änkel eller redan bedömd): ${n}`);
  if (ledgerEffektiva.has(n)) fel.push(`nyckeln redan i ledgern (re-dom = ny våg, ny rad): ${n}`);
  return fel;
}

// ── huvudlöpning (endast vid direktkörning — import = kärnorna enbart) ────
const direktKord = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

function körCli() {
const argTorrsim = process.argv.includes("--torr");
const bekraftaArg = process.argv.find((a) => a.startsWith("--bekrafta="));
const argKatalog = process.argv.find((a) => a.startsWith("--vaktkatalog="));
const VAKT = argKatalog ? argKatalog.slice("--vaktkatalog=".length) : path.join(ROT, "data", "vakten");
const FYNDLOGG = path.join(VAKT, "feljakt-fynd.jsonl");
const BEDOMNINGAR = path.join(VAKT, "feljakt-bedomningar.jsonl");
const UNDERLAG = path.join(VAKT, "feljakt-stormar-SENASTE.json");

const fynd = lasJsonl(FYNDLOGG);
const ledger = lasJsonl(BEDOMNINGAR);

// ── öppna rader enligt nyckelkontraktet (o69): precis > grov, bas-fallback ──
// delad form med feljakt-lage.mjs (där dokumenterad; duplicerad av skäl:
// lage är ett renodlat skript utan importbar kärna — IMPORT SKULLE KÖRA DET)
function byggaBedomningskarta(rader) {
  const karta = new Map();
  for (const b of rader) {
    if (!b || typeof b.ts !== "string" || typeof b.fynd !== "string" || !DOMER.includes(b.dom)) continue;
    const k = radEffektivNyckel(b);
    const nuvarande = karta.get(k);
    if (!nuvarande || (b.domdTs ?? "") >= (nuvarande.domdTs ?? "")) karta.set(k, b);
  }
  return karta;
}

function oppnaRader(fyndRader, ledgerRader) {
  const krock = kollisionsGrupper(fyndRader);
  const karta = byggaBedomningskarta(ledgerRader);
  return fyndRader.filter((f) => {
    const b = nyckel(f);
    const precist = krock.has(b) ? karta.get(`${b}#${bevisHash(f)}`) : undefined;
    const bas = karta.get(b);
    // senaste domdTs vinner; oavgjort ⇒ precis (finkornigast sanning)
    if (!precist) return !bas;
    if (!bas) return false;
    return !((bas.domdTs ?? "") > (precist.domdTs ?? ""));
  });
}

const krock = kollisionsGrupper(fynd);
const oppna = oppnaRader(fynd, ledger);

function raknaOppna() {
  return oppnaRader(lasJsonl(FYNDLOGG), lasJsonl(BEDOMNINGAR)).length;
}

if (bekraftaArg) {
  const fil = bekraftaArg.slice("--bekrafta=".length);
  if (!fs.existsSync(fil)) {
    console.error(`[feljakt-stormar] bedömningsfil saknas: ${fil}`);
    process.exit(1);
  }
  const rader = lasJsonl(fil);
  if (!rader.length) {
    console.error("[feljakt-stormar] bedömningsfil tom eller ogiltig JSONL");
    process.exit(1);
  }
  // effektiva nycklar (o69): bas för alla öppna rader + bas#hash för rader
  // i kollisionsgrupper — precis dom är bara möjlig där kollisionen finns
  const oppnaNycklar = new Set();
  for (const f of oppna) {
    const b = nyckel(f);
    oppnaNycklar.add(b);
    if (krock.has(b)) oppnaNycklar.add(`${b}#${bevisHash(f)}`);
  }
  const ledgerNycklar = new Set(ledger.map(radEffektivNyckel));
  const frost = [];
  const gröna = [];
  const sett = new Set();
  for (const rad of rader) {
    const n = radEffektivNyckel(rad);
    if (sett.has(n)) { frost.push(`${n} — dublettnyckel i filen`); continue; }
    sett.add(n);
    const fel = valideraBedomning(rad, oppnaNycklar, ledgerNycklar);
    if (fel.length) frost.push(`${n} — ${fel.join("; ")}`);
    else gröna.push(rad);
  }
  console.log(`[feljakt-stormar] validering: ${gröna.length} GRÖNA · ${frost.length} FROSTNA`);
  for (const f of frost) console.log(`  FROSTEN: ${f}`);
  if (frost.length) {
    console.error("[feljakt-stormar] allt-eller-inget: INGEN rad appendas förrän filen är ren");
    process.exit(1);
  }
  if (argTorrsim) {
    console.log(`[feljakt-stormar] torrsim — ${gröna.length} rad(er) SKULLE appendas; läget förblir ${raknaOppna()} öppna`);
    process.exit(0);
  }
  const domdTs = new Date().toISOString();
  const block = gröna.map((r) => JSON.stringify({ ...r, domdTs })).join("\n") + "\n";
  fs.appendFileSync(BEDOMNINGAR, block);
  console.log(`[feljakt-stormar] ${gröna.length} bedömning(ar) appendade till ledgern (domdTs ${domdTs})`);
  console.log(`[feljakt-stormar] nytt öppet läge: ${raknaOppna()} (varav tidigare ${oppna.length})`);
  process.exit(0);
}

// underlagsläget
const loggRader = {};
for (const kalla of KALLLOGGAR) {
  const sok = path.join(VAKT, kalla.fil);
  loggRader[kalla.etikett] = fs.existsSync(sok)
    ? fs.readFileSync(sok, "utf8").split("\n").filter((r) => r.trim())
    : [];
}
const salvor = klustra(oppna).map((s) => {
  const kontext = {};
  for (const kalla of KALLLOGGAR)
    kontext[kalla.etikett] = hamtaKontext(loggRader[kalla.etikett], s.start, s.slut);
  const spar = {};
  const allvar = {};
  for (const r of s.rader) {
    const sp = r["spår"] ?? r.spar ?? "?";
    spar[sp] = (spar[sp] ?? 0) + 1;
    allvar[r.allvar] = (allvar[r.allvar] ?? 0) + 1;
  }
  return {
    id: s.id, start: s.start, slut: s.slut, antal: s.rader.length, spar, allvar,
    familj: forslagFamilj(s, Object.values(kontext).flat()),
    fynd: s.rader.map((r) => ({
      ts: r.ts, spår: r["spår"] ?? r.spar, allvar: r.allvar, fynd: r.fynd,
      // o69: kollisionsradens identitet — precis dom kräver detta värde
      ...(krock.has(nyckel(r)) ? { bevisHash: bevisHash(r) } : {}),
    })),
    kontext,
  };
});

const rapport = {
  genererad: new Date().toISOString(),
  oppnaFore: oppna.length,
  antalSalvor: salvor.length,
  nyckelkollisioner: krock.size,
  familjer: {},
  salvor: salvor.map(({ kontext, ...s }) => ({ ...s, kontextrader: Object.fromEntries(Object.entries(kontext).map(([k, v]) => [k, v.length])) })),
};
for (const s of salvor) rapport.familjer[s.familj] = (rapport.familjer[s.familj] ?? 0) + 1;

fs.writeFileSync(UNDERLAG, JSON.stringify({ ...rapport, salvor }, null, 2));
console.log(`FELJÄKT-STORMAR — ${salvor.length} salvor av ${oppna.length} öppna fynd (underlag: ${path.relative(ROT, UNDERLAG)})`);
for (const [fam, n] of Object.entries(rapport.familjer)) console.log(`  ${String(n).padStart(3)} salvor · ${fam}`);
console.log("Varje salv i underlaget bär fyndraderna + kontexträknare per källlogg — gräv, bevisa, doma, --bekrafta.");
}

if (direktKord) körCli();
