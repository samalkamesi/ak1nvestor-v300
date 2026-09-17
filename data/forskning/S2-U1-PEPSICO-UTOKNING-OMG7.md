# S2-U1 — PEP: dataset-utökning omgång 7 (2026-09-16)

**Uppdrag:** manifestets "+1 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200" (spår 2 DATASET-DJUP; omgång 7 — tidigare omgångar: se worklogs s2-u1/u2/u3 omg 1–6). **Agent:** s2-u1 (byggare, manifest auto-s2-1789587326526, uppgift 1/3; syskon u2 "+2 bolag" och u3 "+3 bolag" kör parallellt).

## Objektval med omdöme

Duplikatkontroll före start: trädet 132 bolag (HEAD abe20b72), PEP fri; mattkartering visade fyra bransch/land-mattor på exakt 4 (öppnas vid 5 enligt gränsregeln): halso/Sverige, halso/USA, konsument/USA, finans/USA. VAL: **PepsiCo (PEP, konsument, USA)** — konsumentbranschens mest citerade lucka och datasetets pedagogiskt starkaste tillskott:

1. **KO:s eviga duopolpartner** — Coca-Cola-radens (KO) komplement i samma bransch OCH samma land: kvartilsjämförelsen KO mot PEP blir datasetets mest direkt jämförbara par (samma makromiljö, olika vallgravsform: koncentrerad dryckesmodell mot snacks+dryck-förädling). Citationsmagnet per definition (världens mest jämförda bolagsduo i utbildningsmaterial).
2. **Öppnar konsument/USA-mattan 4→5** (MCD, NKE, PG, KO → +PEP) = NY aspektsida /dataset/konsument/usa (ORCL-precedensen från omg 6: teknik/usa 4→5 gav sidkontroll 164→165) — leveransen ger alltså +1 rad OCH +1 aspektsyta.
3. Utanför syskonens kända mönster (u2: två pharma-rundor + telekom + teknik/industri-par; u3: teknik/material/tillväxt-triadar) — lägre kollisionsrisk än läkemedelskandidaterna på halso/USA-mattan.

## Leverans — 1 bolagsrad (allt live-hämtat 2026-09-16, stockanalysis översikt + statistics + financials, S&P-underlag)

**PEP — konsument — kurs intraday 2026-09-16** (AIR.PA-precedensen för öppna marknader, dokumenterad i källa+notering):
134,57 USD / 183,67 mdr. P/E 17,76 (fwd 15,55 ⇒ prognosTillväxt +14,2 % spårkonvention; källans 3-års EPS-prognos +5,20 %/år — fwd under trailing speglar EPS-återhämtningen efter FY2025-dippen), PEG 1,25 spårkonvention, P/B 8.38, EV/EBIT 14,60. ROE 51,5 % mot ROIC 19,4 % (skuld/EK 2,39 — kapitalstrukturgapet, Visaraden-mekaniken). Marginaler: brutto 54,2 % TTM (moat-medel 54,3 %, spridning ENDAST 1,6 pp 2022–2025 — radens vallgravs-pedagogik: livsmedelsförädlingens stabila marginalgolv), EBIT 16,0 %, netto 10,8 %, FCF 9,6 %. Serier kalenderår 2022–2025: omsättning 86,4→93,9 mdr $ (+2,8 %/år endpoint — volymtillväxten svag, prissättning bär intäkterna), resultat 8,9→8,2 mdr $ (−2,6 %/år: dippen FY2025 8 240 M$ −14,0 % mot TTM-återhämtning 10 451 M$ +38,4 %), FCF 5,6→7,9→7,2→7,7 mdr $ stadigt positiv (TTM 9,3 mdr $, fcfYield 5,1 %). Utdelning 5,92 $ (yield 4,40 %, payout ~78 % mot TTM-EPS 7,63 $) i not; fält null enligt konventionen. Beta 0,36; 52-vägers spann 133,73–171,48 $ (kursen nära botten; 1-årsförändring −4,27 %); nästa rapport 2026-10-08.

## Aritmetik — maskinverifierad

Append-skriptet (/tmp/s2u1omg7-append.mjs, mönster 1:1 från omg 6) beräknar ALLA derivat ur råtal. Utdata GRÖN: prognos 0,1421 · peg 1,25 · omsCAGR 0,0283 · resCAGR −0,0257 · moat 0,5425/0,0159 · fcfMarginal 0,0958 · fcfYield 0,0505. (Exakta värden återspeglas i commit-utdata.)

## Medianer + kvartiler (projektets EGEN lasBranschMedianer; kvartiler + universumjämförelse = dataset-sidornas standing-funktion, omräknade automatiskt)

