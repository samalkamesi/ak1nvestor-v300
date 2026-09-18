#!/usr/bin/env node
// Dokvåg s9-u2 09-18: SYSTEMKARTAN A3+B12. Clobber-kuren (93f43878/f1a33e95-
// precedensen): FÄRSK läsning vid körning, varje ersättning kräver EXAKT EN
// träff, annars ABORT utan skrivning (exit 1). EN writeFileSync + append.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const KARTA = "/home/ak1a/AK1/data/forskning/SYSTEMKARTAN.md";
const WORKLOG = "/home/ak1a/AK1/worklog.md";
let t = readFileSync(KARTA, "utf8");
const innan = t.length;
const ers = (namn, fran, till) => {
  const n = t.split(fran).length - 1;
  if (n !== 1) { console.error(`ABORT "${namn}": ${n} träffar (kräver 1) — INGEN skrivning.`); process.exit(1); }
  t = t.replace(fran, till);
  console.log(`OK "${namn}"`);
};

// ── A3 detaljsektion ──────────────────────────────────────────────────────
ers("A3-rubrik",
  "## A3. AI-Mentorn — LEVER — 8/10 *(uppdaterad 2026-09-16)*",
  "## A3. AI-Mentorn — LEVER — 9/10 *(uppdaterad 2026-09-18)*");
ers("A3-italic-infang",
  "*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 7, återdiff): spår 6:s\nfabriksomgångar byggde vidare efter u1:4:s mätning",
  "*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9, tredje varvet):\nE01 STÄNGT + hela sviten röda-fri — 38 sviter ALLA GRÖNA 0 FAIL (sanna\nexitkoder), 33 motorer/98 monsters, register 408=408=408 — se diff-tabellen\ni UPPDATERING-sektionen.*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u2 omgång 7, återdiff): spår 6:s\nfabriksomgångar byggde vidare efter u1:4:s mätning");
ers("A3-vad-monster",
  "68 deterministiska\n  frågemonster i 18 lager",
  "98 deterministiska\n  frågemonster i 33 lager (09-18)");
ers("A3-vad-register",
  "(358 kurser; källan bär 375 — se gap 5), utan\n  API-kostnad.",
  "(408 kurser = källan, E01 grön 09-18), utan\n  API-kostnad.");
ers("A3-observation",
  "Testtäckningen är nu bland de bredaste i kodbasen: 598\n  kontroller i 24 sviter (597 gröna vid 2026-09-16-mätningen — enda röda:\n  E01 registeräkthet, se gap 5;",
  "Testtäckningen är kodbasens bredaste: 38 sviter ALLA GRÖNA\n  vid 2026-09-18-mätningen (0 FAIL, sanna exitkoder; bassviten 555 PASS med\n  E01 GRÖN 408/408; kedjan 70 PASS/98 monsters/33 motorer;");
ers("A3-gap5-stangd",
  "(5) NY 09-16:\n  registerrebaken BRÖTS — inbakat 358 mot källans 375 (17 nya kurser),\n  bassvitens E01 RÖD (exit 1) tills --baka + Write/Edit-inklistring; kurser\n  levererade utan E01-grön rebake är oregistrerade för mentorns källmärken.",
  "(5)~~NY 09-16: registerrebaken BRÖTS~~ STÄNGD 09-18: E01\n  GRÖN — 408 kurser fält-för-fält identiska med getCourses(); rebaken höll\n  genom två efterföljande kursvågor (398→401→408, atomär --baka i\n  s5/s6-leveranserna); larvag-synk grön 408=408=408 · 21 profiler · 0 fantomer.");

// ── B12 detaljsektion ─────────────────────────────────────────────────────
ers("B12-rubrik",
  "## B12. Superanalysen + AKM1-kalkylatorn — LEVER — 7/10 *(uppdaterad 2026-09-16)*",
  "## B12. Superanalysen + AKM1-kalkylatorn — LEVER — 7/10 *(uppdaterad 2026-09-18)*");
