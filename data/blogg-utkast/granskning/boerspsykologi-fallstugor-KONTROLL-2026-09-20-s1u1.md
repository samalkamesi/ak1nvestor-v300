# KONTROLLGRANSKNING m9-utkast #1 — boerspsykologi: fallstudier (v1) — 2026-09-20, oberoende aktualitets- och flyttklarhetspass

**Objekt:** `data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json` (version 1, status utkast, m9-fabrik-v2 gren (f), seed `904e0fcc…`, kvittots kandidatMd5 `b90e7b95…` [genereringstillståndet])
**Granskad:** 2026-09-20 kl 19:51–19:55 CEST av fabrik auto-s1-u1, omgång `auto-s1-1789925707056` (agentfabrik, spår 1 — granskare 1/3)
**Relation till tidigare granskningar:** huvudgranskad 2026-09-14 (`granskning/boerspsykologi-fallstugor.md`) · maskinell KONTROLL 2026-09-16 (`granskning/boerspsykologi-fallstugor-KONTROLL-2026-09-16.md` — av en tidigare s1-u1 i annan fabrikomgång; 28+15 kontroller, determinism rekonstruerad byte-identisk) · oberoende omräkning rond 102 2026-09-19 (`granskning/boerspsykologi-branschmedianer-forskningslaget-KONTROLL-2026-09-19.md`, 11 kontroller). **Detta är fjärde passet** och fyller luckorna från dagens batchmönster (syskon s1-u2 levererade m9-2:s paket 19:44, s1-u3 m9-3:v v2-kandidat 19:45): (1) dagens aktualitetsläge — s1-u2 påvisade källdrift i `bolagsunivers.json` 09-20 07:59, vilket kräver en explicit drift-dom ÄVEN för de serier vars källor INTE rörts; (2) själva **flyttklara paketet** — exportklar post med kvitto-avsnittet strippat har aldrig byggts för denna serie; (3) **determinism via fabrikens egen torrkörning** — starkare än 09-16:s externa rekonstruktion: fabriken omodifierad på dagens källor reproducerar kandidat-md5:n exakt.
**Val-notis:** uppdragstitelns "m9-utkast #1" matchar sammanställningens rad **m9-1 = boerspsykologi-fallstugor-v1.json**. Uppdragstitelns "911-r" är en trunkerad auto-titel — "911" kommer ur index-UUID:t `…a911-e5af…` i `m9-ko/index.json`; kontrollen "911-referenser" är dock etablerad standard sedan 09-16 och har körts (0 träffar, se § 5). Kollisionskontroll före skrivning: inga filer med `boerspsykologi-fallstugor-*2026-09-20*` fanns i granskningsmappen; syskonens ytor (utdelningar-101-*, kassaflodesanalys-101-*) orörda. Mina filer bär s1u1-suffix där det behövs för entydighet.
**Off-gräns:** publicering = kundens beslut (R2) — INGET har flyttats till `data/blogg/`, Supabase-kön orörd (fabriken kördes ENDAST torrt: "TORR: 6 kandidater genererade, 0 rader skrivna"), inga priser/tier rörda, utkastfilen själv EJ ändrad (§ 1).

## BEDÖMNING: FLYTTKLAR — 0 nya rättningar i utkastet, 40/40 kontroller gröna, paket levererat

**Egen sond `verktyg/_s1u1-boerspsykologi-kontroll.mjs` (40 kontroller): 40 OK · 0 FEL · exit 0.** Sonden skriver ingenting — alla fynd redovisas nedan.

---

## 1. Filintegritet — utkastet orört sedan kö-dumpen

`git log --follow`: sista commit som rör filen = **584ffcf8** ("våg 151-förberedelse — granskningskö-dump m9 (read-only export)") — filen har **aldrig redigerats efter generering**; `git diff HEAD` för filen = **tom**. Innehållet är alltså fabrikens ursprung, vilket gör torr-determinismbeviset i § 7 fullständigt: ingen människa eller agent har rört texten mellan generering och denna granskning.

## 2. Källor — md5 mot dagens träd (2026-09-20 19:51)

