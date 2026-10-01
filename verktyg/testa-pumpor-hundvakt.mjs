#!/usr/bin/env node
// Svit för verktyg/pumpor-hundvakt.mjs (v192, r287).
// =====================================================================================
// Kontrakt (mot v192): hundvakten är daemonens EXTERNA pulsbevakare —
//   1. beraknaSenasteRadTs: nyaste HH:MM:SS-raden (UTC, datumlös) med
//      midnattsrollover (framtid > 2 min ⇒ igår); ogiltiga rader ignoreras.
//   2. Tystnad > tröskel ⇒ journal "frysning-upptäckt" + omstart (max 1 per
//      10 min; max 2 i följd utan läkning ⇒ ESKALERAD + 1 h backoff).
//   3. Puls återkommer ⇒ journal "återställd" + räknare nollställs.
//   4. Loggläsfel ⇒ "lasfel"-journal (rate-limmad), ALDRIG omstart, ALDRIG kast.
//   5. Tom/otolkbar logg ⇒ INGEN åtgärd (aldrig omstart utan bevis).
// Alla beroenden overridas (fake klocka, logg, journal, omstart) — sviten rör
// aldrig pm2, /proc eller äkta loggfiler.
//
// Körs: node verktyg/testa-pumpor-hundvakt.mjs  (exit 0 = alla PASS)

import { byggHundvakt, byggLevnadsjournal, beraknaSenasteRadTs, arMainProcess } from "./pumpor-hundvakt.mjs";

let pass = 0;
let fail = 0;
const resultat = [];
function kontroll(namn, ok, detalj = "") {
  if (ok) { pass++; resultat.push(`PASS ${namn}`); }
  else { fail++; resultat.push(`FAIL ${namn}${detalj ? " — " + detalj : ""}`); }
}

const NU0 = Date.UTC(2026, 8, 28, 5, 30, 0); // 2026-09-28T05:30:00Z

function töm() {
  const journalRader = [];
  const omstarter = [];
  let t = NU0;
  let rader = [];
  let lasFel = null;
  const vakt = byggHundvakt({
    nu: () => new Date(t),
    lasRader: async () => {
      if (lasFel) throw lasFel;
      return rader;
    },
    journal: async (o) => journalRader.push(o),
    omstart: (klar) => { omstarter.push(Date.now()); klar(true, "pm2 exit 0"); },
  });
  return {
    vakt, journalRader, omstarter,
    fram: (ms) => { t += ms; },
    settRader: (arr) => { rader = arr; },
    kastaLasfel: (e) => { lasFel = e; },
    klockan: () => t,
  };
}

// ── A: beraknaSenasteRadTs ───────────────────────────────────────────────────
{
  const nu = new Date(NU0); // 05:30:00
  kontroll("A1 färsk rad tolkas", beraknaSenasteRadTs(["05:29:00 ▶ automation-motor"], nu)?.getTime() === NU0 - 60_000);
  kontroll("A2 nyaste rad vinner", beraknaSenasteRadTs(["05:10:00 ▶ a", "05:28:00 ▶ b", "05:19:00 ▶ c"], nu)?.getTime() === NU0 - 2 * 60_000);
  kontroll("A3 ogiltiga ignoreras → null", beraknaSenasteRadTs(["inget tid här", "99:99:99 x", ""], nu) === null);
  kontroll("A4 tom lista → null", beraknaSenasteRadTs([], nu) === null);
  // midnatt: nu 00:01:00, rad 23:59:00 ⇒ igår ⇒ tystnad 2 min (ej 24 h + 2 min)
  const midnatt = new Date(Date.UTC(2026, 8, 29, 0, 1, 0));
  const tolkad = beraknaSenasteRadTs(["23:59:00 ▶ automation-motor"], midnatt);
  kontroll("A5 midnattsrollover", tolkad?.getTime() === midnatt.getTime() - 2 * 60_000, `fick ${tolkad?.toISOString()}`);
  // rad 5 min i framtiden (klockglidning) ⇒ också igår
  const glid = beraknaSenasteRadTs(["05:36:00 ▶ x"], nu);
  kontroll("A6 framtidsglidning ⇒ igår", glid?.getTime() === NU0 - 24 * 3600_000 + 6 * 60_000, `fick ${glid?.toISOString()}`);
}

