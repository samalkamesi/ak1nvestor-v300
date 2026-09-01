# Auditrappport 2026-09-01

**Mål:** https://lab.ak1nvestor.com — full granskning (alla sidor i sitemap, kvalitet, trasiga saker)
**Metod:** Automatiserad crawl via Node.js (fetch, 20 parallella anslutningar, 30 s timeout per förfrågan, 2 försök vid nätverksfel). Sitemap + 3 fullsitereläsningspass (status/titel, manglingsmönster, U+FFFD/mojibake) + 49 sidors innehålls-/metakontroll + 50 länkars stickprov. Mätningen gjord 2026-09-01.
**Begränsningar:** Innehållskvalitet bedömd på serverlevererad HTML (ej klientrenderat innehåll efter JS). Manglingsmönster täcker de vanliga formerna (å/ä/ö→a/o, U+FFFD, UTF-8-mojibake), inte alla tänkbara felstavningar.

**Sitemap-faktum:** sitemap.xml innehåller **704 URL:er** — inte ~515 som väntats. Fördelning: 14 statiska topsidor + 230 kurser + 231 analyser + 201 labb-cases + 28 blogginlägg. Avvikelsen beror troligen på tillväxt sedan 515-siffran sattes; inget fel i sig men värt att bekräfta att sitemapen är automatgenererad och aktuell (se P3-notis i §6).

---

## 1. Hälsa total

| Mått | Resultat |
|---|---|
| URL:er i sitemap | 704 |
| Svar 200 OK | **704 / 704 (100 %)** |
| Status ≠ 200 | **0** |
| Omdirigeringar | 0 |
| Nätverksfel/timeout | 0 |
| Saknad/tom `<title>` | 0 |

**Tabell över fel-URL:er:** Inga URL:er i sitemap returnerar fel. Utanför sitemap testades tre misstänkta sidor:

| URL | Status | Bedömning |
|---|---|---|
| /bibliotek | 404 | Finns ej — korrekt 404-status, men sidan återanvänder hemsidans titel/description (se §6) |
| /min-portfolj | 200 | OK |
| /logga-in | 200 | OK |

**Slutsats § 1:** Siten är struktureellt frisk. Alla 704 sitemap-URL:er svarar 200 direkt utan redirects och alla har titel.

## 2. Dubbletttitlar (top 10)

700 unika titlar av 704 sidor. Endast 4 dubblettgrupper finns (alla redovisas, därför blir "top 10" kort):

| # | Antal | Titel | URL:er |
|---|---|---|---|
| 1 | 3x | AK1A Research Lab — Från utbildning till inkomst \| Ak1 Apex Nexus | / , /privacy-policy , /terms |
| 2 | 2x | Återinvestering — AKM1-kurs \| AK1A Research Lab | /kurser/pf-06-aterinvestering , /kurser/ud-02-aterinvestering |
| 3 | 2x | Bolån-garant-kollaps — Case \| AK1A Research Lab | /labb/cmsfaayi6004lt2iq7r4qn8es , /labb/cmsfaayi7004mt2iq6mhb1qm2 |

Anmärkningar: Grupp 1 — juridiksidorna ärver hemtiteln (dålig SEO och förvirrande i sökresultat). Grupp 2 — två olika kurser (PF- respektive UD-spåret) med identisk titel. Grupp 3 — två separata labb-case-ID:n med identiskt case-innehållsnamn: möjlig faktisk innehållsdubblett, inte bara titelkrock.

## 3. Innehållskvalitet stickprov

49 sidor kontrollerade: 30 slumpmässiga kurssidor, 5 slumpmässiga blogginlägg, 14 topsidor. Mått: tecken i main-innehåll (HTML med taggar/navigering bortrensad; kurs-/topsidor saknar `<main>` så `<body>` använts — se §6). Gräns för "meningsfull svensk text": >1 000 tecken.

### Kurssidor — 30/30 OK

Quiz ("Testa dig själv"): **30/30 JA**. Korrekt å/ä/ö: 30/30. Canon: 30/30 korrekt. Innehållslängd 4 381–7 667 tecken (median ca 5 200).

