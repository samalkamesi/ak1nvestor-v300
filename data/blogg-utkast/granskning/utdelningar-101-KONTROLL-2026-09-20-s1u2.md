# KONTROLLGRANSKNING m9-utkast #2 — utdelningar 101 (v1) — 2026-09-20, oberoende aktualitets- och flyttklarhetspass

**Objekt:** `data/blogg-utkast/m9-ko/utdelningar-101-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (e), seed `904e0fcc…`, kvittots kandidatMd5 `2b2cf3e5…` [genereringstillståndet])
**Granskad:** 2026-09-20 kl 19:4x CEST av fabrik auto-s1-u2, omgång `auto-s1-1789925707056` (agentfabrik, spår 1 — granskare 2/3)
**Relation till tidigare granskningar:** huvudgranskad 2026-09-14 (`granskning/utdelningar-101.md`, FLYTTKLAR EFTER RÄTTNING — F1 rättat i utkastet) · maskinell KONTROLL 2026-09-16 (`granskning/utdelningar-101-KONTROLL-2026-09-16.md`, 74 kontroller 0 fel, dubbelriktat determinismbevis). **Detta är tredje passet** och fyller två luckor som ingen tidigare våg täckt: (1) dagens aktualitetsläge — källan `bolagsunivers.json` rörde sig **i morse 07:59** (universumets tillväxtvåg) och F3-flaggans status i fabrikkoden har inte omkontrollerats sedan 09-16; (2) själva **flyttklara paketet** — den exportklara posten med kvitto-avsnittet strippat har aldrig byggts för serien (uppdragstiteln begär just "flyttklart paket med diff-rapport").
**Val-notis:** uppdragstitelns "m9-utkast #2" matchar sammanställningens egen rad **m9-2 = utdelningar-101-v1.json**. Notera numreringsdrift mellan rapporter (09-16-rapporten kallade serien "#5") — objektet är dock entydigt. Syskonen u1/u3 startade parallellt 19:35 med tomma loggar; deras naturliga titel-matches (m9-1 boerspsykologi, m9-3 kassaflödesanalys) är redan oberoende granskade 09-19 (rond 101/102), varför deras köregel borde föra dem till andra objekt. Kollisionskontroll före skrivning: inga filer med `utdelningar-101-*2026-09-20*` fanns i granskningsmappen. Mina filer bär s1u2-suffix.
**Off-gräns:** publicering = kundens beslut (R2) — INGET har flyttats till `data/blogg/`, databasen orörd, inga priser/tier rörda, utkast-filen själv EJ ändrad (nedan bevisat).

## BEDÖMNING: FLYTTKLAR — 0 nya rättningar i utkastet, 37/37 kontroller gröna, paket levererat

**Egen sond `verktyg/_s1u2-utdelningar-kontroll.mjs` (37 kontroller): 37 OK · 0 FEL.** Ärlighetsbokföring: första sondkörningen rapporterade 7 falska "fel" som var **sondens egna buggar** (två klasser: procent med komma jämfört mot punkt — "22,7" vs "22.7"; A2 jämförde varumarke-raden mot bolagsunivers-filens md5). Sonden rightades och omkördes — samtliga 37 gröna är förtjänta, inte kalibrerade.

---

## 1. Filintegritet — utkastet orört sedan 09-14-rättningen

- `git log --follow`: sista commit som rör filen = **def22bb3 2026-09-14 18:06:46 +0200** ("m9-granskning utdelningar-101 — FLYTTKLAR EFTER RÄTTNING (1)"); `git diff HEAD` för filen = **tom**. Filen är alltså **oförändrad genom 09-16-kontrollen fram till nu** — 09-16-rapportens post-edit-hashar gäller fortfarande.

## 2. Källor — md5-kedja oberoende recreerad

| Källa | Kvitto-md5 | Status 2026-09-20 19:4x |
|---|---|---|
| `data/portfolj-system/bolagsunivers.json` | `f4cee658…` | Skiljer i dagens träd (`cfa7a9f1…`, **231 bolag**). **Original oberoende återvunnet ur git: commit `f3f56268` ger md5 `f4cee65860922e53ded546aefaf7ca02` — EXAKT MATCH** (egen omräkning mot detta). |
| `data/varumarke.json` | `9b906e42…` | **MATCH** — oförändrad i dagens träd (md5sum verifierad). |

## 3. Siffror — egen omräkning mot git-återvunnet original (17 kontroller, alla exakta)

- **n och median:** fcfYield mätt för **87 av 100** · kvitto säger "median 3 %" — egen omräkning: **exakt 3,01 %** (87 värden, sorterat mittenvärde). Grön även på siffervärde, inte bara avrundning.
- **Fördelningen:** >5 %: **26** · 2–5 %: **28** · <2 %: **33** · negativa: **9** — summakontroll 26+28+33 = 87 = n mätta ✓ · delmängdskontroll rent 0–2 % = 24 (33 − 9) ✓ · **gränsfallskontroll: 0 värden exakt på 2,0/5,0 %** (bucket-kanterna entydiga — ny kontroll denna våg; tidigare pass kollade inte kanterna).
- **Topp-5:** WBD 22,7 % (kommunikation) · INDU-C.ST 17,1 % (industri) · TELIA.ST 11,9 % (kommunikation) · NHY.OL 10,8 % (material) · ERIC-B.ST 9,7 % (teknik) — **egen sortering av originalfilen ger exakt samma fem, i samma ordning, med samma avrundning, ticker och bransch** ✓.
- **Avgränsning:** källans 6–8 (STERV.HE 9,4 · SHEL 8,4 · VZ 8,4) förekommer inte i utkastet ✓.
- **Kortnamn:** Warner Bros. Discovery / Industrivärden / Telia Company / Norsk Hydro / Telefonaktiebolaget LM Ericsson — samtliga känner igen källans fullständiga namn ("Warner Bros. Discovery, Inc.", "AB Industrivärden (publ)" osv.) ✓.
- **Källbrist-ärligheten:** återköp mätta 0/100 · insiderköp mätta 100/100 ✓ (egna räkningar på originalfilen).
- **Datum:** samtliga 100 rader `hamtat` = 2026-09-03 ✓ · **första-i-serien:** `data/blogg/utdelningar-101.json` existerar ej ✓.
- **Räkneexemplen** (10 kr vinst / 4 kr utdelning → 40 %; 4 kr / 100 kr → 4 %) aritmetiskt korrekta och märkta "valda tal (inte ur underlaget)" ✓.

## 4. Juridik — lagen (2007:528), mekanisk spegel + genomläsning

- **kontrolleraText-spegel** (egen implementering av exakt algoritm ur `src/lib/varumarke.ts:141–162` mot `data/varumarke.json` `forbjudnaFraser`, körd på titel+ingress+hela bodyn): **FEL 0 · VARNINGAR 0** — överensstämmer med kvittots förkontroll.
- **Rådgivningsglossor** (juridikgrindens genomläsningssteg: köp/sälj/rekommendera/bör du/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning): sex träffar på "köp" — **samtliga sammansättningar** ("återköpsfältet", "återköp", "återköpsbelopp", "Insiderköp", "återköp mätta 0/100", "insiderköp mätta 100/100"). **Inget enda är rådgivningsverb.** Inga träffar på övriga glossor.
- **"investeringsrådgivning" endast NEGERAT** (disclaimerns sista rad: "aldrig investeringsrådgivning (lagen 2007:528)") ✓.
- **Lagrum:** endast 2007:528 i filen — inga blandade lagrum (2022:260/2022:261/1985:716/2005:59/2022:482: 0 träffar) ✓.
- **Ton/läsning (juridikgrindens icke-maskiniserbara steg):** texten är rak, varm, professionell; de tre skyddslåsningarna kring seriens juridiskt känsligaste konstruktion (FCF-taket med bolagsnamn) står kvar ordagrant: *"Ett utrymme är inte ett löfte"*, *"listan är en sortering av data, ingen värdering"*, *"en fråga att ställa, inte ett svar"*. Pedagogikformen håller: begrepp först, data som illustration, aldrig omdöme om bolag.

## 5. 911-referenser och internlänkar

- **911: 0 träffar** på sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i HELA filen inklusive metadata. (Termen "911-referenser" kommer ur evighetskatalogens postmall för spår 1 — kontrollen är etablerad standard sedan 09-16.)
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-20 19:4x):** `/kurser/km-063-direktavkastning` **200** · `/kurser/km-064-utdelningstillvaxt` **200** · `/kurser/km-005-eget-kapital-utdelningar` **200** — **3/3 gröna även idag** (09-16-mätningen bekräftad aktuell).

## 6. FLYTTKLART PAKET — levererat som ny fil (uppdragstitelens slutprodukt)

`granskning/utdelningar-101-FLYTTKLART-PAKET-2026-09-20.json` — exportklar post i samma form som den live publicerade m9-piloten (`data/blogg/branschmedianer-akm2.json`):

- **Kvitto-avsnittet strippat** enligt M9-GRANSKNING §1:6 ("## Granskningsunderlag" fram till och med status-raden): body 5 269 → **3 478 tecken**, 6 rubriker kvar, negerad disclaimer **sista raden** (byggscriptet vägrar skriva filen om ej), 0 kvittorester (programmatisk kontroll).
- **kontrolleraText på DEN RENA bodyn** (texten som faktiskt skulle publiceras): **FEL 0 · VARNINGAR 0**.
- Titel utan "(utkast)" · description = ingressen · 517 ord → readingMinutes 3 · tags föreslagna.
- **`publishedAt: null` medvetet** — datum sätts vid kundens export/klick, inte av granskaren.
- **Metadata-observation till kunden (inget jag ändrat):** våg 95-kontraktet (M9-GRANSKNING §1:8) säger export sätter pillar **"Institutionell metodik"** + author **"AK1A Research Lab"** — paketet följer det dokumenterade kontraktet. Våg 66-piloterna i `data/blogg/` bär dock pillar "AKM1" / author "Ak1 Apex Nexus". Vilken konvention som gäller vid export är kundens beslut; att byta är en rad i paketet.
- **Paketet ligger i `granskning/`** — INTE i `data/blogg/`. R2 orörd: flytten sker först genom kundens klick i panelen (eller explicit kundbeslut).

## 7. F3-flaggan LEVER KVAR — verifierad mot dagens fabrikkod (flagga, ej min fil)

`verktyg/m9-fabrik.mjs` **rad 1079** fogar fortfarande `under 2 % och ${fyNegativa} negativa` i utdelningsgrenens mall — 09-14-rättningen ("— varav 9 negativa") finns ENDAST i utkastfilen, inte i fabriken. **Nästa regenerering av serien återintroducerar kategorioverlappet** (skenbar summa 26+28+33+9 = 96 ≠ 87). Konkret förslag (rad 1079): `under 2 % och` → `under 2 % — varav`. Sekundär observation: kassaflödesgrenen (rad 987) bär "under 2 % — och N är negativa, det vill säga bolag som förbrukar kassa…" — förklaringsledet gör delmängdsläsningen tydlig, men samma "varav"-klass skulle ge uniformitet. **Ägare: fabriksägaren (huvudagentens kö).** Konkret diff-post finns i `utdelningar-101-diff-2026-09-20-s1u2.json`.

## 8. Drift-notis — källan har rört sig på riktigt (information till fabriksägaren)

Dagens `bolagsunivers.json` (231 bolag, md5 `cfa7a9f1…`) ger på samma statistik: **n mätta 202 · median 4,2 % · fördelning 86/62/54/21 · topp-5 DNO.OL 36,1 · CMCSA 25,3 · WBD 22,7 · DTE.DE 20,8 · MBG.DE 19,1**. Tre konsekvenser vid nästa `--skriv`:

1. Talen flyttar sig kraftigt (universum mer än dubblat sedan kvitto-underlaget) — ny version, nytt kvitto, ny granskning krävs (normal evergreen-cykel).
2. **Kärnpåståendet "återköp mätta 0/100" håller INTE längre som påstående om källan: dagens fil har 9 mätta återköpsrader** (`aterkop.senasteArMdr` numerisk) — källan har börjat leverera återköpsdata. Seriens "Vad källorna inte levererar"-sektion måste skrivas om delvis vid regeneration.
3. **"Insiderköp mätt (100 av 100 rader)" blir 108 av 231** — inte längre full täckning; formuleringen "är däremot mätt (100 av 100 rader)" behöver uppdateras till andel.

Utkastet förblir korrekt mot sitt eget dokumenterade underlag (kvitto-datum 2026-09-03, md5-bevisat) — driften är hanterad av evergreen-regeln, inte ett fel i utkastet.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd i utkastet.** | Ingen |
| F3′ | flagga | Fabriksmall rad 1079 återintroducerar kategorioverlapp vid nästa regeneration (oförändrad sedan 09-16-rapporten). | Diff-post till fabriksägaren — se § 7 |
| D1′ | notis | Källdrift 09-20: 231 bolag, återköp 9 mätta, insider 108/231 — se § 8. | Till fabriksägarens nästa `--skriv` |

## Slutsats

**FLYTTKLAR — m9-utkast #2:s paket är komplett och levererat.** Filintegritet bevisad (orörd sedan 09-14, git), källornas md5 oberoende recreerade ur git, samtliga 17 sifferkontroller exakta (median exakt 3,01 %, summa- och gränsfallskontroller nya denna våg), juridiken ren på både hel och renad body (kontrolleraText-spegel 0/0, "köp" endast som sammansättningar, endast negerat råd, endast 2007:528), 911 = 0 på sex mönster, 3/3 internlänkar levande idag. Nytt sedan tidigare pass: **exportklart paket byggt och verifierat** (kvitto strippat, disclaimer sist, 3 478 tecken), **F3 verifierad levande** med konkret radfix, **drift förkvantifierad** (inklusive att återköpsdata börjat levereras — seriens kärna-ärlighet påverkas nästa omgång). Publicering väntar kunden (R2); exportvägen kompletterar eventuell metadata enligt kundens konventionsbeslut (§ 6).