| Källa | Kvitto-md5 | Status 2026-09-20 | Dom |
|---|---|---|---|
| `data/rapporter/vagvalidering-SENASTE.json` | `42970c1a…` | **MATCH** (md5sum verifierad) | ✓ |
| `data/varumarke.json` | `9b906e42…` | **MATCH** (md5sum verifierad) | ✓ |
| `data/rapporter/vagvalidering-SENASTE.md` (rond 102:s extra-källa) | `b7194627…` | **MATCH — oförändrad även sedan 09-19** | ✓ |

**Drift-dom (dagens batchlucka):** s1-u2:s fynd att `bolagsunivers.json` rörde sig 09-20 07:59 (100→231 bolag) berör **INTE** denna serie — boerspsykologi-grenen läser endast vagvalidering-JSON + varumarke, båda byte-identiska med kvittot. Evergreen-regeln utlöses inte; v1 är fortfarande seriens aktuella underlag (domdatum 2026-09-04).

## 3. Siffror — oberoende omräkning mot källfilen (20 kontroller, alla exakta)

- **Totalblocket:** 52 % träff · 48 mätningar · 20 % osatta · 12 tickers · räknare sedan 2026-09-04 · domdatum 2026-09-04 — samtliga exakta mot `totalt`/`universumAntal`/`rullandeSedan`/`domdatum` och ordagrant återfinna i body/ingress.
- **Cellerna:** kort/impulsvåg 100 % (n=2) · medellång/basbygge 0 % (6 dömda) · mega/basbygge 0 % (6 dömda) → "0 träffar på 12 mätningar" (6+6=12 ✓) · impulsvågskontrasten medellång 100 % (n=6) och mega 100 % (n=6) — exakta mot `perHorisontKlass`.
- **Två OBEROENDE rekonstruktioner (ny värde sedan tidigare pass):** (a) Σ nDomda över cellerna = 48 = `totalt.nDomda` ✓; (b) träffar per cell (traffProcent × n, avrundat) → **25/48 = 52 % == källans 52 %** ✓ — totaltalet är internt konsistent med cellerna, inte bara citerat.
- **Aritmetiken:** 0,5² = 25 % ("0,5 × 0,5 = 25 %" i bodyn) ✓ · 0,5¹² = 0,0244 % → bodyns "ungefär 0,02 %" = fabriksfunktionens `pct(x, 2)`-format exakt ✓ · tumregel 3/n med n=2 → 150 % ✓ · tröskeln ±6 % == protokollets "|momentum| ≤ 6 %" ✓.
- **Protokollcitatet:** strängen efter "ordagrant ur rapporten: " jämförd med `domProtokollText` — **EXAKT, 360 == 360 tecken** (stränglikhet, inte ögonmått).
- **Kvittots fyra urdrag:** samtliga kärntal återfinns i bodyn med korrekt datum ✓. Ingressens "samtliga tolv domar" == källans 6+6 — konsistenskontakt grön, men se flagga F4 (talet är hårdkodat i mallen).

## 4. Juridik — lagen (2007:528), mekanisk spegel + genomläsning

- **kontrolleraText-spegel** (egen implementering av exakt algoritm ur `src/lib/varumarke.ts` — alla 26 fraser ur `data/varumarke.json`, regex "giu"): **FEL 0 · VARNINGAR 0** på BÅDE hel body (titel+ingress+body med kvitto) och REN body (den publicerbara ytan). Överensstämmer med kvittots förkontroll och 09-16/09-19-passen.
- **Rådgivningsglossor** (köp/sälj/rekommendera/bör du/bör inte/aktietips/kursmål/riskfri/säker vinst/garanterad avkastning/handla): exakt **1 träff — "handla" i negeringen "inte en slutsats att handla på"**. Inga rådgivningsverb, inga uppmaningar.
- **"investeringsrådgivning" endast NEGERAT** (disclaimerns sista rad: "aldrig investeringsrådgivning (lagen 2007:528)") — 1 förekomst i ren body, och det är själva disclaimer-formen.
- **Lagrum:** endast 2007:528 — 0 träffar på 2022:260/2022:261/1985:716/2005:59/2022:482 (ingen lagrumsblandning).
- **Särskild styrka hos just denna serie** (kvarstående observation från 09-16, omkontrollerad): **inga tickers eller bolagsnamn förekommer alls** — fallstudierna är anonymiserade vågklass/horisont-celler. Rent utbildningsinnehåll i 2007:528:ens mening; inget enskilt värdepapper berörs.
- **Ton:** rak, varm, professionell; psykologipegagogiken ("Hjärnan läser mönster i små urval", "att vänta är ett beslut, inte passivitet") håller AK1A-rösten; slutsats­nedtonningarna står kvar ("en fråga till kommande ronder, inte en slutsats att handla på", "ett öppet kvitto om det förflutna — aldrig en sannolikhet om framtiden").