| Sida | Tecken | Quiz | Bedömning |
|---|---|---|---|
| /kurser/ts-08-volymanalys | 4 381 | JA | OK |
| /kurser/ts-02-elliott-wave | 4 526 | JA | OK |
| /kurser/km-063-direktavkastning | 4 705 | JA | OK |
| /kurser/km-062-blackscholes | 4 797 | JA | OK |
| /kurser/ts-11-candlestickmonster | 4 778 | JA | OK |
| /kurser/km-019-bekraftelsefalla | 4 826 | JA | OK |
| /kurser/km-058-valutor | 4 872 | JA | OK |
| /kurser/km-046-telekomsektorn | 4 920 | JA | OK |
| /kurser/ts-04-fibonacciextensions | 5 024 | JA | OK |
| /kurser/km-060-covered-calls | 5 048 | JA | OK |
| /kurser/km-026-relaterade-parter | 5 047 | JA | OK |
| /kurser/km-038-techsektorn | 5 044 | JA | OK |
| /kurser/km-045-materialsektorn | 5 069 | JA | OK |
| /kurser/km-053-312reglerna | 5 122 | JA | OK |
| /kurser/km-056-centralbanker | 5 127 | JA | OK |
| /kurser/km-021-avskrivningsprinciper | 5 155 | JA | OK |
| /kurser/sj-01-utlandsk-kallskatt | 5 200 | JA | OK |
| /kurser/km-044-konsumentsektorn | 5 221 | JA | OK |
| /kurser/km-014-korrelation-diversifiering | 5 245 | JA | OK |
| /kurser/km-018-forlustaversion | 5 406 | JA | OK |
| /kurser/km-011-relativ-vardering | 5 471 | JA | OK |
| /kurser/ts-01-elliott-wave | 5 549 | JA | OK |
| /kurser/pc-02-case-astrazeneca | 5 519 | JA | OK |
| /kurser/km-068-wallenbergsfaren | 5 511 | JA | OK |
| /kurser/km-016-sharpe-kvot | 5 614 | JA | OK |
| /kurser/km-002-forvaltningsberattelsen | 5 655 | JA | OK |
| /kurser/km-001-bokforingens-grunder | 5 829 | JA | OK |
| /kurser/v12-intaktsstabilitet | 6 933 | JA | OK |
| /kurser/v02-arr-tillvaxt | 7 505 | JA | OK |
| /kurser/v07-bruttomarginal | 7 667 | JA | OK |

### Blogg — 5/5 OK

| Sida | Tecken | Bedömning |
|---|---|---|
| /blogg/veckans-marknad-2026-w34 | 2 613 | OK |
| /blogg/sa-laser-du-din-portfoljrapport | 2 684 | OK |
| /blogg/5-vanliga-nyborjarmisstag-svenska-aktier | 3 136 | OK |
| /blogg/v16-produktlanseringar-analys | 4 543 | OK |
| /blogg/v12-intaktsstabilitet-analys | 5 740 | OK |

### Topsidor — 8 OK, 5 tunna, 1 fel

| Sida | Tecken | Bedömning |
|---|---|---|
| / | 3 496 | OK |
| /kurser | 23 819 | OK |
| /analyser | 2 363 | OK |
| /labb | 22 374 | OK |
| /blogg | 6 248 | OK |
| /kalkylator | 4 853 | OK |
| /laroplan | 2 616 | OK |
| /medlemskap | 2 108 | OK |
| /profil | 966 | **TUNT** (gränsfall, strax under 1 000) |
| /logga-in | 710 | **TUNT** (förväntat för inloggningssida) |
| /min-portfolj | 643 | **TUNT** (troligen inloggningsstyrd app-sida) |
| /topplista | 506 | **TUNT** |
| /certifikat | 450 | **TUNT** |
| /bibliotek | 97 | **FEL** — 404, finns ej |

**Slutsats § 3:** Kurs- och bloggarkivet håller jämn, god kvalitet (quiz finns överallt, svenska diakriter korrekta). De tunna topsidorna är sannolikt klientrenderade/inloggningsstyrda — utom /certifikat och /topplista som bör kunna bära publikt innehåll och idag serverar nästan tom HTML till sökmotorer och besökare utan JS.

## 4. Manglade tecken (å/ä/ö)

Tre fullständiga genomsökningar av samtliga 704 sidor (skiftlägeskänsliga mönster + kontextverifiering av varje träff + U+FFFD/mojibake-pass).

### Uppdragets fyra mönster — exakta träffar

| Mönster | Träffar | Verdict |
|---|---|---|
| `varde ` | **0** av 704 sidor | — |
| `Atter` | **0** av 704 sidor | — |
| `SALJ` | **0** av 704 sidor | — |
| `KOP ` | **1** (äkta) | /labb/cmskfjfmn0001tdfbrxloc3tt |

### Äkta mangling — exakt 1 sida av 704

**/labb/cmskfjfmn0001tdfbrxloc3tt** (case "Special Situation: Fusion FPC + Emission 110 MSEK — Precise Biometrics"):

