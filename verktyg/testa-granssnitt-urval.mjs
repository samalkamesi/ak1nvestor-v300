#!/usr/bin/env node
// TEST: gränsnittsvakten​s sidvalsrotation (s8-u2 omgång 6, 2026-09-18) —
// ren logik, ingen IO: fixturen speglar det BEVISADE rotfallet (sond mot
// sitemap 1 943 + journal 264 den 2026-09-18: /dataset 141/141 mätta sedan
// 09-15 men vinner ändå alla 21 rotationsplatser ⇒ 1 679 sidor 86 %
// permanent mätblinda, bl.a. /en 410 + /ar 410 + /kurser 334 + /labb 202 +
// /bolag 101 + /blogg 56 + /superanalys + /kalkylator). Rotkur: prio ENDAST
// bland aldrig-mätta. Körs: node verktyg/testa-granssnitt-urval.mjs →
// "PASS n/n" och exit 0.
import {
  urvalMedJournal,
  FALLBACK_SIDOR,
  SIDOR_MAX,
  PRIORITERADE_SEKTIONER,
} from "./granssnitt-urval.mjs";

let pass = 0;
const fel = [];
function krav(namn, villkor) {
  if (villkor) pass++;
  else fel.push(namn);
}

// ── FIXTURE: rotfallet 2026-09-18 (strukturen ordagratt ur verkliga
//    journalen: dataset fullt mätt 09-15, allt annat aldrig mätt; basen
//    mätt varje körning; de aldrig-mätta ÖVERSVÄMMAR platserna som i
//    verkligheten 1 679 > 21) ───────────────────────────────────────────
const T_DATUM = 1789428417996; // 2026-09-15 (journalens verkliga dataset-stämpel)
const T_NU = Date.now();
const datasetSidor = [
  "/dataset", "/dataset/halso", "/dataset/finans", "/dataset/finans/pe",
  "/dataset/industri", "/dataset/teknik", "/dataset/fastighet", "/dataset/konsument",
  "/dataset/material", "/dataset/energi", "/dataset/halso/roe", "/dataset/finans/pb",
  "/dataset/industri/ev-ebit", "/dataset/teknik/peg", "/dataset/fastighet/sverige",
  "/dataset/konsument/pe", "/dataset/material/brutto-marginal", "/dataset/energi/usa",
];
const aldrigMattaSidor = [
  "/superanalys", "/kalkylator", "/netnet", "/portfoljbyggare", "/kurser",
  "/labb", "/bolag/abb-st", "/blogg/sa-laser-du-en-balansrakning-pa-1",
  "/en", "/en/kurser", "/en/kurser/aktier-for-nyborjare", "/en/kurser/grunder",
  "/en/analys", "/en/blogg",
  "/ar", "/ar/kurser", "/ar/kurser/aktier-for-nyborjare", "/ar/kurser/grunder",
  "/ar/analys", "/ar/blogg",
  "/medlemskap", "/om-oss",
];
const unika = ["/", "/studio", "/admin", ...datasetSidor, ...aldrigMattaSidor];
const journalRotfallet = Object.fromEntries([
  ...datasetSidor.map((p) => [p, T_DATUM]),
  ...["/", "/studio", "/admin"].map((p) => [p, T_NU]),
]);

const { urval: urvalRotfallet, aldrigMatte } = urvalMedJournal(unika, journalRotfallet);

// ── ROTFALLET: ingen redan-mätt sida får en plats medan aldrig-mätta
//    finns kvar (v157-koden valde 18/18 dataset-sidor här) ──────────────
krav(
  "R1 rotfallet: aldrig-mätta fyller rotationen (v157 valde ENBART mätta dataset-sidor)",
  urvalRotfallet.slice(3).every((p) => journalRotfallet[p] === undefined),
);
krav(
  "R2 monopol stängt: noll redan-mätta /dataset-sidor i urvalet",
  !urvalRotfallet.some((p) => p.startsWith("/dataset") && journalRotfallet[p]),
);
krav(
  "R3 rotfallet: /superanalys + /kalkylator (s9-u2:s köpost) når rotationen",
  urvalRotfallet.includes("/superanalys") && urvalRotfallet.includes("/kalkylator"),
);
krav(
  "R4 bas alltid först: / + /studio + /admin",
  urvalRotfallet.slice(0, 3).join(",") === "/,/studio,/admin",
);
krav(
  "R5 taket: ≤ SIDOR_MAX sidor",
  urvalRotfallet.length <= SIDOR_MAX,
);
krav(
  "R6 aldrigMatte-räknaren: 22 av 43 (bas mätt i fixturen, dataset mätt)",
  aldrigMattaSidor.length === 22 && aldrigMatte === 22,
);

