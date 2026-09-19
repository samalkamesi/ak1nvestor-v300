# KONTROLL 2026-09-19 — livsmedelsaktier-sa-analyserar-du-livsmedelsbolag.json

**Granskare:** fabriksagent s1-u2 (manifest auto-s1-1789829700743, spår 1 granskare 2/3).
**Anspråk:** data/vakten/auto-s1-1789829700743-u2-ansprak.md — disk-först, före mätning.
**Sond:** verktyg/_s1u2-livsmedel-verify.mjs (65 maskinella kontroller; utmatning återgiven nedan).
**Dom: FLYTTKLAR EFTER RÄTTNING (B1–B5; C1–C2 beslutas av ägaren; D1 vid export). Publicering = kundens beslut (R2).**

## VAL (pivot enligt köregeln)

Uppdragstitelns "m9-utkast #2" (branschmedianer-akm2 v2) är komplett sedan 09-16 14:35
(commit 8448ef77) — m9-serien 6/6; fjärde s1u2-pivot-fallet i raden (spelaktier 09-18,
bilaktier-komplement + detaljhandel-komplement + flyg 09-19). FIFO bland ogranskade
rotutkast: medieaktier togs av syskon u1 (anspråk 16:56, deras NOTIS pekar ut
livsmedelsaktier som nästa) ⇒ **livsmedelsaktier (09-16 22:17, näst äldst)**.
0 kollisioner: 0 livsmedelsaktier-filer i granskning/, 0 syskonanspråk på objektet.

## GRANSKNINGENS FYND (B-klass = verkställs före flytt; söksträngar maskinverifierade unika ×1)

- **B1 readingMinutes 2 → 6.** 1 167 ord textrensat ⇒ ord/200-praxis 6 (584 ord/min
  vid nuvarande värde; publicerades max 240). NIONDE fallet i klassen (substansrabatt,
  halvledar, hälsa, konsumentaktier, försvar, spelaktier, detaljhandel, flyg — därtill
  detta). Byggd 09-16 22:17, före första domen 09-17.
- **B2 kassaflödesetikett: "från verksamheten" → "fritt kassaflöde".** Texten: "Coca-Cola
  redovisade 2022 kassaflöde från verksamheten i nivå med resultatet (9,5 mot 9,5
  miljarder dollar); 2025 är källans serie 5,3 mot ett resultat på 13,1." Universumets
  fält för serien 9 534/9 747/4 741/5 296 M$ är **fcf** (fritt kassaflöde) — inte
  kassaflöde från verksamheten. Talen är paritetsrätt (9,534/9,542; 5,296/13,107) men
  etiketten pekar på fel nyckeltal: KO:s driftskassa översteg 2022 resultatet, och
  fallet 2024–25 är just det universumsnoten förklarar (IRS-skadeståndet 6,0 mdr USD
  betalat i kashtäthet medan intäkterna bokförs löpande). Rättning: byt etiketten i
  båda led; notens IRS-förklaring kan med fördel läggas som parentes av ägaren —
  textens öppna fråga ("en fråga du vill ha svar på") är pedagogiskt hedervärd och
  kan stå kvar.