| Mangled text | Skulle vara | Antal |
|---|---|---|
| `FORSIKTIGT` | FÖRSIKTIGT | 2 |
| `KOP` | KÖP | 2 (varav 1 med följande mellanslag) |
| `MSEK/ar` | MSEK/år | 1 |
| `SEK/ar` | SEK/år | 1 |
| `stark karna` | stark kärna | 1 |
| `Synergimal` | Synergimål | 1 |

Detta är datafel i själva case-datat (diakriterna är borttagna i källtexten), inte ett kodningsfel i transporten — övriga 703 sidor är felfria.

### Verifierade falska positiva (redovisas för ärlighet)

- `over ` 2 träffar på /labb — kommer från engelska "First-mover", inte "över".
- `ater ` 1 träff på /kurser/km-039-pharmasektorn — kommer från "kandidater ", inte "åter".
- `aven ` 7 träffar på 5 kurssidor (km-008-wacc, pc-04-case-investor-ab, rk-06-regulatorisk-risk, pf-03-diversifiering, the-intelligent-investor) — alla från "kraven "/"innehaven ", inte "även".

### Kodningshälsa globalt

- U+FFFD (�): **0** träffar på 704 sidor.
- UTF-8-mojibake (Ã¥/Ã¤/Ã¶/â€ …): **0** träffar på 704 sidor.
- å/ä/ö korrekt renderade: 49/49 stickprovssidor.

**Slutsats § 4:** Encoding-pipelinen är frisk. Ett enda dataobjekt (ett labb-case) har diakritförlorad källtext, och det råkar innebära att en rekommendationsetikett visas fel ("FORSIKTIGT KOP" i stället för "FÖRSIKTIGT KÖP") på en finanssida — därför P1.

## 5. Trasiga interna länkar

Extraherade alla href från /, /kurser och /laroplan:

| Källsida | href totalt | Unika interna mål |
|---|---|---|
| / | 13 | 11 |
| /kurser | 252 | 251 (tillsammans med övriga) |
| /laroplan | 39 | (ingår i ovan) |
| **Union** | — | **251 unika interna mål** |

Stickprov 50 slumpvis valda mål: **50/50 svarade 200**, 0 redirects, 0 fel.

| URL → mål | Status |
|---|---|
| (inga trasiga interna länkar hittade) | — |

**Slutsats § 5:** Ingen trasig intern länkning bland de 251 länkmålen från nav-sidorna (varav 50 stickprovade). Notera att ingen av de tre källsidorna länkar till /bibliotek, vilket stämmer med att sidan inte finns.

## 6. Meta/SEO-brister

Kontrollerat på alla 49 stickprovssidor (inkl. samtliga i uppdraget listade topsidor):

| Kontroll | Resultat | Brist |
|---|---|---|
| `lang="sv"` | 49/49 | Nej |
| viewport-meta | 49/49 | Nej |
| meta description | 49/49, längd 97–204 tecken | Nej (alla inom rimligt span) |
| canonical | 47/49 korrekt self-canonical | **JA: `/` (roten) saknar canonical helt.** (404-sidan /bibliotek saknar också, oväsentligt.) |
| robots.txt | 200, korrekt Allow/Disallow (/admin, /api/admin/, /api/member/, /api/cron/, /api/migrate-to-supabase) + korrekt `Sitemap:`-rad | Nej |
| Dubbletttitlar | 3 grupper, se §2 | JA |
| 404-sida | Returnerar korrekt 404-status men **återanvänder hemsidans titel och description** (97 tecken innehåll) | JA |
| Semantik | Kurs-, analys- och labbsidor saknar `<main>` (och `<article>`); blogg har `<article>`, `/` har `<main>` | JA (mindre) |
| Sitemap | 704 URL:er, alla giltiga | Notis: avviker från väntade ~515 — bekräfta att sitemapen är automatgenererad så nya sidor (och borttagna) följer med |

## 7. Prestanda-flaggor

HTML-sidstorlek (bytes, okomprimerat som levererat) för samtliga 704 sidor + stickprov:

- **Sidor > 500 kB: 0.** Inga sidor flaggas mot tröskeln.
- Genomsnitt: **52,2 kB** | Max: **300,6 kB** | Total vikt alla 704 sidor: 35,9 MB.

10 slumpmässigt valda sidor:

| Sida | Storlek |
|---|---|
| /labb/cmsfaaydw000ct2iq7qkb9qjv | 35,4 kB |
| /analyser/hm-b-st/v08-ebitda-marginal | 37,0 kB |
| /analyser/azn-st/v02-arr-tillvaxt | 37,3 kB |
| /labb/cmsfaayh0003yt2iqvv40yp38 | 35,7 kB |
| /analyser/volcar-b/v14-varumarke | 37,7 kB |
| /analyser/abb-st/v04-ps | 36,3 kB |
| /kurser/mk-10-oljepris | 81,3 kB |
| /kurser/rk-13-gdpr-och-datarisk | 77,5 kB |
| /kurser/sj-04-optionsbeskattning | 74,4 kB |