// ── B: färsk puls ⇒ tystnad lägre än tröskeln ⇒ ingen åtgärd ─────────────────
{
  const h = töm();
  h.settRader(["05:29:45 ▶ automation-motor"]);
  await h.vakt.kolla();
  kontroll("B1 färsk puls ⇒ ingen journal", h.journalRader.length === 0);
  kontroll("B2 färsk puls ⇒ ingen omstart", h.omstarter.length === 0);
}

// ── C: frysning 4 min ⇒ upptäckt + omstart nr 1 ─────────────────────────────
{
  const h = töm();
  h.settRader(["05:26:00 ▶ automation-motor"]); // 4 min tystnad vid 05:30
  await h.vakt.kolla();
  const händelser = h.journalRader.map((r) => r.händelse);
  kontroll("C1 frysning-upptäckt journalad", händelser.includes("frysning-upptäckt"));
  kontroll("C2 omstart-beslutad journalad", händelser.includes("omstart-beslutad"));
  kontroll("C3 omstart kallad exakt en gång", h.omstarter.length === 1);
  kontroll("C4 omstart nr 1", h.journalRader.find((r) => r.händelse === "omstart-beslutad")?.nr === 1);
  kontroll("C5 tystnad redovisad", (h.journalRader.find((r) => r.händelse === "frysning-upptäckt")?.tystnadMs ?? 0) >= 240_000);
}

// ── D: rate-limit — ny kolla 5 min senare (fortfarande frusen) ⇒ ingen ny ───
{
  const h = töm();
  h.settRader(["05:26:00 ▶ automation-motor"]);
  await h.vakt.kolla(); // omstart #1 vid 05:30
  h.fram(5 * 60_000); // 05:35 — fortfarande tyst (raden allt äldre)
  await h.vakt.kolla();
  kontroll("D1 rate-limit håller omstarten tillbaka", h.omstarter.length === 1);
  kontroll("D2 ingen ny omstart-beslutad", !h.journalRader.some((r) => r.händelse === "omstart-beslutad" && r.nr === 2));
}

// ── E: läkning ⇒ återställd + räknare nollställd ─────────────────────────────
{
  const h = töm();
  h.settRader(["05:26:00 ▶ automation-motor"]);
  await h.vakt.kolla(); // frysning + omstart #1
  h.fram(60_000); // 05:31 — daemonen (omstartad) ropar igen
  h.settRader(["05:30:59 ▶ automation-motor"]);
  await h.vakt.kolla();
  const ater = h.journalRader.find((r) => r.händelse === "återställd");
  kontroll("E1 återställd journalad", Boolean(ater));
  kontroll("E2 varaktighet med", typeof ater?.varaktighetMs === "number" && ater.varaktighetMs > 0);
  kontroll("E3 räknare nollställd", h.vakt.state.omstarterIFöljd === 0);
}

// ── F: omstart hjälper inte ⇒ andra omstarten efter rate-limit, sedan ESKALERING
{
  const h = töm();
  h.settRader(["05:26:00 ▶ automation-motor"]);
  await h.vakt.kolla(); // #1 vid 05:30
  h.fram(11 * 60_000); // 05:41 — rate-limit passerad, fortfarande tyst
  await h.vakt.kolla(); // #2
  kontroll("F1 andra omstarten verkställd", h.journalRader.some((r) => r.händelse === "omstart-beslutad" && r.nr === 2));
  h.fram(11 * 60_000); // 05:52 — fortfarande tyst
  await h.vakt.kolla(); // ⇒ ESKALERAD (max 2 i följd)
  kontroll("F2 ESKALERAD journalad", h.journalRader.some((r) => r.händelse === "ESKALERAD"));
  h.fram(11 * 60_000); // 06:03 — backoff råder (till 06:52)
  await h.vakt.kolla();
  kontroll("F3 backoff håller tredje omstarten borta", h.omstarter.length === 2);
  kontroll("F4 backoff-aktiv journalad", h.journalRader.some((r) => r.händelse === "backoff-aktiv"));
  // backoffen utgången (05:52 + 1 h = 06:52): frysningen består men vakten
  // återupptar sina försök — paus, inte avgång
  h.fram(52 * 60_000); // 06:55
  await h.vakt.kolla();
  kontroll("F5 efter backoff återupptas vakten (frysning består, omstart #3 tillåten)", h.omstarter.length === 3);
  kontroll("F6 backoff-utgången journalad", h.journalRader.some((r) => r.händelse === "backoff-utgången"));
}