// ── VÅG-PRIORITERINGEN LEVER (v157:s avsikt): bland ALDRIG-MÄTTA väljs
//    prioriterade sektioner först — nya täckningsvågor kan forta Kö ────
const journalNyVag = { ...journalRotfallet };
const { urval: urvalNyVag } = urvalMedJournal(
  [...unika, "/dataset/ny-aspekt"],
  journalNyVag,
);
krav(
  "P1 ny aldrig-mätt dataset-sida hoppar kön före aldrig-mätta övriga",
  urvalNyVag.indexOf("/dataset/ny-aspekt") < urvalNyVag.indexOf("/ar"),
);

// ── GRUNDA FÖRE DJUPA bland aldrig-mätta: verktygsytorna (unika mallar)
//    före mallklonerna — "mät det kunden ser först" ─────────────────────
krav(
  "G1 /superanalys (1 segment) före /en/kurser/… (3 segment)",
  urvalRotfallet.indexOf("/superanalys") < urvalRotfallet.indexOf("/en/kurser/aktier-for-nyborjare"),
);

// ── FULL TÄCKNING ⇒ GLOBAL äldst-först-round-robin (sektioner utan
//    företräde — v157:s eviga dataset-monopol kan inte återkomma) ──────
const journalFull = Object.fromEntries(
  [...datasetSidor, ...aldrigMattaSidor].map((p, i) => [
    p,
    i === 0 ? T_DATUM : T_DATUM + (T_NU - T_DATUM) * 0.9, // /dataset äldst
  ]),
);
journalFull["/superanalys"] = T_DATUM + (T_NU - T_DATUM) * 0.1; // yngst
const { urval: urvalFull } = urvalMedJournal(unika, journalFull);
krav(
  "F1 full täckning: äldst-mätt (/dataset) före yngre trots prio-sektion",
  urvalFull.indexOf("/dataset") < urvalFull.indexOf("/superanalys"),
);
krav(
  "F2 full täckning: rotationen blandar sektioner (någon icke-dataset bland de första 6 efter bas)",
  urvalFull.slice(3, 9).some((p) => !p.startsWith("/dataset")),
);

// ── FALLBACK-KONTRAKTET (s9-u2:s köpost): verktygssidorna med även då
//    sitemap-hämtningen faller — samt v105:s ursprungliga sex ───────────
krav(
  "B1 FALLBACK innehåller /superanalys + /kalkylator",
  FALLBACK_SIDOR.includes("/superanalys") && FALLBACK_SIDOR.includes("/kalkylator"),
);
krav(
  "B2 FALLBACK behåller de ursprungliga sex (v105-kontraktet)",
  ["/", "/kurser", "/labb", "/blogg", "/dataset", "/om-oss"].every((p) =>
    FALLBACK_SIDOR.includes(p),
  ),
);

// ── REN FUNKTION: journalen muteras aldrig (cron skriver den själv) ────
const journalKopia = JSON.parse(JSON.stringify(journalRotfallet));
urvalMedJournal(unika, journalRotfallet);
krav(
  "N1 journal-objektet orört efter anrop",
  JSON.stringify(journalRotfallet) === JSON.stringify(journalKopia),
);
krav(
  "N2 PRIORITERADE_SEKTIONER lever kvar (utbyggbar mekanism)",
  Array.isArray(PRIORITERADE_SEKTIONER) && PRIORITERADE_SEKTIONER.includes("/dataset"),
);

// ── Resultat ────────────────────────────────────────────────────────────────
console.log(
  `\n${fel.length === 0 ? "PASS" : "FAIL"} ${pass}/${pass + fel.length} — granssnitt-urval (sidvalsrotation, rotfallet 2026-09-18)`,
);
if (fel.length) {
  for (const f of fel) console.error(`  ✗ ${f}`);
  process.exit(1);
}
process.exit(0);