## 5. 911-referenser och internlänkar

- **911: 0 träffar** på sex mönster ("911", "11 september", "september 2001", "9/11", "terror", "terrordåd") i HELA utkastfilen inklusive metadata (JSON som sträng). Tredje dagen i rad grön.
- **Länkar mot LEVANDE sajten (localhost:3000, 2026-09-20 19:51) — statiskt + HTTP:** `/kurser/km-019-bekraftelsefalla` **200** (fil `data/seo/kurser/km-019-bekraftelsefalla.json` ✓) · `/kurser/km-036-overconfidence` **200** (fil ✓) · `/blogg/mr-market-psykologi-svenska-borsen` **200** (fil `data/blogg/mr-market-psykologi-svenska-borsen.json` ✓) — **3/3 gröna även idag** (09-16- och 09-19-mätningarna bekräftade aktuella).

## 6. FLYTTKLART PAKET — levererat som ny fil (uppdragstitelens slutprodukt)

`granskning/boerspsykologi-fallstugor-FLYTTKLART-PAKET-2026-09-20.json` (paketfilens md5 `b626c487…`, byggd av `verktyg/_s1u1-boerspsykologi-paket.mjs` — byte-exakt strippning ur utkastfilen, ingen handkopiering):

- **Kvitto-avsnittet strippat** enligt M9-GRANSKNING §1:6 ("## Granskningsunderlag" → status-raden): body 4 995 → **3 532 tecken**, 6 rubriker kvar, negerad disclaimer **sista rad**, **0 kvittorester** (programmatisk kontroll på 9 strukturella markörer — orden "kvitto" i mallprosan är legitim text och finns kvar avsett).
- **kontrolleraText på DEN publika ytan** (title + description + ren body): **FEL 0 · VARNINGAR 0**.
- Titel utan "(utkast)" · description = ingressen · 548 ord → readingMinutes 3 · tags föreslagna (börspsykologi, vågvalidering, träffprocent, sannolikhet, beteendeekonomi).
- **`publishedAt: null` medvetet** — datum sätts vid kundens export/klick, inte av granskaren.
- **Metadata-observation till kunden (samma notis som s1-u2, oförändrad):** våg 95-kontraktet (M9-GRANSKNING §1:8) ger pillar **"Institutionell metodik"** + author **"AK1A Research Lab"** — paketet följer det dokumenterade kontraktet. Våg 66-piloten i `data/blogg/` (`branschmedianer-akm2.json`) bär pillar "AKM1" / author "Ak1 Apex Nexus". Vilken konvention som gäller vid export är kundens beslut; att byta är en rad i paketet.
- **Paketet ligger i `granskning/`** — INTE i `data/blogg/`. R2 orörd: flytten sker först genom kundens klick i panelen.

## 7. Determinism — fabrikens egen torrkörning reproducerar kandidaten (nytt bevis, starkare klass)

`node verktyg/m9-fabrik.mjs` (TORR-läge, omodifierad, 2026-09-20 19:53): boerspsykologi-kandidaten genereras om på dagens källor med **kandidat-md5 `b90e7b95b8f260c731ef668b952bbe9e` — EXAKT MATCH med utkastfilens kvitto**. Fabrikens egen grind samtidigt: kontrolleraText 0 FEL/0 VARNING, 0 struktur-fel, 7 "##"-rubriker, disclaimer sist — samtliga mått identiska med utkastets `fabrik.kontroll`. Tillsammans med § 1 (filen orörd sedan dumpen) ger detta en sluten kedja: **generering → dump → idag, byte-identisk genom hela livslängden.** ("GRANSKNINGSKLAR"-status i torrlistan betyder att kö-underhållet vid nästa `--skriv` skriver en rad för slugen — med identiskt innehåll, eftersom md5 är samma. Kö-skrivning ägs av underhållet, inte av granskaren.)

