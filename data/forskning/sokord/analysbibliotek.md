# Sökordsinventering — Analysbiblioteket (våg 138, agent S4)

**Datum:** 2026-09-14 · **Agent:** S4 (sökordsinventering, våg 138) · **Status:** levererad
**Syfte:** strukturera tickers, bolagsnamn, branscher, teman och UTBILDNINGS-formulerade
sökfrön ur hela analysbiblioteket — som underlag för våg 138:s sökordsstrategi.
**Juridik:** alla sökfraser i detta dokument är skrivna som utbildning ("så fungerar",
"förklarad", "så läser du") — aldrig som råd. Flaggade råd-riskfraser se § 7.

## 0. Källor och antal (KVD-redovisning)

| Källa | Sökväg | Antal filer | Innehåll |
|---|---|---|---|
| Aktieanalysbiblioteket | `data/analyses/` | **11** | 9 datadrivna föranalyser + 2 fulla 99-sidorsanalyser (PREC, VOLCAR-B) |
| Forskningsbiblioteket | `data/forskningsbiblioteket/` | **22** | analysfabrik-v1: AKM1+AKM2, urvalsstatus grön/gul, läsmår-kurser |
| AKM1-cacher | `data/cache/akm1-*.json` | **100** | lager 1: 20 variabler (V01–V20), 7 kategorier |
| AKM2-cacher | `data/cache/akm2-*.json` | **100** | lager 2: viktprofil akm2-2026, moduler V21–V28 |
| **Summa** | | **233** | 102 unika bolag (100 i cache-universumet + EVO.ST + PREC.ST som endast finns i analyserna) |

Cacherna täcker **10 branscher × 10 bolag**: energi, fastighet, finans, halso,
industri, kommunikation, konsument, material, teknik, tillvaxt.
Extrahering: sondskript `.zcode/sond/v138-s4-extrahera.mjs` +
`.zcode/sond/v138-s4-cache-tsv.mjs` (rådata: `tmp/v138-s4-raadata.json`, `tmp/v138-s4-cache.tsv`).

---

## 1. Aktieanalysbiblioteket — 11 analyser (`data/analyses/`)

