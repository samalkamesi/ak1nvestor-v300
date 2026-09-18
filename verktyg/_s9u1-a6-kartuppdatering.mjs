// Dokvåg s9-u1 omgång 14 — SYSTEMKARTAN A6 Biblioteken återdiff 2026-09-18.
// Node-kanalen (skal-kvoten): varje ankare verifieras UNIKT före byte.
import { readFileSync, writeFileSync } from "node:fs";

const KARTA = "data/forskning/SYSTEMKARTAN.md";
let t = readFileSync(KARTA, "utf8");
const fore = t.length;
const byten = [];

function byt(namn, gammal, ny) {
  const i = t.indexOf(gammal);
  if (i < 0) throw new Error(`ANKARE SAKNAS: ${namn}`);
  if (t.indexOf(gammal, i + 1) >= 0) throw new Error(`ANKARE INTE UNIKT: ${namn}`);
  t = t.slice(0, i) + ny + t.slice(i + gammal.length);
  byten.push(namn);
}

// 1. A6-rubrikens stämpel 09-16 -> 09-18
byt(
  "A6-rubrik",
  "## A6. Biblioteken — LEVER — 7/10 *(uppdaterad 2026-09-16)*",
  "## A6. Biblioteken — LEVER — 7/10 *(uppdaterad 2026-09-18)*",
);

// 2. Ny passningsnot ovanför 09-16-noten
byt(
  "A6-ny-not",
  "*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): läspaketserien FULLBORDAD i",
  `*Uppdatering 2026-09-18 (dokvåg s9-u1 omgång 14): läspaketkön TREDUBLAD på två dygn — 22→46 filer (36 sa-laser-paket + 10 kalendrar; s1/s4-vågorna levererade JNJ, Samsung, Novo, SAP, AT&T, BSX, Nike m.fl.) — medan underlagsbasen står stilla: data/analyses 11 och forskningsbiblioteket 22 tickers, båda oförändrade sedan 09-10 (mtimes + git log). Per-paket-mätning 09-18 med sidans eget analysfabrik-v1-kontrakt + explicita ticker-tabeller: 11 paket med AKM2-analysbankunderlag (en-till-en med bankens 11 — fortfarande heltäckande där), 7 med forskningsbibliotekets AKM1-vy (AT&T, BSX, Nike, Norsk Hydro, Novo Nordisk, NP3, SAP), 18 UTAN såväl AKM2- som AKM1-underlag — gap 4 är inte längre Nordeas enkelfall utan en KLASS: 25 av 36 paket saknar analysbankunderlag. Bokmaster 105 JSON på disk mot siffrorns 103 (rebaken = A1:s bokförda kosmetik-köpost); bokkanon 102 böcker orörd. Gap 1 (lint-dörr) fortfarande öppen: verktyg/ bär endast integrera-bokmaster.mjs, pre-commit-kroken 0 bokmaster-referenser (grep). /bibliotek /forskningsbiblioteket /kallor 200 loopback + HTTPS (egna sonder). Score 7 orörd — yttillväxt + skärpt gap utan stängning (B13-precedensen). Se diff-tabellen i UPPDATERING-sektionen.*

*Uppdatering 2026-09-16 (dokvåg s9-u2 2/3): läspaketserien FULLBORDAD i`,
);

// 3. Vad-raden: bokmaster-tal
byt(
  "A6-vad",
  "- **Vad:** Bokmastern (103 bokbaserade kurser), bokkanon (102 böcker),",
  "- **Vad:** Bokmastern (105 JSON på disk 09-18 — siffror.json bär 103, rebaken A1:s köpost), bokkanon (102 böcker),",
);