## 8. Flagga F4 — mallens hårdkodade tal i boerspsykologi-grenen (till fabriksägaren, ej min fil)

`verktyg/m9-fabrik.mjs` boerspsykologi-gren interpolerar i regel källans tal, men **tre tal är hårdkodade**:

| Rad | Nu (hårdkodat) | Interpolerar egentligen | Risk vid källdrift |
|---|---|---|---|
| 1217 (ingress) | "två träffar av två möjliga" + "**samtliga tolv domar**" | `tvaTraffar.nDomda` · `basSumma` | När kort/impulsvåg eller basbygges-cellerna får nya n säger ingressen fel siffra medan bodyn säger rätt (båda talen står i samma mening). |
| 1174 (body, fallstudie 1) | "sannolikheten att träffa **båda** 0,5 × 0,5" | `${String(tvaTraffar.nDomda)}` faktorer + antal | "Båda" förutsätter exakt n=2; `pct(slantTvaa, 0)` beräknas redan dynamiskt (0,5^n) men faktor-texten "0,5 × 0,5" gör det synligt fel från n=3. |
| 1174 (body, fallstudie 1) | "med **n = 2** blir det **150 %**" | `3/n` på `tvaTraffar.nDomda` | Tumregelmeningen blir inkonsistent med det interpolerade "på exakt n = X dömda mätningar" i samma mening. |

**Idag: 0 fel i utkastet** — källans värden ÄR n=2 och 6+6=12, så hårdkodat == interpolerat (kontroll B20 grön). Flaggan är samma klass som s1-u2:s F3 (utdelningar-grenen) och s1-u3:s C1: felet ligger i fabriksmallen, visar sig först vid nästa regenerering med rört underlag, och ägs av fabriksägaren. Konkret förslag i diff-filen. **Sekundär observation:** 09-14-fyndet F2 (urdrags-nyckelordning) består som informativt.

## Fyndlista (denna våg)

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| — | — | **0 nya fynd i utkastet.** | Ingen |
| F4 | flagga-till-ägare | Fabriksmall rad 1174 + 1217: tre hårdkodade tal ("båda", "n = 2 → 150 %", "tolv domar") avsynkroniserar från källan vid nästa regeneration med rört underlag. | Diff-post till fabriksägaren — se § 8 |
| D1′ | notis | Torrstatusen "GRANSKNINGSKLAR" + identisk kandidat-md5 ⇒ nästa `--skriv` skriver en innehålls-identisk v-rad för slugen. Kö-underhållets ägande; inget att rätta. | Ingen (dokumenterat i § 7) |

## Slutsats

**FLYTTKLAR — m9-utkast #1:s paket är komplett och levererat.** Filintegritet bevisad (orörd sedan kö-dumpen 584ffcf8 — aldrig redigerad), källorna byte-identiska med kvittot även idag (driften i bolagsunivers berör inte serien), 40/40 kontroller gröna inklusive två nya oberoende rekonstruktioner (Σ-celler = 48; träffar 25/48 = 52 %) och det byte-exakta protokollcitatet (360 == 360), juridiken ren på både hel och publicerbar yta (kontrolleraText-spegel 0/0, endast negerat råd, endast 2007:528, zero bolagsnamn), 911 = 0 på sex mönster, 3/3 internlänkar levande idag. Nytt sedan tidigare pass: **exportklart paket byggt och verifierat** (kvitto strippat 4 995 → 3 532 tkn, disclaimer sist, kontrolleraText 0/0), **determinism bevisad med fabrikens egen torrkörning** (kandidat-md5 exakt) och **F4-flaggan** (mallens hårdkodade tal) förd till fabriksägaren med konkret radfix. Publicering väntar kunden (R2).