- **B3 universumglidning: "median 20,4 (kvartiler 17,9–22,4 i universumets 14 bolag)".**
  Git-bevisat EXAKT sant mot byggtidens vintage: c256c659 (09-16, commit före byggandet
  22:17) ger konsumentbranschen n=14 med P/E, median 20,45, kvartiler 17,9–22,4 —
  siffrorna är ALLTSÅ INTE ett byggfel. Dagens universum (201 poster) bär 28
  konsumentbolag med P/E: median 18,21, kvartiler 15,2–22,3 (29 konsumentrader totalt)
  — påståendet "på samma data" förfaller, tredje glidningsfallet i serien efter
  halvledar-C1 och flyg-B1/B2 (där det första var rent innehållsdrivet). Rättning:
  datera ("i universumets då 14 konsumentbolag, vintage 2026-09-16 — se Branschmedianerna
  för dagsläget") ELLER räkna om mot dagens vintage vid flytt; sistnämnda ändrar
  kontrasten (kvartettens 17,8/18,2 under medianen, 26,7/27,4 över — berättelsen
  håller även med nya tal men marginalen krymper: dagens median 18,2 ligger nära
  Carlsbergs 18,2).
- **B4 stavfel "Raknat på ett exempel" → "Räknat på ett exempel"** (första H2-sektionen,
  andra stycket).
- **B5 stavfel "räntkänsliga" → "räntekänsliga"** (multipel-sektionens sista stycke;
  bilaktier-A1/flyg-B6:s felklass, här två separata träffar i samma ordklass).

## C-förslag (ägaren beslutar; inte blockerande)

- **C1 "försvaraktiva kassaflödesmaskiner" → "defensiva kassaflödesmaskiner".**
  "Försvaraktiga" är inte etablerat ord (blandning av "försvars-" och "defensiv");
  branschterminologin är "defensiva".
- **C2 PEG-parentesens "dyrt"/"billigt" om namngivna bolag** — detaljhandel-K1:s
  gråzon. "Coca-Cola får PEG 12,6 (dyrt på en svag vinstprognos om 2,1 procent),
  Nestlé 0,45 (billigt på en deprimerad bas)". Bedömning här: grönt i sak — det är
  PEG-TALET som döms enligt måttets egen terminologi (>1 dyrt, <1 billigt relativt
  tillväxt) och parentesen förklarar talet, ingen handlingsuppmaning finns; grinden
  0/26 fraser, 0 lagrum. Vill ägaren ha tal-centrerad form: "PEG 12,6 — talet
  signalerar dyrhet på en svag vinstprognos om 2,1 procent … 0,45 — billighet på en
  deprimerad bas".

## GRÖNT DÄRUTÖVER (sondens mätning)

- **Källtalsparitet 38/38 EXAKTA** mot data/portfolj-system/bolagsunivers.json
  (PEP StockAnalysis-vintage 09-16: oms 86,392→93,925 M$, CAGR 2,83, brutto 54,17,
  moat-medel 54,26, spread 1,59 pp, resultat 8,24, mcap 183,67, ROE 51,51, ROIC 19,38,
  skuld/EK 2,39, P/E 17,76, PEG 1,25 · KO 09-16: brutto 61,89, oms 47,941, resultat
  13,107, mcap 381,68, ROE 42,05, ROIC 20,10, skuld/EK 1,16, P/E 26,66, PEG 12,64,
  prognos 2,11, fcf 9,534/5,296 · NESN 09-15: oms 94,780→89,885, CAGR −1,75, brutto
  45,70, trailing 27,39, forward 17,04 (notbelagt), PEG 0,45 · CARL Yahoo 09-03:
  brutto 44,99, resultat −40,788/+9,116/+5,955, oms 2023 73,585, P/E 18,151).
- **Ingressens källspann "(2026-09-03–16)" EXAKT** mot de fyra hamtat-fälten
  (09-03 CARL · 09-15 NESN · 09-16 PEP/KO).
- **Aritmetik 9/9** egenomräknad: 1,04×0,99=1,0296 · PEP-CAGR 2,83 % · NESN-CAGR
  −1,75 % · råvaruhävstången 45→49,5/100⇒50,5 (fall 4,5 pp) · pris+3 %:
  53,5/103=51,94 % · duopolet 93,9/47,9=1,96× ("nästan dubbelt") · engångs
  40,8/73,6=55,4 % ("mer än hälften") · KO-PEG 26,66/2,11=12,64. SOND-ÄRLIGHET:
  tre FEL-rader i sonden var toleransfel i VERKTYGET (krävde <1 pp avvikelse på
  tal texten avrundat till en decimal: 2,826→2,8, −1,752→−1,8, 51,94→51,9 — alla
  textvärden korrekta avrundningar); spelaktier-precedensen: verifiera verktyget
  innan verktyget får döma.
- **Juridik 2007:528 REN**: varumärkesgrinden 0/26 förbjudna mönster × 3 ytor
  (title/description/body) · rådglossor med ordgräns 3 träffar, samtliga deskriptiva
  företagsbeskrivningar ("bolag som tillverkar och säljer det vi äter", "maten köps
  i uppgång som i nedgång", "säljer koncentrat och sirap") — noll imperativ ·
  0 lagrum i texten ⇒ ingen blandningsrisk (2022:260/261/1985:716/2005:59 os nämns
  ej) · utbildningsram i ingressen ("Den här guiden går igenom mekaniken steg för
  steg") · disclaimer exakt sista rad ("_Detta är pedagogisk finansanalys, inte
  investeringsråd._") · verktygen presenteras som kurser/övning.
- **911 = 0/6 mönster** (911, 9/11, 11 september, september 11, eleven september,
  nine eleven).
- **13/13 unika interna länkar HTTP 200 mot localhost** — kursankaret se-14-livsmedel
  LEVER; övriga: v07-bruttomarginal, v14-varumarke, v09-roe, v10-skuldsattningsgrad,
  km-004-noter, km-009-pe, v01-forsaljningstillvaxt, km-006-kvartalsrapporten +
  3 bloggmål (roic-v11, peg-svagheter, branschmedianer, komplett-guide). 0 utkastlänkar.
- **Struktur grön**: 8 H2 (seriekonvention) · title 50/60 · description 151/155 ·
  sökordet "livsmedelsaktier" i title+description+ingress+första H2 · 5 tags ·
  0 mjuka bindestreck (sondens 29 träffar = Coca-Cola ×11, Frito-Lay samt URL-slugs
  i länkar — alla etablerade namn) · publishedAt 2026-09-16 = skapandedatum
  (seriekonvention, D-notis vid export).
- **Universum-noter ärligt återgivna**: Carlsbergs "resultattillväxt markerad som
  osatt" = universums not ("resultatCAGR osatt: negativt/noll resultat basåret") ·
  Nestlés forward-17,0 = notens 17,04 med nedskrivningsförklaring · "källans serie"
  om KO:s 5,3 är korrekt källtrogen formulering.

## NOTISER

- **N1 spegling -en**: livsmedelsaktier-…-en.json (09-18, ogranskad) bär B1+B3:s
  systrar verifierade ("14 companies" ×1, median "20.4" ×2, kvartiler 17.9–22.4,
  rm 2 vid 1 243 ord ⇒ 6) — speglas vid verkställning. B4/B5 är svenskstavfel och
  gäller ej spegeln (C1:s "defensive" skrivs rätt på engelska).
- **N2 systemflagga rm**: nionde fallet — konventionen (ord/200) finns fortfarande
  ej i byggarnas KVD-mall (samma eftersläpning som detaljhandel-F1/flyg noterade;
  verktygsägaren).
- **N3 systemflagga glidning**: tredje fallet — "på samma data (N bolag)"-citat
  förfaller när universumet växer (135→201 sedan 09-16). Förslag (flyg-F2 upprepat):
  as-of-datering i texten ELLER motorisk omräkning vid flytt.

## KVD

Endast data/ + verktyg/ + worklog berörs = INGET bygge; src/ orörd (tsc-baslinjen
bärs av pre-commit-grinden); R2 orörd (priser/tier/publicering); data/blogg/ orörd
(live-mappen); utkast-JSON:en orörd (granskaren skriver ej om andras filer);
syskonytor orörda (u1:s medieaktier-pågående arbete lämnas ifred); commit MED pathspec.