Tungaste sidorna på hela siten: /kurser **300,6 kB**, /labb **260,2 kB**, /kurser/v19-kapitalforbranning 171,9 kB, /kurser/zero-to-one 128,9 kB, /kurser/mina-basta-investeringar 128,4 kB. Listningssidorna /kurser och /labb bär med sig hela katalogen i HTML — inte akut, men tyngst att ladda på mobilt.

**Slutsats § 7:** Inga sidor nära 500 kB-tröskeln. God marginal. /kurser och /labb är ~6x tyngre än genomsnittet och är de enda rimliga optimeringsobjekten.

## 8. PRIORITERAD FIX-LISTA

| Prio | Åtgärd | Var |
|---|---|---|
| **P1** | Korrigera manglat case-data: "FORSIKTIGT KOP"→"FÖRSIKTIGT KÖP" (2 st), "MSEK/ar"/"SEK/ar"→"MSEK/år"/"SEK/år" (2 st), "stark karna"→"stark kärna" (1 st), "Synergimal"→"Synergimål" (1 st). Sök även i case-databasen efter andra poster med borttagna diakriter i rekommendations-/utfallsfält. | /labb/cmskfjfmn0001tdfbrxloc3tt |
| **P2** | Lägg till self-canonical `<link rel="canonical" href="https://lab.ak1nvestor.com/">` på roten — alla andra sidor har den, roten saknar den. | / |
| **P2** | Ge /privacy-policy och /terms egna titlar och descriptions (ärver idag hemsidans identitet, 2 av 3 dubbletter i §2). | /privacy-policy, /terms |
| **P2** | Särskilj titlarna på de två "Återinvestering"-kurserna, t.ex. "Återinvestering — Portföljspåret (PF)" / "Återinvestering — Utdelningsspåret (UD)". | /kurser/pf-06-aterinvestering, /kurser/ud-02-aterinvestering |
| **P2** | Utred det dubbla labb-caset "Bolån-garant-kollaps" (två olika ID): om det är samma case — konsolidera och 301:a ena URL:en; om det är olika — särskilj titlar/innehåll. | /labb/cmsfaayi6004lt2iq7r4qn8es, /labb/cmsfaayi7004mt2iq6mhb1qm2 |
| **P2** | Server-rendera eller noindex:a tunna publika sidor: /certifikat (450 tecken) och /topplista (506 tecken) serverar nästan tom HTML — antingen fyll dem med statiskt välkomstinnehåll eller markera noindex så de inte indexerar tomma. | /certifikat, /topplista |
| **P3** | Ge 404-sidan egen titel och description ("Sidan hittades inte — AK1A Research Lab") i stället för hemsidans titel+desc. | 404-containern |
| **P3** | Lägg till `<main>` på kurs-, analys- och labb-mallar (finns bara på /; blogg har `<article>`) — bättre semantik, tillgänglighet och SEO-signal. | Alla mallar utom / och blogg |
| **P3** | Överväg paginering/progressiv lazy-load av listningarna /kurser (300,6 kB) och /labb (260,2 kB) för mobil prestanda. Ingen sida passerar 500 kB idag — förbättring, inte brand. | /kurser, /labb |
| **P3** | Bekräfta att sitemap är automatgenererad (704 URL:er mot väntat ~515) så tillagda/borttagna sidor synkas; komplettera gärna /profil (966 tecken, gränsfall) med statiskt välkomstspår-innehåll. | Sitemap-pipeline, /profil |

---

## Total sammanfattning

**Hälsa:** 704/704 URL:er svarar 200. 0 trasiga sitemap-länkar, 0 redirects, 0 trasiga interna länkar (50/50 stickprov), 0 sidor över 500 kB, 0 U+FFFD/mojibake. Kurs-, analys-, labb- och bloggarkivet är i mycket gott skick: quiz ("Testa dig själv") finns på 30/30 stickprovade kurser, innehållslängd 4 381–7 667 tecken, korrekta å/ä/ö överallt utom ett enda objekt.

**Funna brister:** 1 sida med manglat innehåll (labb-case med felaktig rekommendationsetikett "FORSIKTIGT KOP"), saknad canonical på roten, 3 dubbletttitelgrupper, 5 tunna topsidor, 404-sida med hemsidans metadata.

**Prioriterad fix-lista: P1 = 1, P2 = 5, P3 = 4.**
