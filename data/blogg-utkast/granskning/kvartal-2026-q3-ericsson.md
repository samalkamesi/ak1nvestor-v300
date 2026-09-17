# Granskning: sa-laser-du-ericsson-q3-2026.json (kvartalsbolagspaket 2026:3)

**Granskad:** 2026-09-16 · **Granskare:** agentfabrik s1-u1 (omgång auto-s1-1789585526448)
**Objekt:** `data/blogg-utkast/kvartal/2026-q3/sa-laser-du-ericsson-q3-2026.json`
**Bedömning: FLYTTKLAR EFTER TVÅ RÄTTNINGAR** (B1 språkfel + B2 readingMinutes; C1–C7 är förslag som kräver beslut)

**Pivot-notering:** Uppdragets ordagrunda objekt (m9-utkast #1, boerspsykologi-fallstugor) var
redan levererat — våg 151 den 2026-09-14 + kontrollgranskning 2026-09-16 (commit 02224ea4); hela
m9-serien 6/6 granskningsklar. Köregeln ("nästa icke levererade — duplikat är förlorat arbete")
påbjöd pivot; valet föll på Ericsson-paketet = näst tidigaste rappdagen bland ogranskade paket
(2026-10-15 07:00, officiellt bekräftad) och rad 3 i kundens kövy. Anspråk registrerad före arbete.

---

## 1. Källkontroll — 4/4 källor existerar och bärs korrekt

| Källa | Fil | Status |
|---|---|---|
| Våganalys (klasser, matris, volatilitet, nivåer) | data/analyses/ERIC-B.ST.json (verified 2026-08-24) | Finns; samtliga värden återfinns (se §2) |
| Nyckeltal, kurs, börsvärde | data/portfolj-system/bolagsunivers.json, rad ERIC-B.ST (hämtat 2026-09-03) | Finns; samtliga 16 värden återfinns |
| Rapportdatum, tidpunkt, webcast, referensdata | kalender-teknik.json, ERIC-raden (källor hämtade 2026-09-15) | Finns; samtliga 4 uppgifter återfinns |
| Vågvalideringsuniversum (12 tickers) | data/rapporter/vagvalidering-SENASTE.json + .md | Finns; universumAntal = 12 och ERIC-B.ST listas (md rad 31) |

Källbeskrivningen i utkastet stämmer till punkt: MarketStack-noten ("saknade färsk kurs och
kunde inte dubbelkolla") motsvarar källans egen notering ("eod/latest: ingen färsk data"),
ROIC-proxyn beskrivs ordagrant som källans notering anger, och prognostillväxten förklaras som
konsensus EPS-tillväxt +1 år (earningsTrend) — exakt källans definition.

## 2. Sifferkontroll — 36/36 gröna (egna omräkningar/avrundningar mot källfilerna)

**Vågdata (8):** klasser per horisont mikro=basbygge, kort=korrigering, medellång=impulsvåg,
lång=impulsvåg, mega=korrigering — exakt mot `waveSummary.perHorisont`. Matrisen 8▲/6▼/11—
överensstämmer med källans bullet OCH med egen cellräkning i matris25 (8 positiva, 6 negativa,
11 nollor). Volatilitet 32 %/år och 52v-position 49 % — mot källans bullets. overallBias
"Blandad bild" citeras troget.

**Prisnivåer (4):** 52v-låg 65,94 · MA50 101,43 · MA200 101,78 (källa 101.7768, korrekt
avrundat) · 52v-högst 128,45.

**Nyckeltal (16):** ROE 26,1 (0,2608) · ROIC 21,2 (0,2118) · bruttomarginal 48,1 (0,4813) ·
EBIT 12,5 (0,1248) · netto 10,8 (0,1083) · FCF-marginal 13,5 (0,1349) · FCF-avkastning 9,7
(0,0967) · TTM-tillväxt −6,1 (−0,061) · prognos +8,0 (0,0796) · P/E 13,2 (13,163) · EV/EBIT
10,8 (10,759) · P/B 3,1 (3,087) · PEG 1,9 (1,93) · kurs 97,14 · börsvärde "cirka 318 mdr"
(317,505 — "cirka" gör det ärligt) · skuld/EK 0,38 (0,3768). Samtliga avrundningar korrekta.

**Ärlighetsrader (2):** femårsserier/CAGR redovisas inte — källans serier är tomma och CAGR
null; räntetäckning "kunde inte beräknas" — källvärde null. Båda saknad-data-påståendena SANTA.

**Kalender (4):** 15 oktober kl 07:00 officiellt bekräftad · telefonkonferens/webcast samma dag ·
referensdata publiceras i september · källäsning 2026-09-15 — alla fyra mot kalenderfilens
ERIC-rad och dess källfält.

**Universum + urvalspåståenden (3):** "ett av de tolv i vågvalideringens universum" SANT
(universumAntal 12, ERIC listas). "Ericsson rapporterar tidigast med officiellt bekräftat datum
bland analysbibliotekets bolag" SANT med nyansen att HM-B (09-24) och Industrivärden (10-07)
rapporterar tidigare men UTAN bekräftade datum — bland bekräftade analysbolag är ERIC först.
MarketStack-beskrivningen SANT (se §1).

## 3. Juridikgrinden (lagen 2007:528) — REN

- **KontrolleraText-spegel** (data/varumarke.json, alla 26 förbjudna fraser mot
  titel+ingress+body): **0 FEL, 0 VARNINGAR**.
- **Rekommendationsverb i kontext:** 8 träffar för köp/sälj/köpa/sälja/håll — samtliga antingen
  i negerade konstruktioner ("inte en rekommendation att köpa, sälja eller behålla några
  värdepapper"; "Inga köp-, sälj- eller hållningsrekommendationer förekommer") eller falska
  positiva ("innehålla stora omflyttningar", "åt ena hållet"). Noll rådgivningsbärande.
- **Lagrum:** endast (2007:528) 2 kap 5 § i disclaimern — rätt lag, rätt paragraf, rätt
  användning (utbildningsundantaget). Inga andra lagrum nämns → ingen risk för lagrumsblandning.
- **Ton:** övningarna är genomgående rammade som övningar ("ett övningsexempel", "vad varje
  utfall skulle lära ut om metoden"), konsensus kallas "ett pedagogiskt verktyg — aldrig en
  handssignal". Juridiskt bärkraftigt.
- **Noterad förbättring mot källan:** analysfilen bär ett "priceTarget": 128,45 — utkastet har
  medvetet omformats det till "52-veckorshögst … observerade lägen i efterhand — inte nivåer
  kursen borde nå". Det är exakt den riktning juridikgrinden kräver; källans målkursspråk hade
  varit rådgivningsnära.

## 4. 911-kontroll — 0 träffar

Sex mönster (911, 9/11, 9-11, "11 september", "september 11", "eleven september") mot
titel+ingress+body: **0 träffar**.

## 5. Länkkontroll — 13/13 gröna

12 interna länkar (10 aspektsidor /dataset/teknik/*, /bolag/eric-b-st, /kurser) samt externa
/blogg — samtliga HTTP 200 mot localhost (loopback). EN anmärkning på länkens TEXT: se C6.

## 6. Fynd och rättningar

**B1 (byt):** "det är alltid den källan som gäller **fram till allt annat**" → "framför allt
annat". Skrivfel; "gäller fram till allt annat" är ingen svensk konstruktion och förväxlas med
tidsuttryck.

**B2 (byt):** readingMinutes 6 → 2. Plattformskontraktet (ORD_PER_MINUT=600,
Math.max(1, Math.round(ord/600)) i src/lib/blogg-utkast.ts): titel+ingress+body = 1 242 ord → 2.
Ännu en verifierad instans av granskningsköns kända systematikat (lakemedels, ravarubolag,
teknikaktier, energibolagens-utdelningspolitiken, volvo-car — nu ericsson).

**C1 (förslag):** title 81 tkn → 63: "Så läser du Ericssons Q3-rapport 2026 — nyckeltal och
scenarier" (SEO-taket ~60; nuvarande titel klipps i mobila träffar).

**C2 (förslag):** description 204 tkn → 161: "Ericsson rapporterar Q3 2026 den 15 oktober kl
07:00. Här är läspaketet: vågmätningen, nyckeltalen, tre sätt att läsa utfallet — och källorna
bakom varje siffra." (SEO-fönstret ~155–160).

**C3 (förslag):** "en vecka före hösten av industribolag" är approximativt: huvudvågan börjar
med ABB 20 oktober (= 5 dagar; SKF 21, Atlas Copco/Sandvik 22) och Industrivärden i samma
industrikalender rapporterar 10-07 — FÖRE Ericsson. Förslag: "före den tunga industribolagsvågan
som inleds 20 oktober".

**C4 (förslag):** Övning B:s "pris per gigabyte sålt" är ett operatörsbegrepp — Ericsson säljer
utrustning/tjänster, inte data per gigabyte. Förslag: stryk det och lägg till IPR-licensintäkter
(Ericssons kända marginaldrivare): "mix av nätverk versus tjänster, IPR-licensintäkter,
valutaeffekter, engångsposter".

**C5 (förslag):** "de längre horisonterna lutar åt impulsvåg" — mega (den längsta) är
korrigering; impulsvåg gäller medellång och lång. Förslag: "medellång- och långhorisonten lutar
åt impulsvåg".

**C6 (förslag):** Källraden lovar "speglad i [kvartalsrapporten för 2026:3](…/blogg)" — den
kvartalsrapporten är OPUBLICERAD (utkast i data/blogg-utkast/, granskad men ej flyttad); länken
leder till bloggindexet. Förslag: länka den publicerade vågkartsposten i stället
(/blogg/vagkartan-traffprocent, verifierad 200) — eller API-spegeln /api/data/vagstatistik.

**C7 (R2-not):** publishedAt "2026-10-13" — publiceringsdatum är kundens beslut (R2). 10-13
(två dagar före rappdagen) är ett rimligt default men ägs av kunden; granskaren sätter inget
nytt värde.

## 7. Flaggor till köägaren

- **readingMinutes-systematikat:** sjätte observerade instansen i granskningskön — kur bör
  läggas i byggarverktyget (beräkna i export/skrivtid), inte plogas per granskning.
- **GRANSKNINGSKO-SAMMANSTALLNINGEN** listar Ericsson-paketet men saknar fortfarande m9-serien
  och de nya branschguiderna; kön växer fortare än vyn uppdateras (känd flagga, upprepas).
- **Objektval:** Nike-paketet togs parallellt av syskon s1-u3 (deras anspråk 21:09); detta
  paket (Ericsson) var fritt vid anspråkstillfället 21:15.

## 8. Slutsats

Siffrorna håller hela vägen ner till källfilerna (36/36), juridiken är ren (0/0 av 26 regler,
endast korrekt åberopad 2007:528 2 kap 5 §), 911 = 0, länkarna hela. Två maskinella rättningar
(B1–B2) och sju beslutsförslag (C1–C7) — efter B1–B2 är paketet FLYTTKLART. Publicering förblir
kundens beslut (R2). Diff i maskinläsbar form: kvartal-2026-q3-ericsson-diff.json.
