// _s9u1-d20-kartuppdatering-0919.mjs — D20-återdiff: SYSTEMKARTAN + worklog
// Dokvåg s9-u1, manifest auto-s9-1789800329491. En-träff-ankare + abort-grind
// (clobber-kuren) + EN atomär skrivning per fil. Kör: node <denna fil>
import { readFileSync, writeFileSync, renameSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";

let karta = readFileSync(KARTA, "utf8");
const original = karta;

function byt(namn, fran, till) {
  const n = karta.split(fran).length - 1;
  if (n !== 1) {
    console.error(`ABORT: anke "${namn}" träffade ${n} gång(er) (krav: 1) — INGET skrivet.`);
    process.exit(1);
  }
  karta = karta.replace(fran, till);
  console.log(`OK: ${namn}`);
}

// ── R1: ny UPPDATERING-sektion före ÖVERSIKT ─────────────────────────────────
const uppdatering = `## UPPDATERING 2026-09-19 (dokvåg s9-u1, manifest auto-s9-1789800329491 — D20 Inloggning & konto återdiffad; felklass-fyndet i glomt-grenen + vakt-täckningsgapet)

Anspråk på disk FÖRE mätstart (data/vakten/auto-s9-1789800329491-s9-u1-ansprak.md,
gitignorerad väg; D20 = ÖVERSIKT:ns äldsta icke-återdiffade stämpel 09-16 OCH
uttryckligen lämnad öppen av gårdagens u3 som "rimligaste enkel-pick"). Allt
EGENMÄTT ~09:0x lokal (svitkörrning, kodläsning, git log, loopback-sonder):

| Yta | Före (09-16-passningen) | Efter (mätt 09-19) |
|---|---|---|
| Svit | 17/17 grön (09-16) | 17/17 GRÖN EGEN igen (exit 0) — kärnan ren |
| glomt-grenen i sviten | 0 träffar (gap 2) | 0 träffar ÅTERMÄTT — gap 2 kvarstår exakt |
| medlem-auth.ts | 556 r | 556 r OFÖRÄNDRAD — senaste commit d83915fb 2026-09-11 (kodstilla 8 d) |
| medlem-inloggning.tsx | "220 r + glomt-läge" | TALRÄTTNING: **301 r** — oförändrad i git sedan 10f7b75f 2026-09-12 (autoComplete W3C-tokens "email"/"new-"/"current-password" på plats :230/:241); 09-16-radens 220 var inaktuellt |
| Live-ytor | /logga-in 200 (09-16) | /logga-in 200 + SPEGLARNA /en/logga-in + /ar/logga-in 200 (första D20-mätta spegelsonden — SSR-läkningen håller) |
| API-kontrakt | (ej live-mätt i D20) | POST ogiltig action → 400 {"fel":"Ogiltigt action."} · GET → 405 (POST-only) · signin utan data → 401 generisk text (KRITA lever live) · rate-limit MAX_GLOMT_PER_MIN = 5 i kod (:60) + 429-gren med Retry-After (:137–141) · neutral talkart "Om kontot finns…" (:152–155) |

FYND A — NYTT GAP 4 (felklassmappning, live-mätt): glomt med ogiltigt
e-postformat svarar **HTTP 502 + {"fel":"Ogiltig e-postadress.","kod":"tjanst"}**
— ett LOKALT valideringsfel mappas till "Bad Gateway"/tjänst-klassen. Roten är
dubbel: medlem-auth.ts:389 returnerar kod "tjanst" ÄVEN för valideringsfelet,
och route.ts:149 mappar ALLA !ok till 502 — mappningen kan inte skilja
validering från transport. Säkerhetsmässigt ofarligt (ingen kontoexistens
läcks; kontrast signin-tom → 401), men felklass-semantiken ljuger: 502
signalerar "tjänsten nere" när sanningen är "klientformat fel". Kur kräver
src/ (huvudagenten): separat kodvärde (t.ex. "validering") eller 400-förgren.

FYND B — NYTT GAP 5 (vakt-täckning, B12:s klass): /logga-in (+ speglar) SAKNAS
i gränssnittsvaktens FALLBACK_SIDOR (granssnitt-urval.mjs:31 — 8 sidor: /,
/kurser, /labb, /blogg, /dataset, /superanalys, /kalkylator, /om-oss) —
inloggningssidan, hela medlemstrupens entré, rutinmäts EJ (0 vaktrapporter med
sidan). B12:s köpost lade till superanalys/kalkylator men logga-in glömdes.

Gap 1 (E2E-svit) och gap 3 (återställningsmejlets leveransväg — GoTrue-konfig,
avsändardomän) kvarstår oförändrade. Score 8 ORÖRD (E33/B14-precedensen:
kunskap tillförd, inget gap stängt — båda fynden är preciseringsklass, ej
kundsynligt brytt kontrakt). Snitt **7,6 / 287 / 38 OFÖRÄNDRAT**. Kö till
huvudagenten: (1) felklass-kur i glomt-grenen (src/); (2) /logga-in i vaktens
sidrotation (samma kur-post som B12:s); (3) glomt-grenen i sviten (gap 2 —
neutral talkart + rate-limit är rena funktioner, sviten stubbar redan nätet).

`;
byt("R1 UPPDATERING-sektion", "## ÖVERSIKT — 38 system", uppdatering + "## ÖVERSIKT — 38 system");

// ── R2: D20-rubrikens datum ──────────────────────────────────────────────────
byt(
  "R2 D20-rubrik",
  "## D20. Inloggning & konto (FAS L1) — LEVER — 8/10 *(uppdaterad 2026-09-16)*",
  "## D20. Inloggning & konto (FAS L1) — LEVER — 8/10 *(uppdaterad 2026-09-19)*",
);

// ── R3: ny återdiff-not efter 09-16-noten ────────────────────────────────────
byt(
  "R3 D20-återdiff-not",
  "medlem-auth.ts nu 556 r; sviten 17/17 GRÖN körd nu men täcker EJ glomt-grenen\n(0 träffar). Score 7 → 8 (huvudgap mätbart stängt).*",
  `medlem-auth.ts nu 556 r; sviten 17/17 GRÖN körd nu men täcker EJ glomt-grenen
(0 träffar). Score 7 → 8 (huvudgap mätbart stängt).*

*Återdiff 2026-09-19 (dokvåg s9-u1, manifest auto-s9-1789800329491): sviten
17/17 GRÖN EGEN igen (exit 0) · glomt-grenen OTÄCKT återmätt (0 svitträffar) ·
kärnan KODSTILLA 8 d (medlem-auth.ts 556 r + route.ts 186 r, senaste commit
d83915fb 09-11) · TALRÄTTNING medlem-inloggning.tsx 220 → 301 r (oförändrad
sedan 10f7b75f 09-12, autoComplete W3C-tokens på plats) · live: /logga-in +
båda speglar 200, POST-kontrakt 400/405/401 mätta, rate-limit 5/min +
Retry-After + neutral talkart i kod · TVÅ NYTTA GAP: (4) glomt-valideringsfel
mappas till 502/tjanst (live-mätt; medlem-auth.ts:389 + route.ts:149 — kur
kräver src/), (5) /logga-in saknas i gränssnittsvaktens FALLBACK_SIDOR
(B12-klassen). Score 8 orörd (E33/B14-precedensen). Se UPPDATERING-sektionen
för diff-tabellen.*`,
);

// ── R4: nyckelfilens radtal ──────────────────────────────────────────────────
byt(
  "R4 nyckelfil radtal",
  "src/components/ak1a/medlem-inloggning.tsx (220 r + glomt-läge), src/",
  "src/components/ak1a/medlem-inloggning.tsx (301 r + glomt-läge; talrättat 09-19 — oförändrad sedan 09-12), src/",
);

// ── R5: GAP-listan utökas med 4+5 ────────────────────────────────────────────
byt(
  "R5 GAP 4+5",
  "konfig, avsändardomän) overifierad — kodvägen grön, mejlvägen omätbar\n  från arbetsytan.",
  `konfig, avsändardomän) overifierad — kodvägen grön, mejlvägen omätbar
  från arbetsytan; (4) felklassmappning i glomt-grenen: lokalt valideringsfel
  sänder 502 {"kod":"tjanst"} i stället för 400 (live-mätt 09-19;
  medlem-auth.ts:389 bär "tjanst" även för valideringsfel + route.ts:149
  mappar allt !ok → 502) — kur kräver src/; (5) /logga-in (+ speglar) saknas
  i gränssnittsvaktens FALLBACK_SIDOR — rutinmäts ej (B12-klassen, 09-19).`,
);

// ── R6: ÖVERSIKT-raden D20 ───────────────────────────────────────────────────
byt(
  "R6 ÖVERSIKT D20",
  "| D20 | Inloggning & konto (L1) | Medlem | LEVER | 8 | Glömt-lösenord-flödet LEVER (recover + neutral talkart + egen rate-limit, mätt 09-16); verifiering PÅ (ej_bekraftad-gren); kvar: E2E-svit + glomt-grenen otäckt av sviten |",
  "| D20 | Inloggning & konto (L1) | Medlem | LEVER | 8 | Återdiffad 09-19: svit 17/17 grön egen, kärnan kodstilla 8 d, /logga-in + speglar 200, talrättning medlem-inloggning 301 r; TVÅ NYTTA GAP: glomt-valideringsfel → 502/tjanst (felklassmappning, live-mätt) + /logga-in saknas i vaktens FALLBACK_SIDOR (B12-klassen); kvar: E2E-svit + glomt-grenen otäckt av sviten |",
);

if (karta === original) {
  console.error("ABORT: ingen ändring skedd — INGET skrivet.");
  process.exit(1);
}
const tmp = KARTA + ".tmp-s9u1";
writeFileSync(tmp, karta, "utf8");
renameSync(tmp, KARTA);
console.log("KARTA: atomär skrivning klar (6 ersättningar).");

// ── Worklog-append ───────────────────────────────────────────────────────────
const worklogRad = `
## SPÅR 9 s9-u1 (byggare 1/3, manifest auto-s9-1789800329491) — 2026-09-19 ~09:1x lokal: SYSTEMKARTAN-dokvåg — D20 Inloggning & konto återdiffad (tredje varvet): FELKLASS-FYNDET i glomt-grenen (502/tjanst vid valideringsfel) + vakt-täckningsgapet; kärnan kodstilla 8 dygn [fabrik]

Fabriksagent s9-u1. VAL (anspråk data/vakten/auto-s9-1789800329491-s9-u1-ansprak.md på disk FÖRE mätstart, gitignorerad väg): D20 — ÖVERSIKT:ns äldsta icke-återdiffade stämpel (09-16) OCH uttryckligen lämnad öppen av gårdagens u3 ("rimligaste enkel-pick"). Allt EGENMÄTT: sviten 17/17 GRÖN (exit 0) med glomt-grenen OTÄCKT återmätt (0 svitträffar — gap 2 kvarstår exakt) · kärnan KODSTILLA 8 d (medlem-auth.ts 556 r + route.ts 186 r, senaste commit d83915fb 09-11) · TALRÄTTNING medlem-inloggning.tsx 220 → 301 r (oförändrad i git sedan 10f7b75f 09-12; autoComplete W3C-tokens på plats :230/:241 — 09-16-radens tal var inaktuellt) · LIVE: /logga-in + SPEGLARNA /en/logga-in + /ar/logga-in 200 (första D20-mätta spegelsonden; SSR-läkningen håller) · POST-kontrakt: ogiltig action 400 {"fel":"Ogiltigt action."} · GET 405 (POST-only) · signin utan data 401 generisk (KRITA lever live) · rate-limit MAX_GLOMT_PER_MIN = 5 (:60) + 429-gren med Retry-After (:137–141) + neutral talkart (:152–155) i kod. TVÅ NYTTA GAP: (4) FELKLASSFYND live-mätt — glomt med ogiltigt e-postformat svarar HTTP 502 {"fel":"Ogiltig e-postadress.","kod":"tjanst"}: lokalt valideringsfel mappas till "Bad Gateway"-klassen (dubbel rot: medlem-auth.ts:389 bär kod "tjanst" ÄVEN för valideringsfelet + route.ts:149 mappar ALLA !ok → 502 — mappningen kan ej skilja validering från transport; säkerhetsmässigt ofarligt, ingen kontoexistens läcks, men felklassen ljuger "tjänst nere"; kur = src/, huvudagentens); (5) /logga-in (+ speglar) SAKNAS i gränssnittsvaktens FALLBACK_SIDOR (granssnitt-urval.mjs:31, 8 sidor) — medlemstrupens entré rutinmäts ej (B12:s klass; deras köpost lade till superanalys/kalkylator men logga-in glömdes). Gap 1 (E2E) + gap 3 (mejlvägen) kvarstår. Score 8 ORÖRD (E33/B14-precedensen); snitt 7,6/287/38 OFÖRÄNDRAT. Kö till huvudagenten: felklass-kur (src) · /logga-in i vaktens sidrotation (samma post som B12:s) · glomt-grenen i sviten. KVD: endast SYSTEMKARTAN + denna worklog-rad + kartskript — INGET bygge (deploy ägs av prod-synken); src/ orörd (tsc-baslinjen vilar i pre-commit-grinden); R2 orörd; data/blogg/ orörd; syskonens ytor orörda; redigering via node-kanal med en-träff-ankare + abort-grind + EN atomär skrivning; commit MED pathspec (s9-u2-läxan). [fabrik]
`;
let wl = readFileSync(WORKLOG, "utf8");
if (!wl.endsWith("\n")) wl += "\n";
const tmpW = WORKLOG + ".tmp-s9u1";
writeFileSync(tmpW, wl + worklogRad, "utf8");
renameSync(tmpW, WORKLOG);
console.log("WORKLOG: append klar.");
