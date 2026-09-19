# KONTROLL 2026-09-19 — medieaktier-sa-analyserar-du-medie-och-streamingbolag (B17, svenska originalet)

**Granskare:** fabriksagent s1-u1, manifest auto-s1-1789829700743 (granskningskön 1/3).
**Objekt:** `data/blogg-utkast/medieaktier-sa-analyserar-du-medie-och-streamingbolag.json` — byggd av s3-u3 (commit 3b355abd 09-16 22:18, "B17 medieaktier", 32/32 egenkontrollerade tal).
**Källfil LÅST till byggtidens vintage:** `data/portfolj-system/bolagsunivers.json` @ c256c659 (universum 138 poster, 2026-09-16 21:51 — sista universum-commit FÖRE utkastets byggtid 22:16; dagens träd 201 poster = B13-glidningen).

## PIVOT (köregeln)

Uppdragstitelns "m9-utkast #1" (boerspsykologi-fallstugor) är levererat två gånger
(09-14 huvudgranskning + 09-16 KONTROLL, commit 02224ea4) och m9-serien är 6/6
granskningsklar sedan 8448ef77 — duplikatregeln tvingade pivot (ca tionde
omgången i raden med samma malltext). FIFO-val med kollisionskontroll (anspråk
skriven FÖRSTA handlingen: `data/vakten/auto-s1-1789829700743-s1-u1-ansprak.md`):
**medieaktier = äldsta ogranskade rotutkast** (09-16 22:16); 0 medieaktier-filer
i granskning/, 0 syskonanspråk på objektet. Syskonen noterade FIFO-nästa i
anspråket (livsmedelsaktier 22:17, fastighetsaktier-en 09-17 03:26 m.fl.).

## DOM: FLYTTKLAR

Två icke blockerande förslag (C1 rekommenderas verkställt) + tre flaggor/beslut.
Ingen tvingande rättning; inget tal motbevisat.

## PAKETET (uppdragets fyra punkter)

### 1. Källor
- **Externa IR-domäner (6):** viaplaygroup.com 200 · mtg.com 200 ·
  thewaltdisneycompany.com 200 · wbd.com 403 · ir.netflix.net 403 ·
  investors.spotify.com 403 — 403-trion = bot-skydd (B9-presedens, ej döda
  länkar; byggagenten noterade samma mönster 09-16).
- **Verklighetskontraster (WebSearch):** Viaplay FY2023 omsättning 18,56 mdr kr
  ≈ "18,6" + miljardförlust 9,7 mdr kr bekräftade (Affärsvärlden/Dagens Media
  2024-01); MTG 2022-engångsposten = avyttringen av ESL Gaming till Savvy
  Gaming Group (USD 1 050 M, avslutad Q2 2022; MTG IR/Reuters) — belopp 6 475
  Mkr i universumet ✓ men benämningen i utkastet oexakt, se C1.
- **Universumet:** samtliga tal spårbara till vintage-poster; källor Yahoo+
  MarketStack 2026-09-03 (fem bolag) + StockAnalysis 2026-09-15 (Spotify).