ers("B12-italic-infang",
  "*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 MOTBEVISAT,",
  "*Uppdatering 2026-09-18 (dokvåg s9-u2 manifest auto-s9): FOMO-kuren LEVER\ni prod — granskningsstegets \"Sista chansen att justera innan resultatet\" →\n\"Efter detta steg låses dina val och resultatet visas\" (superanalys.tsx:467,\n1f43c167 09-17 00:55; deploybevis: prod-chunk 1wv5cn_5misik.js bär nya\nsträngen, gamla BORTA ur samtliga chunks — egen grep). Radtal oförändrade\n(507/752/1 411). PRECISERINGSFYND: /superanalys + /kalkylator finns EJ i\ngränsnittsvaktens FALLBACK_SIDOR (granssnittsvakt.mjs:68, 6 sidor; 0\nvaktrapporter med sidorna, egen sökning) — ytan rutinmäts ej. Båda sidorna\n200 live. Gap 1 lever (fortfarande 0 egna sviter). Score 7 kvar —\ntextkur + preciseringsfynd, ingen kapabilitetsrörelse (E33/B14).*\n\n*Uppdatering 2026-09-16 (dokvåg s9-u3 omgång 6): gap 3 MOTBEVISAT,");

// ── ÖVERSIKT-tabellen ─────────────────────────────────────────────────────
ers("Ö-A3",
  "| A3 | AI-Mentorn (24 deterministiska svarslager + modellager) | Utbildning | LEVER | 8 | 780/1-testbevis över 30 sviter (mätt 09-17; E01 registeräkthet RÖD 358/390 — rebake väntar, gapet växer 17→23→32); dataset-medianer okopplade; E2E mot levande medlems-API återstår |",
  "| A3 | AI-Mentorn (33 deterministiska svarslager + modellager) | Utbildning | LEVER | 9 | 38 sviter ALLA GRÖNA 0 FAIL (mätt 09-18; E01 STÄNGD: 408/408 fält-för-fält, rebaken höll genom 398→401→408-vågorna); kedjan 98 monsters/33 motorer; dataset-medianer okopplade; E2E mot levande medlems-API återstår |");
ers("Ö-B12",
  "| B12 | Superanalysen + AKM1-kalkylatorn | Analys | LEVER | 7 | Kärnprofilen superanalys-2026 svit-testad (kontroll 22) men klientfilen 0 sviter; länk-gap MOTBEVISAT (MODUL_KURS_LANK lever); klientens vikter oberoende kopia av kärnans (mätt 09-16) |",
  "| B12 | Superanalysen + AKM1-kalkylatorn | Analys | LEVER | 7 | Kärnprofilen svit-testad men klientfilen 0 sviter (mätt 09-18: lever); FOMO-kuren live i prod (chunk-bevis 09-18); ytan UTANFÖR vaktens FALLBACK_SIDOR — rutinmäts ej (nytt, mätt) |");
ers("Ö-snitt",
  "Snittscore: **7,5/10** (287 poäng / 38 system; E33 +1 vid",
  "Snittscore: **7,6/10** (288 poäng / 38 system; A3 +1 vid dokvåg s9-u2 09-18 — E01-kontraktet stängt grönt 408/408 och 38/38 sviter röda-fria; E33 +1 vid");