// ── G: loggläsfel ⇒ lasfel-journal, aldrig omstart, aldrig kast ──────────────
{
  const h = töm();
  h.kastaLasfel(new Error("ENOENT logg roterad"));
  await h.vakt.kolla();
  await h.vakt.kolla(); // andra gången: rate-limit på lasfel-raden (60 s)
  kontroll("G1 lasfel journalad", h.journalRader.some((r) => r.händelse === "lasfel"));
  kontroll("G2 lasfel ger INGEN omstart", h.omstarter.length === 0);
  kontroll("G3 lasfel-rate-limit (en rad trots två kollar)", h.journalRader.filter((r) => r.händelse === "lasfel").length === 1);
  kontroll("G4 kollar kastar inte", true); // hit = inget kast yckte hittils
}

// ── H: tom/otolkbar logg ⇒ ingen åtgärd ─────────────────────────────────────
{
  const h = töm();
  h.settRader(["", "skräp utan tidsstämpel"]);
  await h.vakt.kolla();
  kontroll("H1 otolkbar logg ⇒ ingen journal", h.journalRader.length === 0);
  kontroll("H2 otolkbar logg ⇒ ingen omstart", h.omstarter.length === 0);
  kontroll("H3 ingen frusenSedan satt", h.vakt.state.frusenSedan === null);
}

// ── I: journalraderna är giltig JSON med ts ─────────────────────────────────
{
  const h = töm();
  h.settRader(["05:26:00 ▶ automation-motor"]);
  await h.vakt.kolla();
  const ogiltiga = h.journalRader.filter((r) => typeof r.ts !== "string" || Number.isNaN(Date.parse(r.ts)));
  kontroll("I1 samtliga journalrader bär giltig ts", ogiltiga.length === 0);
}

// ── J: o572 K1 — pm2-ISO-prefix tolkas (v192:s ^-ankrade regex var blind) ───
{
  const nu = new Date(NU0); // 2026-09-28T05:30:00Z
  kontroll("J1 pm2-prefixrad tolkas med komplett datum",
    beraknaSenasteRadTs(["2026-09-28T05:29:00: ▶ automation-motor"], nu)?.getTime() === NU0 - 60_000);
  kontroll("J2 blandad svans — nyaste pm2-raden vinner",
    beraknaSenasteRadTs(["05:10:00 ▶ a", "2026-09-28T05:28:30: ▶ b", "05:19:00 ▶ c"], nu)?.getTime() === NU0 - 90_000);
  kontroll("J3 blandad svans — nyaste prefixlösa raden vinner",
    beraknaSenasteRadTs(["2026-09-28T05:04:00: ▶ a", "05:29:00 ▶ b"], nu)?.getTime() === NU0 - 60_000);
  // komplett datum ⇒ ingen midnattsgissning behövs (igår blir igår av sig självt)
  const midnatt2 = new Date(Date.UTC(2026, 8, 28, 0, 1, 0));
  kontroll("J4 pm2-rad från igår korrekt utan gissning",
    beraknaSenasteRadTs(["2026-09-27T23:59:00: ▶ automation-motor"], midnatt2)?.getTime() === midnatt2.getTime() - 2 * 60_000);
  kontroll("J5 ogiltigt pm2-datum ignoreras", beraknaSenasteRadTs(["2026-13-99T25:99:99: x"], nu) === null);
  kontroll("J6 pm2-fraktional tolereras",
    beraknaSenasteRadTs(["2026-09-28T05:29:59.123: ▶ automation-motor"], nu)?.getTime() === NU0 - 1_000);
  // REGRESSIONSVAKT (o572:s kärna): en svans med ENBART pm2-prefixerade rader —
  // v192:s regex (replikerad ordagrant) ser INGET, o572-parsern ser pulsen.
  const skarpSvans = ["2026-09-28T05:29:45: 05:29:45 ▶ automation-motor", "2026-09-28T05:29:59: 05:29:59 ▶ vaxthus-chatt"];
  const V192_RE = /^(\d{2}):(\d{2}):(\d{2}) /;
  kontroll("J7 v192-regexen blind på ren pm2-svans (före-läget bevarat)", skarpSvans.every((r) => !V192_RE.test(r)));
  kontroll("J8 o572-parsern hittar pulsen där v192 är blind",
    beraknaSenasteRadTs(skarpSvans, nu)?.getTime() === NU0 - 1_000);
  // och genom hela vakten: pm2-svans + färsk puls ⇒ ingen omstart, ingen journal
  const h = töm();
  h.settRader(skarpSvans);
  await h.vakt.kolla();
  kontroll("J9 pm2-puls genom kolla() ⇒ ingen frysning-dom", h.journalRader.length === 0 && h.omstarter.length === 0);
}

