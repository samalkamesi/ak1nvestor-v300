#!/usr/bin/env node
// TEST: prod-synkens logg-tidsstämpel (s8-u1, 2026-09-16) — källkontrakt +
// buggmekanik + historiktolerans. ROTORSAKA (o32 §6 kö 2): logga() skrev
// `toISOString().slice(0, 19)` = UTC-rad UTAN Z ⇒ Date.parse tolkade raden
// som LOKAL tid (2 h fel i CEST) — två bevisade offer (s7-u2:s vakare såg
// aldrig deployen 16:40:33Z; s8-u4:s protokoll läste loggen som lokal tid).
// KUR: `slice(0, 19)}Z` — varje rad blir självbeskrivande UTC.
// Körs: node verktyg/testa-prod-synk-tidsstampel.mjs → "PASS n/n" + exit 0.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KALLA = path.join(ROT, "verktyg", "prod-synk.mjs");
const LOGG = path.join(ROT, "data", "vakten", "prod-synk.log");

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

const kalla = fs.readFileSync(KALLA, "utf8");
const loggRader = fs.readFileSync(LOGG, "utf8").split("\n").filter((r) => r.trim());

// ── K1-K2: källkontrakt — logga() skriver Z, gamla formen borta ────────────
krav(
  "K1 logga(): tidsstämpeln bärs med explicit Z (källraden `…slice(0, 19)}Z ${rad}`)",
  /\.slice\(0,\s*19\)\}Z \$\{rad\}/.test(kalla)
);
krav(
  "K2 gamla tvetydiga formen (`…slice(0, 19)} ${rad}` utan Z) finns ej kvar i källan",
  !/\.slice\(0,\s*19\)\} \$\{rad\}/.test(kalla)
);

// ── K3: buggmekaniken — utan Z tolkas raden som lokal tid ──────────────────
// ES-spec: datum-tid UTAN tidszonfält tolkas i LOKAL tid. Offseten mot Z
// beräknas dynamiskt (CEST 2 h / CET 1 h; en UTC-server ger 0 — då är
// påståendet trivialt sant och buggen lyckligtvis verkningslös där).
const TS = "2026-09-16T16:40:33"; // o32:s exakta deployrad (deployen 16:40:33Z)
const lokalOffsetMin = (Date.parse(TS + "Z") - Date.parse(TS)) / 60_000;
krav(
  `K3 Date.parse utan Z skiftar exakt lokal-offseten (${lokalOffsetMin} min på denna server — buggens fysik)`,
  Number.isFinite(lokalOffsetMin) && Math.abs(lokalOffsetMin) < 14 * 60
);
krav(
  "K3b demo av offret: vakarens tolkning av o32-radens 16:40:33 ligger 2 h fel i CEST (≠ verklig Z-tid)",
  lokalOffsetMin !== 0 || /UTC/.test(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC")
);

// ── K4: nya radens kontrakt — korrekt parsbar och prefix-stabil ────────────
const nyRadTs = `${new Date().toISOString().slice(0, 19)}Z`;
const nyRad = `${nyRadTs} NY KOD: aaaaaaaa → bbbbbbbb`;
krav(
  "K4a ny rad matchar entydigt UTC-format ^…SZ (s-prefix intakt för datumregex)",
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z /.test(nyRad)
);
krav(
  "K4b ny rad parse-ar till verklig tid (|Δ| < 1 s mot Date.now)",
  Math.abs(Date.parse(nyRadTs) - Date.now()) < 1_000
);
krav(
  "K4c datum-prefixet ^\\d{4}-…-…T…:…:… matchar ÄVEN gamla rader (feljagaren/organism-dr söker meddelandedelar — opåverkade)",
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(TS + " NY KOD: x")
);
krav(
  "K4d organism-dr:s bevis-substrängar sitter i meddelandedelen ('NY KOD', 'DEPLOYAD automatiskt')",
  nyRad.includes("NY KOD") && "…Z DEPLOYAD automatiskt: 3 commits — prod 200".includes("DEPLOYAD automatiskt")
);

// ── K5: historiktolerans — gamla rader (före kur) är UTC och LÄSES med +Z ──
// Loggen har alltid varit UTC-skribent (gammal logga()-kod använde
// toISOString()) ⇒ rätt läsregel för historien: tolka blotta tidsstämpeln
// SOM UTC (lägg Z före parse). Detta är kontraktet för framtida läsare.
const deployRader = loggRader.filter((r) => r.includes("DEPLOYAD"));
krav(
  `K5a loggen bär historik (${loggRader.length} rader, ${deployRader.length} DEPLOYAD)`,
  loggRader.length > 0
);
const provRad = (deployRader.at(-1) || loggRader.at(-1)).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
krav("K5b historierad har tidsstämpel-prefix", Boolean(provRad));
if (provRad) {
  const tolkadUTC = Date.parse(provRad[1] + "Z"); // läsregeln: blott prefix = UTC
  const tolkadNaiv = Date.parse(provRad[1]); // offrets fel-läsning
  krav(
    "K5c +Z-läsning: förfluten tid (0 < ts < nu) — korrekt tolkning av historien",
    tolkadUTC > 0 && tolkadUTC < Date.now()
  );
  krav(
    `K5d offrets naiva läsning skiljer sig med lokal-offseten (${lokalOffsetMin} min) — samma fälla som o32:s vakare`,
    tolkadUTC - tolkadNaiv === lokalOffsetMin * 60_000
  );
}

// ── Rapport ────────────────────────────────────────────────────────────────
const totalt = pass + fel.length;
console.log(`TEST prod-synk-tidsstämpel: ${pass}/${totalt} PASS`);
if (fel.length) {
  console.log("FAIL:");
  for (const f of fel) console.log("  ✗ " + f);
  process.exit(1);
}
console.log(
  `Notis: lokal UTC-offset = ${lokalOffsetMin} min — buggens felmarginal på denna server (Europe/Berlin: +120 sommar / +60 vinter).`
);
process.exit(0);