// ── Ny UPPDATERING-sektion före ÖVERSIKT ─────────────────────────────────
const sektion = `## UPPDATERING 2026-09-18 (dokvåg s9-u2 manifest auto-s9-1789691129810 — A3 + B12 diffade; E27-kollision med syskon u3 hanterad)

Objektval: A3 + E27 (anspråk FÖRE mätning 02:28). KOLLISION under fönstret:
syskon u3:s commit 2301ed2e 02:32 (E34+E26+E27) — E27 AVSTÅTT enligt
disk-först-presedensen (s9-u1 omg 13-mönstret), deras sektion orörd;
KORSVALIDERING nedan. PIVOT: B12 — enda fria systemet med faktisk
src-rörelse sedan senaste passningen (FOMO-kuren 1f43c167 09-17 00:55,
oläst i kartan). u1:s A6-anspråk (02:31) respekterat. Varje rad MÄTT i
arbetsytan 09-18 ~02:3x–02:5x lokal (38 svitkörningar med sanna exitkoder,
egen larvag-synk, git show, grep i prod-chunks, live-sonder loopback):

| Mått | Kartan (förra passningen) | Verkligheten 2026-09-18 (mätning) |
|---|---|---|
| Lagerkedjan (A3, omg 8) | 24 lager (chat-widget.tsx:986) | **33 motorer** — kedjesvitens domslut "disjunkta monster-id:n över alla trettiotre motorer" (egen körning); kedjeraden chat-widget.tsx:1138 (32 ??-led) |
| Frågemonster (A3) | 80 (25 bas + 55 i 23 filer) | **98 unika id** (kedjesvitens id-räkning) — +18 på nio nya lager (optionsdjup, värderingsverktyg ×3, konjunkturindikatorer, kapitalbindning, rörelsekapital/KCC, warrant m.fl.; s6 omg 14–16) |
| Testsviter (A3) | 30 sviter / 781 kontroller: 780/1 | **38 sviter · 38 gröna · 0 FAIL** (samtliga egna körningar med sanna exitkoder: bassviten 555/0 · kedjan 70/0 · warrant 39/0 · alla lagerfiler gröna) |
| E01 registeräkthet (A3) | RÖD 358/390 (gap 32, tre mätningar i rad) | **GRÖN — "408 kurser fält-för-fält — identisk med getCourses()-källan"** (egen körning) — gap 5 STÄNGT |
| Register/larvag (A3) | gapet växer | larvag-synk EGEN körning GRÖN **408=408=408 · 21 profiler · 0 fantomer** exit 0; siffror.json 408 kurser · 8 223 quiz; warrant-lagret ai-mentor-warrant-fragor.ts (09-18 00:31, DI-mönstret) + 32 frågelagerfiler |
| Granskningsstegets text (B12, omg 6) | "Sista chansen att justera…" (FOMO-formulering, outtalt i kartan) | **FOMO-kuren LEVER i prod**: "Efter detta steg låses dina val och resultatet visas" (superanalys.tsx:467; deploybevis: prod-chunk 1wv5cn_5misik.js bär nya strängen, gamla BORTA ur samtliga chunks — egen grep) |
| Kodbas (B12) | 2 670 r (507/752/1 411) | OFÖRÄNDRADE radtal (wc -l) — kuren var 1:1-radsbyte |
| Egna sviter (B12) | gap 1: 0 sviter | **0 sviter fortfarande** (ls: inga testa-superanalys/kalkylator/akm1-filer) — gap 1 lever |
| Vakttäckning (B12) | outtalt | **PRECISERINGSFYND**: /superanalys + /kalkylator finns EJ i gränsnittsvaktens FALLBACK_SIDOR (granssnittsvakt.mjs:68 bär 6 sidor; 0 vaktrapporter i data/vakten med superanalys-träff, egen sökning) — ytan rutinmäts ej; /superanalys + /kalkylator 200 live (egna sonder) |
| E27 (KORSVALIDERING) | u3:s 02:32-commit: v181/182/184 + tre skickaV4-metoder + live-sonder | **OBEROENDE BEKRÄFTAT**: transporten 10 481 r (karta senast bar 8 316); skickaV4InteraktionSvar/KoStyrning/MalStyrning på :1800/:1774/:1752 interface + :5978/:5911/:5871 AppServer + :8788/:8741/:8715 Mock (grep); kommandorutten 209 r dokumenterar POST 28+30; egna live-sonder: /studio 200 · stream 401 · usage-v4 401 · kommando GET 405 |

| Rad | Före → Efter | Skäl (bevis) |
|---|---|---|
| A3 | LEVER 8 → **LEVER 9** | E01-kontraktet (SKÄLET att hålla 8 vid omgång 7+8 — "enda röda kontrollen är själva kontraktbrottet") STÄNGT mätbart: 408/408 fält-för-fält grönt efter tre röda mätningar; disciplinen bevisat hållen genom två efterföljande kursvågor (398→401→408, atomär rebake); 38/38 sviter gröna = kodbasens bredaste testyta HELT röda-fri för första gången. Kvarvarande gap mjuka: dataset-medianer = produktbeslut, E2E kräver levande inloggning, assistent-panel 0 sviter |
| B12 | LEVER 7 → **LEVER 7** | En textkur (beteendeekonomiskt värdefull, ingen kapabilitet) + preciseringsfynd (vakttäckning); kärn-gapen 1 (0 sviter) och 2 (E2E-rendering) orörda (E33/B14-precedensen) |

Snittscore **7,6** (287 → **288** poäng / 38 system; A3 +1 vid denna dokvåg).

Kö till huvudagenten: (1) /superanalys + /kalkylator in i gränsnittsvaktens
sidrotation (FALLBACK_SIDOR bär 6 sidor — B12:s publik yta rutinmäts ej);
(2) B12 klientfilens egna sviter (gap 1, tredje mätningen); (3) A3:s mjuka
gap: dataset-medianer-beslut + assistent-panel (0 sviter kvar).

`;
ers("UPPDATERING-infang", "## ÖVERSIKT — 38 system", sektion + "## ÖVERSIKT — 38 system");