// ── K: o572 K2 — levnadsjournalen (bevis på disk, oberoende av stdout) ──────
{
  const journalRader = [];
  let rader = ["2026-09-28T05:29:45: 05:29:45 ▶ automation-motor"];
  let lasFel = null;
  const t0 = NU0;
  const levnad = byggLevnadsjournal({
    nu: () => new Date(t0),
    lasRader: async () => { if (lasFel) throw lasFel; return rader; },
    journal: async (o) => journalRader.push(o),
  });
  await levnad.starta({ version: "o572" });
  kontroll("K1 starta journalar vakten-startad med version",
    journalRader.some((r) => r.händelse === "vakten-startad" && r.version === "o572" && !Number.isNaN(Date.parse(r.ts))));
  const senaste = await levnad.puls();
  const pulsRad = journalRader.find((r) => r.händelse === "puls-läge");
  kontroll("K2 puls bär senasteLoggrad + tystnad från KURERADE parsern",
    Boolean(pulsRad) && senaste?.getTime() === t0 - 15_000 && pulsRad.tystnadMs === 15_000,
    `fick ${JSON.stringify(pulsRad)}`);
  lasFel = new Error("ENOENT");
  await levnad.puls();
  const pulsRader = journalRader.filter((r) => r.händelse === "puls-läge");
  kontroll("K3 puls vid läsfel journalas ändå (levnadsbeviset lever)",
    pulsRader.length === 2 && pulsRader[1].senasteLoggrad === null && pulsRader[1].tystnadMs === null);
  kontroll("K4 levnadsjournalen har ALDRIG omstartsbefogenhet",
    !journalRader.some((r) => r.händelse?.startsWith("omstart")));
}

// ── L: o572 — main-detektionen överlever pm2:s wrapper-argv ──────────────────
{
  const modulUrl = "file:///home/ak1a/AK1/verktyg/pumpor-hundvakt.mjs";
  kontroll("L1 manuell körning: argv[1] = modulen ⇒ main",
    arMainProcess({ argv1: "/home/ak1a/AK1/verktyg/pumpor-hundvakt.mjs", env: {}, modulUrl }) === true);
  kontroll("L2 pm2-drift: argv[1] = wrapper men pm_exec_path = modulen ⇒ main",
    arMainProcess({
      argv1: "/usr/lib/node_modules/pm2/lib/ProcessContainerFork.js",
      env: { pm_id: "4", pm_exec_path: "/home/ak1a/AK1/verktyg/pumpor-hundvakt.mjs" },
      modulUrl,
    }) === true);
  kontroll("L3 testimport: främmande pm_exec_path (ärvd pm2-miljö) ⇒ INTE main",
    arMainProcess({
      argv1: "/home/ak1a/AK1/verktyg/testa-pumpor-hundvakt.mjs",
      env: { pm_id: "6", pm_exec_path: "/usr/bin/taskset" },
      modulUrl,
    }) === false);
  kontroll("L4 pm_exec_path utan pm_id (förfalskningsväg) ⇒ INTE main",
    arMainProcess({
      argv1: "/usr/lib/node_modules/pm2/lib/ProcessContainerFork.js",
      env: { pm_exec_path: "/home/ak1a/AK1/verktyg/pumpor-hundvakt.mjs" },
      modulUrl,
    }) === false);
  kontroll("L5 ogiltig sökväg kastar inte", arMainProcess({ argv1: "\0ogiltig", env: {}, modulUrl }) === false);
}

// ── rapport ──────────────────────────────────────────────────────────────────
console.log(resultat.join("\n"));
console.log(`\n${pass} PASS · ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