### 2. Siffror — 49 maskinella kontroller, 0 FEL (verktyg/_s1u1-medie-verify.mjs)
- **Universumtal 36/36 exakta:** Netflix 11 (oms 31,6→45,2 mdr USD; brutto
  49,1 %; bruttovinst 22,19 ≈ "omkring 22" mdr; res 4,5→11,0 mdr; CAGR
  12,640 % = "12,6"; skuld/EK 0,5524→0,55; ROE 49,54→49,5; P/B 11,425→11,4) ·
  Spotify 4 (−532 M → +2 212 M; 0,06; 44,48→44,5) · Disney 3 (2,354→2,4;
  12,404→12,4; 0,394→0,39) · Viaplay 7 (toppoms 2023 18,567→18,6 mdr kr med
  toppårs-index kontrollerat; brutto 14,95 % → halv-upp 1 dec = 15,0 —
  GRÄNSNOTIS enligt finansbolagspresedensen ROE 14,550→14,6; härledd
  bruttovinst 2,785 = "knappt 2,8"; res2023 −9,747→−9,7; skuld 3,2952→3,30;
  ROE −52,87→−52,9; P/E null ✓) · WBD 6 (res −11,311→−11,3 mdr USD 2024,
  +0,727→+0,7 2025; P/B 2,168→2,2; P/E null ✓; fcfMarginal 44,77→44,8) ·
  MTG 6 (res 6,475→6,5 2022; 0,164→0,2 2023; −210/−62 Mkr = "sedan till
  förluster" ✓; P/B 1,397→1,4; P/E 93,592→93,6; PEG 0,52 exakt).
- **Räkneexempelens aritmetik 5/5:** 10 M × 120 kr × 12 = 14,4 mdr ✓;
  14,4−12 = 2,4 ✓; +1 M abonnenter = +1,44 mdr ✓; 15,84−12 = 3,84 ✓;
  3,84/2,4 = 1,6 = "+60 procent" ✓.
- **Sektor-sammansättning:** de sex namngivna bolagen finns i vintage-kommunikation-grenen
  (13 poster = 6 medie + 6 telekom + META); utkastets "sektorn sex bolag" gäller
  medie-delmängden efter ingressens EGEN telekom-avgränsning — försvarbart, se C2.
- **Metadata:** title 55 tkn (≤60) ✓; description 153 tkn (norm 150–160) ✓;
  1 218 ord / 9 635 tecken.

### 3. Juridik-språk (2007:528) — REN
- `verktyg/juridikgrind-vakt.mjs --json`: **0 fynd för filen** (registrets 25
  VARNING är globala, inget rör detta utkast; filen stod ej i flyttklara-listan
  = frånvarande granskningspost, nu skapad av denna rapport).
- Textuell sond: **0 rådgivningsglossor** ("köp/sälj/rekommenderar/råd" som
  fristående verb — 0 träffar); disclaimer tidig i källraden och avslutande
  sista raden ("pedagogisk finansanalys, inte investeringsråd") ✓.
- **Inga åberopade lagrum** i bodyn ⇒ lagrumsblandning (2007:528/2022:260/
  2022:261/1985:716) omöjlig.

### 4. 911-referenser — 0/6 mönster
"911", "11 september", "september 2001", "9/11", "terror", "Terrordåd":
0 träffar i hel filen.

### Komplettpunkter
- **Interna länkar 20/20 HTTP 200 mot levande sajten** (localhost:3000).
  LÄRDOM: första körningen under pågående prod-deploy (flock upptaget) gav
  20×404 — transient, inte länkfel; omkörning efter låset frigjordes = 20×200.
  Släkt-läxa: kontrollera deploylåset FÖRE länkdom.
- **Registernärvaro:** 7/7 bloggmål LIVE-filer i data/blogg/ (0 mot outgivna
  utkast) ✓; 13/13 kursmål i registret (larvag-karta.ts + deep-courses-data.ts
  m.fl.) ✓. Not: bloggslugen "arr-tillvaxt-vad-ATKOMMANDE-intakter-sager" är
  ovanlig stavning men matchar exakt den publicerade filen — korrekt länkat.

## FYND

- **C1 (förslag, rekommenderas):** "från avyttringen av nöjesverksamheten" →
  "från avyttringen av esportbolaget ESL Gaming". Engångsposten 2022 är
  verklighetsbevisat ESL-försäljningen (Savvy Gaming Group, USD 1 050 M,
  Q2 2022); "nöjesverksamheten" är varken felaktigt eller identifierbart —
  läsaren kan inte söka fram objektet, och MTG självt benämner sig
  esport/gaming. Pedagogikvinst utan längdförlust.
- **C2 (förslag):** "I AK1A:s hundraaktieuniversum bär sektorn sex bolag" →
  "…bär mediesektorn sex bolag". Kommunikation-grenen har 13 poster; efter
  ingressens telekom-avgränsning är läsningen entydig, men "mediesektorn"
  gör den självbärande och immun mot framtida gren-tillväxt.
- **D1 (dataflagga åt spår 2/dataägaren, ej utkastfel):** universumets SPOT-post
  bär Spotifys publicerade EUR-tal (−430/−532/+1 138/+2 212 M€ exakt) men
  valuta-fältet "USD" (StockAnalysis-källan). Utkastets "miljoner euro" är
  KORREKT mot verkligheten — texten är bättre än dataetiketten; valuta-fältet
  bör rättas i universumet vid nästa beröring.
- **D2 (beslut, R2):** publishedAt 2026-09-16 = skapandedagen (serieskonvention;
  publiceringsdatum förblir kundens vetorätt).
- **C3 (konventionsfråga åt fabriksägaren):** readingMinutes 2 mot 1 218 ord.
  Seriens majoritetskonvention /600 ger round(1218/600)=2 GRÖNT (energi/
  industri/finans/mx1); /200-tolkningen (bilaktier-precedensen 09-19) ger 6.
  Värdet 2 står kvar i väntan på seriebeslut; Notis om att bilaktier-fallet
  skapade motstridighet i spåret.

## NOTISER (transparens)
- N2/N3: Viaplay-brutto (15,0 %) och WBD-fcf (44,8 %) är nu-talsfält i
  universumet utan årliga serier — utkastets tidsbindning till 2023/2024 är
  rimlig tolkning men ej separat verifierbar ur universumet (båda talen
  värdekontrollerade mot fälten).
- E-VPLAY-brutto 14,95 % → "15,0" ligger exakt på avrundningsgränsen; halv-upp
  är seriens dokumenterade konvention (finansbolags-KONTROLL 09-17). Sondens
  första körning flaggade den som FEL med felkalibrerad tolerans (< 0,05
  exklusiv) — sondbugg rättad FÖRE dom enligt ärlighetsdoktrinen, omkörd:
  49 OK / 0 FEL.
- **-en-spegeln:** `medieaktier-…-en.json` (09-18 16:16, ogranskad) bär
  sannolikt identiska C1+C2 — speglas vid verkställning.

## KVD
Endast data/ + verktyg/ + worklog = INGET bygge; src/ orörd; tsc-baslinjen
orörd (pre-commit-grinden verifierar vid commit); R2 orörd (priser/tier/
publicering/publishedAt = kundens); data/blogg/ orörd (utkastet ligger kvar i
data/blogg-utkast/); utkast-JSON:en orörd (granskaren skriver inte om andras
filer — rättningar verkställs av guidens ägare via diff-filen); syskonytor
orörda. Könotis åt nästa omgång: 31 rotutkast kvar (livsmedelsaktier 09-16
22:17 näst äldst; alla -en-speglar; krypto, lyx, logistik, utbildning m.fl.).