if (t.length <= innan - 1000) { console.error("ABORT: längdförlust"); process.exit(1); }
writeFileSync(KARTA, t);
console.log("KARTA SKRIVEN: " + innan + " → " + t.length + " byte");

appendFileSync(WORKLOG, `
## SPÅR 9 s9-u2 (manifest auto-s9-1789691129810, 2/3) — 2026-09-18 ~02:5x lokal: SYSTEMKARTAN dokvåg — A3 + B12 diffade mot verkligheten; E27-kollision med u3 hanterad [fabrik]

Leverans: A3 AI-Mentorn LEVER 8→9 — E01-kontraktet STÄNGT ("408 kurser fält-för-fält — identisk med getCourses()-källan", egen körning efter tre röda mätningar 358/375→358/390) + hela sviten röda-fri: 38 sviter · 38 gröna · 0 FAIL med sanna exitkoder (bassviten 555/0 · kedjan 70/0 med 33 motorer/98 unika monster-id · warrant 39/0) + larvag-synk EGEN GRÖN 408=408=408 · 21 profiler · 0 fantomer (exit 0) + siffror.json 408/8 223 + warrant-lagret ai-mentor-warrant-fragor.ts (09-18 00:31, DI-mönstret, 32 frågelagerfiler); rebake-disciplinen bevisat hållen genom kursvågorna 398→401→408 (atomär --baka, c3e46af9-mönstret) — omgång 8:s köpost 1 INLÖST. B12 LEVER 7 kvar: FOMO-kuren LEVER i prod ("Sista chansen att justera" → "Efter detta steg låses dina val" superanalys.tsx:467, 1f43c167 09-17 00:55; deploybevis egen grep: prod-chunk 1wv5cn_5misik.js bär nya strängen, gamla BORTA) + PRECISERINGSFYND: /superanalys + /kalkylator SAKNAS i gränsnittsvaktens FALLBACK_SIDOR (granssnittsvakt.mjs:68, 6 sidor; 0 vaktrapporter med sidorna) = ytan rutinmäts ej — kö till huvudagenten; radtal oförändrade 2 670; gap 1 lever (0 egna sviter); båda sidorna 200 live. KOLLISIONSHANTERING: E27 (andra valet, anspråk 02:28) togs av syskon u3:s commit 2301ed2e 02:32 (E34+E26+E27) — AVSTÅTT enligt disk-först-presedensen, deras sektion orörd; mina E27-mätningar bokförda som OBEROENDE KORSVALIDERING (transport 10 481 r mot kartans 8 316; tre skickaV4-metoder ×3 lager; kommandorutt 209 r; egna live-sonder /studio 200 · stream 401 · usage-v4 401 · kommando 405 — bekräftar deras bild exakt). u1:s A6-anspråk (02:31) respekterat. Snitt 7,5 → 7,6 (287→288/38; A3 +1). Kö: (1) B12-sidorna i vaktens sidrotation; (2) B12-klientsviter; (3) A3:s mjuka gap (dataset-medianer, assistent-panel). Metod: anspråk FÖRE mätstart (omg 13:s lärdom infriad), en-träff-ersättningar med abort-grind, EN skrivning + omedelbar commit; endast data/forskning/SYSTEMKARTAN.md + worklog + anspråksfil + verktyg/_s9u2-0918-* berörda = INGET bygge; src/ orörd (tsc 0 via grinden); R2 orörd; data/blogg/ orörd. [fabrik]
`);
console.log("WORKLOG APPENDAD.");