// 4. GAP-blocket: helbyte av punkten (start-ankare + sektonslut-avgränsning)
{
  const start = "- **GAP:** (1) verktygskedjan saknar ett enda kommando (lint-dörr) som";
  const i = t.indexOf(start);
  if (i < 0) throw new Error("ANKARE SAKNAS: GAP-start");
  if (t.indexOf(start, i + 1) >= 0) throw new Error("ANKARE INTE UNIKT: GAP-start");
  const e = t.indexOf("\n\n---", i);
  if (e < 0) throw new Error("ANKARE SAKNAS: GAP-slut (separatorsymbol)");
  const nyGap = `- **GAP:** (1) verktygskedjan saknar fortfarande (mätt 09-18) ett enda kommando (lint-dörr) som blockerar ogiltig bokmaster-JSON före commit — verktyg/ bär endast integrera-bokmaster.mjs, pre-commit-kroken 0 bokmaster-referenser; (2) universum-fråga (mätt 2026-09-16, återmätt 09-18 oförändrad): forskningsbiblioteket 22 tickers mot analysbanken (B7:s data/analyses) 11 med endast 2 gemensamma (HM-B, INDU-C) — katalogen frusen sedan 09-10, 0 filer förkastade av analysfabrik-v1-kontraktet; synkningen är sekundär mot universumbeslutet; (3) källförteckning per kurs maskinläsbar endast delvis; (4) SKÄRPT 09-16→09-18: paket utan AKM2-underlag är en KLASS, inte Nordeas enkelfall — 25 av 36 läspaket saknar analysbankunderlag, 18 av dem även forskningsbiblioteks-AKM1 (per-paket mätt 09-18 mot båda katalogerna).`;
  t = t.slice(0, i) + nyGap + t.slice(e);
  byten.push("GAP-block");
}

// 5. Ny UPPDATERING-sektion före ÖVERSIKTEN
byt(
  "UPPDATERING-sektion",
  "## ÖVERSIKT — 38 system",
  `## UPPDATERING 2026-09-18 (dokvåg s9-u1 omgång 14 — A6 Biblioteken återdiffad; läspaketkön tredubbad på två dygn, underlagsgapet blev en klass)

Objektval enligt spårets mogenhet-regel (äldsta stämpeln utan återdiff +
störst verklighetsrörelse): A6 stämplad 09-16 och aldrig återdiffad; bland
de elva 09-16-stämplade kandidaterna (A5 A6 B10 B11 B12 B14 C19 D20 D25
D38 E36) hade enbart A6 mätbar rörelse — läspaketkön; övriga stilla
(topplistan tom, ingen src-rörelse i deras ytor, inga nya datafiler).
Syskonkontroll: u2/u3:s senaste passningar (omgång 9–13) rörde D22 D23 B9
A4 A1 C17 C18 A2 E31 B13 — A6 orört, inget duplikat. Allt EGENMÄTT i
arbetsytan 09-18 (node-mätning med sidans eget analysfabrik-v1-kontrakt +
explicita ticker-tabeller, per-paket-matchning mot båda underlagskatalogerna,
ls/mtimes, git log, loopback-curl + HTTPS).

| System | Före (passning 09-16) | Nu (mätt 09-18) | Domkraft |
|---|---|---|---|
| A6 | Kön 22 filer (12 paket + 10 kalendrar), serien "fullbordad"; bokmaster 103; forskningsbibliotek 22 tickers; gap 4 = Nordeas enkelfall | Kön 46 filer (36 paket + 10 kalendrar — TREDUBLAT); per-paket: 11 med AKM2-analysbank (en-till-en med bankens 11) · 7 med forskningsbiblioteks-AKM1 (AT&T, BSX, Nike, Norsk Hydro, Novo, NP3, SAP) · 18 utan alla underlag; bokmaster 105 på disk (siffror.json 103); 22 tickers orörd sedan 09-10 (0 förkastade); /bibliotek /forskningsbiblioteket /kallor 200 loopback+HTTPS; gap 1 öppen (0 bokmaster-referenser i pre-commit) | yttillväxt utan underlagsföljd — gap 4 skärpt till klass (25 paket utan AKM2-underlag); serieproduktionen (s1/s4) löper ifrån underlagsbasen |

Poäng: A6 LEVER 7 — OFÖRÄNDRAD (preciseringsdokvåg, B13-precedensen:
yttillväxt + skärpt gap utan stängning). Snitt 7,5 / 286 / 38 oförändrat.

Kö: (1) medvetet universumbeslut för de 18 nakna paketen — underlags-
produktion ELLER lucknotis-standard som Nordea-paketet bär; (2) lint-dörr
för bokmaster-JSON i pre-commit (gap 1, öppen sedan 09-16); (3) siffror-
rebake 103→105 (A1:s kosmetik-köpost, bokförd 09-17); (4) universumfrågan
22↔11 (gap 2, frusen sedan 09-10 — inget nytt underlag tillkommit).

## ÖVERSIKT — 38 system`,
);

writeFileSync(KARTA, t);
console.log(`OK: ${byten.join(" · ")} | längd ${fore} → ${t.length}`);