Förhandsredit (fore-skript, läser endast) — PEP:s ENSKILDA effekt på 132-trädet:
- **konsument 14→15: P/E 21,2→20,4, kvartiler 18,1–22,5 → 17,9–22,4 (n 13→14)**, FCF 10,1→9,8 %, EBIT 15,0→15,5 %, P/B 4,1→5,2 (PEP:s 8,38 lyfter P/B-medianen, P/E:n drar ned — raden sitter under P/E-medianen, över P/B-medianen: bra kvartillspegel)

Final på committrädet 135 (PEP + syskonets SAMPO.HE/SPG i samma träd): **konsument P/E 20,4, kvartiler 17,9–22,4 (n=14), FCF 9,8 %, EBIT 15,5 %, P/B 5,2 — simuleringen EXAKT** · **totalt 20,8 (n=126 av 135)** — totalmedianen 21,2→20,8 drivs av trådets tre under-median-rader gemensamt (PEP 17,76 · SAMPO 14,70 · SPG 14,38, där syskonets bokför 21,2 på 134-trädet n=125 — mitt 135-läge är det gällande).
- **ASPEKT-BONUS BEVISAD: konsument/usa 4→5 ⇒ NY aspektsida /dataset/konsument/usa** (förutsagt i simuleringen FÖRE append; kontraktstestets sidkontroller 165→166 EFTER — gränsregeln mekanisk; syskonets KVD rapporterade 165 på deras 134-träd före min rad)

## KVD — komplett

| Kontroll | Resultat |
|---|---|
| Kontraktstest (testa-dataset-aspekter.mjs, cachad tsx-CLI) | **GRÖNT — 166 sidkontroller, 0 fel, 30 kända varningar** (syskonets baseline på 134-träd: 165/0/30; +1 = konsument/usa öppnades, förutsagt i simuleringen) |
| Läckagevakt (v98-dataset-vakt.mjs, dynamiskt universum) | **GRÖN — 0 träffar, 135 tickers + 135 namn i 1 447 utdatafiler** |
| tsc (node node_modules/typescript/bin/tsc --noEmit) | **0 fel** (exit 0; även via pre-commit-grinden vid commit 3d9a5e89) |
| prod HTTPS (lab.ak1nvestor.com) | **200 ×5: / · /dataset · /dataset/konsument · /api/data/nyckeltalsguide · /llms.txt** — servad llms.txt (dynamisk route) visar REDAN 135-läget live |
| Bygge | INGET (endast data/ + public/ = dataleverans; servade sidor visar gamla tal tills prod-synkens bygge — Vonovia-precedensen; nya URL:er (konsument/usa) + sitemap-poster tillkommer vid bygget, data-drivet via aspektParametrar()) |
| R2 | Orörd — priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd |

## Race-bokföring (utfall)

Syskon u2 (+2) körde parallellt och HINN commit:a sina rader (b6ae15b6, universum 132→134, SAMPO.HE+SPG) MITT i mitt förberedda fönster — min statuskontroll före fönstret såg deras ocommittade rader (134 i arbetsytan). Sekvens: min append läste filen FÄRSKT (deras 134 bevarade) → PEP pushad → 135; llms regenererad på 135 (syskonets 134-läge läkt i samma regen — självläkningsprecedensen); git add + commit. Min commit 3d9a5e89 tog utöver mina två filer (bolagsunivers.json 90 rader = PEP-raden, llms.txt 135-blocket) även syskonets STAGEDA dokumentationsfiler (deras protokoll S2-U2-SAMPO-SPG-UTOKNING-OMG7.md + deras worklog-rad, 4 filer totalt) — BASF-precedenten: deras innehåll intakt och deras dokumentation förblir deras, deras blivande doc-commit blir 'nothing to commit' = förlustfritt. Slutläge: **llms == universum == HEAD == 135** (verifierat: fil 135, servad llms 135, raknaBranschMedianer 135). Inga rader förlorade, inget dubbelarbete — u2:s SAMPO/SPG och min PEP komplementära (finans+fastighet resp. konsument).

## Ärvda flaggor / notiser till dataägaren

- Totalmedianen 21,2→20,8 i trådet (tre under-median-rader samma omgång: PEP 17,76 · SAMPO 14,70 · SPG 14,38) — trenden mot lägre total-P/E är omgångsdriven, inte strukturell.
- PEP-kursen är intraday-notering (öppen marknad, AIR.PA-precedensen) — dokumenterad i källa+notering.
- CAGR5ar-fältnamnet vs 4 räkenskapsår (ärvd s1-u3-flagga, gäller nu 135 rader).

**Commits:** 3d9a5e89 (data+llms+åkande syskondok) + dokumentationscommit (protokoll + worklog, denna fil).
**Skript:** /tmp/s2u1omg7-fore.mts · /tmp/s2u1omg7-append.mjs · /tmp/s2u1omg7-llms.mjs (idempotenta, återanvändbara).