Nio är datadrivna FÖRANALYSER (pris/volym via 5 horisonter × 5 teorier, "DATA
NEUTRALT — AKM1-GRANSKNING VÄNTAR"), två är fulla manualanalyser. Gemensamma
teman för föranalyserna: tidshorisonter, vågklasser (impulsvåg / korrigering /
basbygge), 25-cellersmatrisen, volatilitet (σ), 52-veckorsposition,
Fibonacci-nivåer (38,2 % / 61,8 %), glidande medelvärden (MA 50/200).

| Ticker | Bolag | Bransch (SEO-ord) | Centrala teman | Sökfraser (utbildning) |
|---|---|---|---|---|
| ABB.ST | ABB Ltd | industri · elkraft · automation · robotik | impulsvåg dominerar (3 av 5 horisonter), σ 26 %/år, 52v-position 82 % | "ABB-aktien förklarad", "så läser du en aktieanalys av ABB", "vad är en datadriven föranalys" |
| ATCO-A.ST | Atlas Copco | industri · verkstad · kompressorer · gruvutrustning | impulsvåg i 4 av 5 horisonter, kvalitetsverkstad, cyklisk efterfrågan | "Atlas Copco-aktien förklarad", "så fungerar våganalys — Atlas Copco som exempel", "verkstadsaktier förklarat" |
| AZN.ST | AstraZeneca | hälsa · läkemedel · bioteknik | blandbild (impulsvåg/korrigering/basbygge per horisont), läkemedelspipeline | "AstraZeneca-aktien förklarad", "så läser du en läkemedelsaktie", "vad säger en föranalys om AstraZeneca" |
| ERIC-B.ST | Ericsson | teknik · telekom · 5G · nätverk | mega-horisont i korrigering, telekomcykel, 5G-byggnation | "Ericsson-aktien förklarad", "så läser du en analys av Ericsson", "vad är en korrigering i vågteori" |
| EVO.ST | Evolution AB | spel · iGaming · casino online | kort/lang/mega i korrigering, hög marginal, regleringsrisk (endast i analysbiblioteket — saknas i cacher/forskning) | "Evolution-aktien förklarad", "så fungerar en analys av spelbolag", "vad betyder impulsvåg och korrigering" |
| HM-B.ST | H & M | konsument · mode · detaljhandel | impulsvåg kort-medellång, marginsättning, valutor | "H&M-aktien förklarad", "så läser du en detaljhandelsanalys", "vad är bruttomarginal — H&M som exempel" |
| INDU-C.ST | Industrivärden | finans · investmentbolag · substans | impulsvåg i 3 horisonter, substansvärde, förvaltningsbolag (ÄVEN i forskningsbiblioteket: GRÖN status, AKM2 85 — högst av alla 100) | "Industrivärden förklarad", "vad är ett investmentbolag", "så läser du substansvärde i en analys" |
| PREC.ST | Precise Biometrics | IT · biometri · small cap · special situation | FULL 99-sidorsanalys: fusion 20/7, emission 0,82 SEK (91 % garanterad), TERP, teckningskurs, AKM1 38/100, hög volatilitet ~90 %/år | "Precise Biometrics förklarad", "vad är en nyemission — enkelt förklarat", "hur påverkar en fusion aktiekursen", "vad betyder TERP" |
| SAND.ST | Sandvik | industri · verktyg · gruvdrift · stål | impulsvåg i 4 av 5 horisonter, materialåtervinning, bergbrytning | "Sandvik-aktien förklarad", "så läser du en verkstadsanalys", "vad är en basbygge-fas" |
| SKF-B.ST | SKF | industri · kullager · industrikomponenter | impulsvåg i 4 horisonter, cylinderiska rullager, industriautomation | "SKF-aktien förklarad", "vad gör ett lagerbolag — SKF förklarat", "så fungerar 52-veckorsposition i en analys" |
| VOLCAR-B | Volvo Car | konsument · personbilar · elbilar (ELV) | FULL 99-sidorsanalys: ELV-tullar (USA), direktavkastning ~5 %, P/E ~8x, AKM1 62/100, Q2-rapport, EX30/EX90-rullning | "Volvo Cars-aktien förklarad", "hur läser man en bilaktie", "vad är direktavkastning — Volvo Cars som exempel", "vad betyder tullar för en aktie" |

**Biblioteks-gemensamma sökfrön (alla 11):** "aktieanalys på enkel svenska",
"datadriven föranalys förklarat", "fem tidshorisonter aktieanalys",
"25-cellersmatrisen förklarat", "vad är volatilitet i aktier",
"Fibonacci-nivåer i aktieanalys — enkelt", "glidande medelvärde 50/200 dagar".

---

## 2. Forskningsbiblioteket — 22 filer (`data/forskningsbiblioteket/`)

Schema `analysfabrik-v1`: AKM1 (20 variabler i 7 kategorier) + AKM2 (viktprofil
akm2-2026). Status: **7 gröna** (INDU-C, INVE-B, LOGN, NEM, NHY, NOVO-B, T) +
**15 gula**. Starkaste dimension i 20 av 22 filer: lönsamhet; svagaste:
katalysator (händelsevariabler osatta — automatiskt underlag saknar dem).

| Ticker | Bolag | Bransch | Land | Status | Starkast / svagast AKM1 | Centrala teman | Sökfraser (utbildning) |
|---|---|---|---|---|---|---|---|
| BSX | Boston Scientific | hälsa · medteknik | USA | gul | lönsamhet / katalysator | medicinteknik, bruttomarginal 69 %, intäktsstabilitet | "Boston Scientific förklarad", "vad är en medteknikaktie" |
| CVX | Chevron | energi · olja | USA | gul | värdering / katalysator | oljepris, låg värdering, energiutdelning | "Chevron-aktien förklarad", "så fungerar värdering av oljebolag" |
| DIS | Walt Disney | kommunikation · media · streaming | USA | gul | värdering / katalysator | streaming, nöjesparker, innehåll | "Disney-aktien förklarad", "så analyseras mediebolag" |
| GOOGL | Alphabet | teknik · internet · sök · AI | USA | gul | lönsamhet / katalysator | sökmotor, molnet, AI, hög lönsamhet men P/B-risk flaggad | "Alphabet-aktien förklarad", "vad är P/B-tal — enkelt" |
| HM-B.ST | H & M | konsument · mode | Sverige | gul | lönsamhet / katalysator | se § 1 — fördjupad i forskningsbiblioteket (AKM2 70) | "H&M fördjupad analys förklarad" |
| INDU-C.ST | Industrivärden | industri/finans · investmentbolag | Sverige | GRÖN | lönsamhet / katalysator | substans, innehav, högst AKM2 i universumet (85) | "hur beräknas substansvärde" |
| INVE-B.ST | Investor AB | finans · investmentbolag | Sverige | GRÖN | lönsamhet / stabilitet | Wallenberg-sfären, NAV, långsiktigt ägande | "Investor AB förklarad", "vad är substansrabatt" |
| LOGN.SW | Logitech | teknik · datortillbehör | Schweiz | GRÖN | lönsamhet / katalysator | kringutrustning, gaming, bruttomarginal | "Logitech-aktien förklarad", "så läser du bruttomarginal" |
| MC.PA | LVMH | konsument · lyx · mode | Frankrike | gul | lönsamhet / katalysator | lyxvarumärken, prissättningsmakt | "LVMH-aktien förklarad", "vad är prissättningsmakt (moat)" |
| META | Meta Platforms | kommunikation · sociala medier · AI | USA | gul | lönsamhet / katalysator | reklam, AI-investeringar, nätverkseffekter | "Meta-aktien förklarad", "vad är nätverkseffekter" |
| MSFT | Microsoft | teknik · mjukvara · molnet | USA | gul | lönsamhet / katalysator | molnet, AI, högt värderad (P/B 0/5 flaggat) | "Microsoft-aktien förklarad", "värdering av mjukvarubolag" |
| NEM | Newmont | material · guld · gruvor | USA | GRÖN | lönsamhet / katalysator | guldpris, gruvcykel, intäktsvolatilitet | "Newmont förklarad", "så fungerar guldaktier", "vad är en cyklisk bransch" |
| NHY.OL | Norsk Hydro | material · aluminium | Norge | GRÖN | värdering / katalysator | aluminium, råvaror, låg värdering (4,67/5 i värdering) | "Norsk Hydro förklarad", "så analyserar man råvarubolag" |
| NKE | NIKE | konsument · sport · varumärke | USA | gul | värdering / katalysator | sportmode, varumärkesstyrka, DTC | "Nike-aktien förklarad", "vad gör ett starkt varumärke med en aktie" |
| NOVO-B.CO | Novo Nordisk | hälsa · läkemedel · diabetes | Danmark | GRÖN | lönsamhet / katalysator | GLP-1, diabetesläkemedel, patent | "Novo Nordisk-aktien förklarad", "hur läser man en läkemedelspipeline" |
| NP3.ST | NP3 Fastigheter | fastighet · hyresbostäder | Sverige | gul | lönsamhet / katalysator | hyresinkomster, Norrland, räntekänslighet | "NP3 Fastigheter förklarad", "så analyseras fastighetsaktier" |
| PG | Procter & Gamble | konsument · dagligvaror | USA | gul | lönsamhet / katalysator | stabila dagligvaror, ROE 30 %, intäktsstabilitet 5/5 | "P&G-aktien förklarad", "vad är en defensiv konsumentaktie" |
| PLTR | Palantir | tillväxt · dataanalys · AI-programvara | USA | gul | lönsamhet / katalysator | dataanalyser, AI-plattformar, hög värdering | "Palantir förklarad", "vad kännetecknar tillväxtaktier" |
| SAP.DE | SAP | teknik · företagsmjukvara · ERP | Tyskland | gul | lönsamhet / katalysator | ERP, molnomställning, tysk teknik | "SAP-aktien förklarad", "vad är ERP-programvara" |
| T | AT&T | kommunikation · telekom · utdelning | USA | GRÖN | värdering / katalysator | utdelningsaktie, nätverk, skuldsättning | "AT&T-aktien förklarad", "vad är en utdelningsaktie" |
| TRUE-B.ST | Truecaller | tillväxt · app · mobilt | Sverige | gul | lönsamhet / katalysator | app-ekonomi, annonsintäkter, svenska tillväxtbolag | "Truecaller förklarad", "så analyseras appbolag" |
| VZ | Verizon | kommunikation · telekom · 5G | USA | gul | värdering / katalysator | 5G, utdelning, kapitalintensitet | "Verizon-aktien förklarad", "telekomaktier förklarat" |

**Forsknings-gemensamma sökfrön:** "hur poängsätts en aktie i 20 variabler",
"AKM1-modellen förklarat", "vad betyder grön och gul status i urvalsregeln",
"varför ger modellen 0 poäng för osatt data", "falsifiering i aktieanalys —
förklarat", "vad är datatäckning i aktieanalys".

---

## 3. Cache-universumet — 100 bolag, 10 branscher (`data/cache/akm1-*` + `akm2-*`)

100 tickers med både AKM1- och AKM2-poäng. Branschvis (teman = sökordsfrön;
"topp"-bolag = hög AKM2 → naturliga exempelartiklar i utbildningstexter).

### energi (10) — teman: oljepris, energiomställning, utdelning, kassaflöde
Aker BP (57), Chevron (77), Enel (56), Equinor (59), Fortum (42), Iberdrola
(50), RWE (31), Shell (73), Vår Energi (68), ExxonMobil (67). Topp: CVX, SHEL.
Fröer: "så fungerar oljepriset", "energiaktier förklarat", "vad är
energiomställningen".

### fastighet (10) — teman: räntekänslighet, hyresinkomster, vakanser, fastighetsvärdering
Balder (46), Castellum (48), Catena (50), Diös (60), Fabege (50), Hufvudstaden
(50), NP3 (55), Prologis (42), Wallenstam (43), Wihlborgs (51). Topp: DIOS.
Fröer: "räntans effekt på fastighetsaktier", "vad är vakansgrad", "så värderas
en fastighetsaktie".

### finans (10) — teman: utdelning, kreditkvalitet, substansvärde, banker
Berkshire (64), Goldman Sachs (70), Investor AB (80), JPMorgan (40), Latour
(42), Nordea (30), Öresund (55), SEB (38), Handelsbanken (33), Swedbank (33).
Topp: INVE-B. Fröer: "hur tjänar en bank pengar", "bankaktier förklarat",
"investmentbolag vs banker".

### halso (10) — teman: läkemedel, medteknik, patent, pipeline, aldrande befolkning
AstraZeneca (48), Boston Scientific (54), CellaVision (55), Coloplast (64),
Elekta (58), Fresenius (46), Getinge (56), J&J (63), Eli Lilly (57), Novo
Nordisk (66). Topp: COLO-B, NOVO-B. Fröer: "läkemedelsaktier förklarat", "vad
är en läkemedelspipeline", "medteknik vs läkemedel".

### industri (10) — teman: verkstad, automation, cyklisk efterfrågan, rälskopplingar
ABB (62), Alfa Laval (58), ASSA (51), Atlas Copco (63), Eaton (52), GE
Aerospace (60), Hexagon (60), Industrivärden (85), Sandvik (66), SKF (53).
Topp: INDU-C, SAND, ATCO-A. Fröer: "verkstadsaktier förklarat", "vad är
automation", "så läses en industrikonjunktur".

### kommunikation (10) — teman: telekom, streaming, utdelning, skuldsättning, innehåll
Disney (57), Meta (62), MTG (47), Netflix (67), AT&T (67), Tele2 (68), Telia
(59), Viaplay (45), Verizon (61), Warner Bros Discovery (39). Topp: TEL2-A,
NFLX, T. Fröer: "streamingbolagens ekonomi", "telekom vs streaming", "vad är
direct-to-consumer".

### konsument (10) — teman: varumärken, marginaler, detaljhandel, lyx, bilar
Carlsberg (57), Electrolux (19), Essity (59), H&M (70), Inditex (59), LVMH
(63), McDonald's (62), Nike (65), P&G (63), Volvo Car (27). Topp: HM-B, NKE.
Fröer: "varumärkesstyrka i aktieanalys", "detaljhandelns marginaler",
"konsumentcykler förklarat".

### material (10) — teman: cykliskt, guld, aluminium, skogsindustri, stål, gödsel
Billerud (40), Boliden (57), Holmen (44), Newmont (79), Norsk Hydro (76), SCA
(40), SSAB (50), Stora Enso (31), UPM (39), Yara (35). Topp: NEM, NHY. Fröer:
"råvarucykeln förklarat", "guld som trygg ham — historien", "skogsindustrin
förklarat", "varför svänger stålpriset".

### teknik (10) — teman: mjukvara, molnet, AI, halvledare, telekomutrustning
Apple (60), ASM International (61), Ericsson (73), Alphabet (61), Kambi (44),
Logitech (78), Microsoft (61), Nokia (43), SAP (64), Sinch (37). Topp: LOGN,
ERIC-B. Fröer: "molnverksamhet förklarat", "hur värderas mjukvarubolag",
"vad gör ett halvledarbolag", "AI-aktier — så tänker en analys".

### tillvaxt (10) — teman: tillväxtbolag, SaaS, elbilar, högre risk, kassatäckning
AMD (43), Kinnevik (38), NVIDIA (49), PowerCell (33), Palantir (47), Polestar
(25), Sea Limited (43), Shopify (43), Truecaller (58), Tesla (33). Topp:
TRUE-B. Fröer: "tillväxtaktier förklarat", "vad är ARR hos programvarubolag",
"kassatäckning och kapitalförbränning", "elbilsbolagens ekonomi".

---

## 4. Metodfrön — AKM2, SAM-viktning, fem tidshorisonter

Starkaste sökordsytan: METODEN är unik (egen ägodel) medan bolagsnamnen delas
med alla finanssajter. Metod-frön att Så i artiklar, kurser och analyssidor:

- **Modellnamn:** "AKM2-modellen", "AKM1-granskningen", "AKM2.2026.09",
  "viktprofil akm2-2026", "AK1A-analysen" — egna varumärkesfrön (låg konkurrens).
- **Fem tidshorisonter:** mikro, kort, medellång, lång, mega → "fem
  tidshorisonter aktieanalys", "vad är mega-horisonten", "aktieanalys på
  flera tidshorisonter".
- **Fem teorier (vågmatrisen):** Elliott, Fibonacci, Gann, Lucas, volymanalys
  → "Elliottvågor för nybörjare", "Fibonacci i aktieanalyser — enkelt",
  "vad är Gann-analys", "volymanalys förklarat", "25-cellersmatrisen (5×5)".
- **Vågklasser:** impulsvåg, korrigering, basbygge → "impulsvåg eller
  korrigering — hur skiljer man", "vad är ett basbygge i en aktiekurs".
- **7 AKM1-kategorier:** tillväxt, värdering, lönsamhet, stabilitet, moat,
  katalysator, risk → "moat förklarat", "stabilitet i aktieanalys".
- **Nyckeltalskurser (länkade från forskningsfilerna — efterfrågan i egna
  data):** v19-kapitalförbränning (16 filer), v12-intäktsstabilitet (13),
  v08-ebitda-marginal (12), v10-skuldsattningsgrad (9), v04-ps (6),
  v06-ev-ebitda (5), v07-bruttomarginal (3), v01-försäljningstillväxt (2) →
  sökfrön "vad är EV/EBITDA", "P/S-talet förklarat", "skuldsättningsgrad —
  enkelt", "vad är intäktsstabilitet", "kapitalförbränning förklarat".
- **Principer med pedagogisk dragkraft:** "osatt ger 0 poäng — modellen gissar
  aldrig", "vikt omfördelas vid saknad data", "värdegolv (NCAV/NAV)",
  "falsifierbara påståenden i analys", "konfluens", "Monte Carlo i aktieanalys",
  "bayesiansk omviktning förklarat", "Kelly-formeln", "SAM-viktning",
  "scenarier och riskmatris", "fem tidshorisonter × fem teorier × fyra
  dimensioner".
- **Datakällor:** MarketStack, Yahoo Finance, bolagsrapporter → "hur hämtas
  data till en aktieanalys", "så läser du en bolagsrapport".

---

## 5. Ticker- och namnvarianter (SEO-relevans)

- Volvo Car: `VOLCAR-B` (analysbiblioteket) vs `VOLCAR-B.ST` (cache) — båda
  varianter bör finnas som sökfrön + "Volvo Cars" (folkmun) och "VOLCAR B".
- Nasdaq Stockholm: aktietickers med suffix `.ST` söks ofta UTAN suffix
  ("ABB aktie", "Sandvik aktie") — använd bolagsnamn som primärt frö.
- Amerikanska: "AT&T aktie" (specialtecken T söks dåligt — alltid "AT&T"),
  BRK-B ("Berkshire Hathaway B"), GOOGL ("Alphabet aktie" vanligare).
- Nordiska suffix: `.OL` (Oslo), `.CO` (Köpenhamn), `.HE` (Helsingfors), `.SW`
  (Schweiz), `.DE` (Tyskland), `.MI` (Milano), `.MC` (Madrid), `.PA` (Paris) —
  svenska sökare använder nästan alltid bolagsnamnet, inte koderna.
- H & M söks som "H&M", "Hennes & Mauritz", "HM B".

## 6. Luckor som sökordsstrategin bör känna till

1. **EVO.ST (Evolution)** finns ENDAST i analysbiblioteket — varken forskning
   eller cacher. Populär svensk sökterm ("Evolution aktie") utan motsvarande
   forskningsdjup — kandidat för nästa forskningsbiblioteksutbyggnad.
2. **PREC.ST** (fullanalys med fusion/emission) saknas i cacher — men har
   starkast pedagogiskt material (special situation, TERP, teckningskurs).
3. **PREC- och EVO-tickers** + branscherna "spel/iGaming" och "biometri" är
   osedda branschfrön i universumet.
4. Kategorin **katalysator = 0 i princip alla filer** (osatt i automatiskt
   underlag) — ett pedagogiskt sökfrö: "varför saknar automatiska analyser
   katalysatorer".

## 7. Juridikgrinden — flaggade fraser och pedagogiska omskrivningar

Regel: utbildning är tillåtet (2 kap 5 § lagen 2007:528), rådgivning kräver
tillstånd. Sökfraser får aldrig lova eller föreslå köp/sälj.

| Flagga | Var finns den | Risk | Godtagbar omskrivning (sökfrö) |
|---|---|---|---|
| "FÖRSIKTIGT KÖP" | PREC-ST.json (recommendation) | Kan tolkas som köpråd | "Precise Biometrics — analysen förklarad" |
| "HÅLL" | VOLCAR-B.json (recommendation) | Kan tolkas som placeringsråd | "Volvo Cars-aktien förklarad steg för steg" |
| "Vägt prismål 1,38 SEK / ~315 SEK" | PREC, VOLCAR-B | Kursmål i rubrik = rådsliknande | "så räknar analysen med scenarier" |
| "köp det försiktigt och i trappor" | PREC-ST.json | Direkt uppmaning | "vad är trappstegsinvestering — begreppet förklarat" |
| "vänta på Q2-känning ... innan tillägg" | VOLCAR-B.json | Tidsrypande råd | "hur läser man en kvartalsrapport" |
| "bästa aktien att köpa 2026" | (frånvarande — ska ALDRIG användas) | Klassiskt rådnödvärde | "så går en systematisk aktiegranskning till" |
| "DATA NEUTRALT" | 9 föranalyser | Godtagbar intern etikett — behåll "föranalys, ej investeringsråd" i sidtexten | "vad är en datadriven föranalys" |

Alla publicerade sidor behåller disclaimern: "Pedagogisk finansanalys —
inte investeringsråd" (formulär som redan finns i samtliga källfiler).

## 8. Sammanfattning för våg 138-syntesen

- 233 källfiler → 102 unika bolag → 10 branschkluster + metodfrön.
- Tyngsta sökordsytor: (1) metodfröna § 4 (unik egendom, ingen konkurrens),
  (2) nyckeltalskurserna (bevisad intern efterfrågan: 66 kurslänkar),
  (3) de 7 gröna forskningsbolagen (djupast underlag = bäst artikelunderlag),
  (4) branschfröna per kluster § 3.
- Allt material ovan är utbildningsformulerat och juridikgrindat (§ 7).

*Uppdateringsregler: vid nya analyser/forskningsfiler — kör
`.zcode/sond/v138-s4-extrahera.mjs` igen och uppdatera antalet i § 0.*
