# STYRELSE — Analysbiblioteket: arkitekturråd "Analysfabriken"

Datum: 2026-09-04 · Författare: styrelsens rådgivare (ANALISPRODUKTION, AK1A)
Mandat (kundens ord): "börja producera och spara i analys biblioteket analyserna
och hitta de bästa bolgen och aktier så vi kan lägga analyser och blogge om de
bästa bolagen och aktier som följer våra strikta riktlinjer".
Status: RÅD — inget committat, inget byggt. Allt nedan är verifierat mot repot.

---

## 0. TL;DR för styrelsen

1. All grundinfrastruktur FINNS: 100 dubbelkällade bolag (korstabell-grund),
   AKM1-motor, FVag-vågmotor, konfluensmotor, riskportföljmotor, bloggsystem
   med schema, premium-/analyser-sidor. Saknas är SAMMANLÄNKNINGEN: ett urval,
   en generator, ett publikt bibliotek, en bloggkörning.
2. Följande namnkollision måste styrelsen besluta om: `data/analyses/`
   (engelska, = grundarens premiumanalyser, läses av /analyser) vs nytt
   `data/analyser/` (svenska, = Analysfabrikens automatiska bibliotek).
   Rekommendation: behåll båda — olika språk, olika syfte — men dokumentera
   skillnaden på båda sidor (se §2.2 och §3).
3. Urvalsregeln "grön ELLER (gul OCH AKM1 ≥ 65 % av max OCH täckning ≥ 70 %)
   OCH inget portbrott" ger i dagens data 22 bolag, varav 5 svenska:
   INDU-C.ST, INVE-B.ST, NP3.ST, TRUE-B.ST, HM-B.ST. Topp 5 för bloggen
   föreslås ur denna pool (se §2.1).
4. Ärlighet är varumärket: det automatiska biblioteket är ett
   FORSKNINGSUNDERLAG — aldrig grundarens 99-sidorsrapporter. Positionera
   hela systemet som "Forskningsbiblioteket" med tydlig etikett per analys.

---

## 1. Nuläge — vad som redan finns (verifierat i repot)

| Del | Fil/plats | Vad den gör |
|---|---|---|
| Dubbelkällat univers | `data/portfolj-system/bolagsunivers.json` + `data/cache/fundamental-{T}.json` | 100 BolagsNyckeltal, källa A Yahoo + källa B MarketStack (manifest.json dokumenterar SSRF-försvaret) |
| AKM1-lager | `data/cache/akm1-{T}.json` (100 st, `verktyg/python/bedom_akm1.py`) | 20 variabler 0–5 p, totalt /100, motivering PER variabel |
| FVag-lager | `data/cache/fvag-{T}.json` (100 st, `verktyg/kor-fvag.mjs`) | fundamental vågklass per variabel × horisont, klass+dynamik+anteckning |
| Korstabell D1 | `data/portfolj-system/korstabell-grund.json` | 100 rader: akm1Totalt, perKategori, fvagPerHorisont×5, fvagDynamik, golvMarginal, portV19, datatackning, akm1MaxMojligt, status grön/gul/röd, senastKontrollerad |
| Statusregler (D1) | samma fil + `sammanstalla_korstabell.py` | grön = AKM1 ≥ 70 % av max OCH täckning ≥ 60 % OCH ej port; gul = 50–70 %; röd = < 50 % ELLER portbrott (V19) |
| Portfölj-API | `src/app/api/portfolj-forskning/route.ts` + `src/lib/portfolj-forskning/*` | GET korstabellrader; POST riskprofil → portfölj (AKM1 50 % · vågstatus 35 % · golv 15 %) |
| Konfluensmotor | `src/lib/konfluens-motor.ts` + `/api/konfluens` | 5 dimensioner 0–100 (värdegolv, kvalitet, fundamental vågstart, prisvågläge, divergens), server-only, MAX 10 tickers/anrop, LIVE Yahoo-data — lagras EJ |
| Vågfundament | `src/lib/vagfundament-motor.ts`, `fundamental-vagmotor.ts` | 20×5-matrisen som FVag bygger på |
| Premiumanalyser | `data/analyses/{T}.json` (10 st) + `/analyser`, `/analyser/[ticker]`, `/analyser/[ticker]/[variabel]` | grundarens spår: force-static, SEO, "99 sidor"-löfte i metatexten; statusfältet är redan ärligt ("Datadriven föranalys … väntar grundaren") |
| Analysbanken | `src/lib/analysbank.ts` | OBS: KLIENT-side localStorage ("ak1a-analysbank-v1", max 50 rader) — elevens egna verk till /rapporter. INTE ett serverbibliotek; återanvänd inte namnet |
| Blogg | `data/blogg/*.json` (35 st) + `src/lib/content.ts:getBlogPosts()` + `/blogg/[slug]` + speglar `/en|/ar/blogg` | schema: slug/title/description/pillar/author/publishedAt/readingMinutes/tags/body; listan sorteras på publishedAt; interna kurslänkar (`/kurser/v01-…`) finns sedan tidigare i v01–v20-posterna |
| AKM2 | `data/forskning/AKM2-BESLUT.md` | viktprofil "akm2-2026" (V01–V20 58 % + V21–V28 42 %), projektionsinvarianten säkrar AKM1-kompatibilitet |
| Uppföljningsprecedens | `data/portfolj-system/uppfoljning/{id}.json` + `/api/cron/portfolj-uppfoljning` | mönster att kopiera för steg 3 (automation) |

Datans faktiska läge (2026-09-03): 7 grön · 76 gul · 17 röd · 1 portbrott.
Datatackningen är 71,1 % för de flesta (V11, V13–V18 m.fl. är osatta — känt,
dokumenterat i manifestet). golvMarginal är null för alla utom fastigheter
(NP3.ST −0,42 är enda satta svenska värdet). fvagPerHorisont är "osatt" för
i princip alla Svenska kandidater — generatoren måste kunna skriva "osatt"
ärligt (motorn gissar aldrig).

---

## 2. Analysfabriken — arkitektur i fyra steg

```
korstabell-grund.json ──► (A) URVAL ──► (B) GENERERING ──► data/analyser/{T}.json
                             │                                   │
                             │                     (C) PUBLICERING /forskningsbiblioteket
                             └────────────────► (D) BLOGG data/blogg/analys-{slug}.json
```

### 2.1 (A) URVAL — de strikta riktlinjerna, exakt

KANDIDATREGELEN (deterministisk, körbar på korstabellen, inga gissningar):

```
kandidat ⇔
     portV19 = false                                   (hårt port: kassatäckning)
 AND datatackning ≥ 0,70                               (annars vet vi för lite)
 AND ( status = "grön"
       OR ( status = "gul" AND akm1Totalt/akm1MaxMojligt ≥ 0,65 ) )
```

Motivering av trösklarna ur dagens data (100 rader):

- 0,70 i täckning: 71,1 %-nivån är det naturliga "bra pass 1"-planet; grön-
  regeln tillåter 60 % men för PUBLIK analys vill styrelsen ha ett högre golv.
- 0,65 relativ AKM1 för gul: gül-bandet slutar vid 70 % (gränsen mot grön);
  0,65 klipper bort 54 av 76 gula och lämnar en hanterbar pool.
- Grön släpps in på 60 % täckning (D1:s egen regel) — men varje grön rad
  under 0,70 täckning flaggas med varningsetikett i genereringen.

Simulerat utfall (2026-09-03): **22 kandidater, varav 5 svenska**:

| Ticker | Namn | AKM1 | Rel % | Täckning % | fvagDynamik | Status |
|---|---|---|---|---|---|---|
| INDU-C.ST | AB Industrivärden | 58,1 | 86,7 | 67,0 ⚠ | stabilt | grön |
| INVE-B.ST | Investor AB | 54,0 | 85,9 | 62,9 ⚠ | osatt | grön |
| NP3.ST | NP3 Fastigheter | 48,9 | 68,8 | 71,1 | förbättras | gul |
| TRUE-B.ST | Truecaller | 47,2 | 66,4 | 71,1 | stabilt | gul |
| HM-B.ST | H & M | 46,6 | 65,5 | 71,1 | stabilt | gul |

(Globala: NEM, NHY.OL, NOVO-B.CO, T, LOGN.SW, META, BSX, MC.PA, VZ, SAP.DE,
NKE, CVX, PG, GOOGL, PLTR m.fl. — 17 st till.)

Toppurval för BLOGGEN (D): rankning = 0,50 × relativ-AKM1 + 0,20 ×
dynamikbonus (förbättras 1,0 / stabilt 0,6 / osatt-försvagas 0) + 0,15 ×
täckning + 0,15 × konfluensbonus (om mätning finns, annars omfördelas
proportionellt — determinismen bevaras genom att omfördelningen är en fast
regel, inte ett val per körning). Svenska prioritetsordningen blir:
INDU-C.ST → NP3.ST → TRUE-B.ST → INVE-B.ST → HM-B.ST.

Konfluens ≥ 70 som VILLKOR avvisas i MVP: konfluensen beräknas LIVE ur
Yahoo per max 10 tickers och lagras inte — att göra den till hårt grindvillkor
gör urvalet icke-reproducerbart. I steg 2 blir konfluens ett BERIKNINGSLAGER
(senaste mätning + datum sparas i analys-jsonen), och först då kan regeln
skärpas till "grön ELLER (gul OCH konfluens ≥ 70 vid senaste mätning ≤ 14
dagar gamla)". Styrelsen beslutar om skärpningen när lagret finns.

Ärlighetsnoteringar som URVALET måste visa öppet:
- INDU-C.ST heter "AB Industrivärden" i korstabellen men motiveras som
  "Indutrade" i manifest.json §branscher — namnverifiering krävs innan
  publicering (Indutrade = INDT-C.ST; misstänkt felmärkning i universet).
- Gröna bolag under 70 % täckning (INDU-C.ST, INVE-B.ST) får etikett
  "grön (låg täckning)" i biblioteket.
- golvMarginal saknas för nästan alla — golvsektionen får oftast "osatt",
  utom fastigheter (NAV-proxy).

### 2.2 (B) GENERERING — automatisk bolagsanalys per kandidat

Ny katalog `data/analyser/` (svensk stavning = fabriken; engelska
`data/analyses/` = grundarens premium). En fil per ticker:
`data/analyser/{ticker}.json` där ticker saneras som filnamn (samma mönster
som cachen: `.` → `_`, t.ex. `INDU-C_ST.json`) — med ett `ticker`-fält som
alltid bär den äkta symbolen.

Schema `analysfabrik-v1` (förslag, exakt):

```json
{
  "schema": "analysfabrik-v1",
  "ticker": "NP3.ST",
  "namn": "NP3 Fastigheter AB (publ)",
  "bransch": "fastighet",
  "versionsdatum": "2026-09-04",
  "underlagSenastKontrollerad": "2026-09-03",
  "urval": { "regel": "kandidatregeln v1", "status": "gul",
             "relativAkm1": 0.688, "datatackning": 0.711, "portV19": false },
  "akm1": { "totalt": 48.9, "maxMojligt": 71.1, "relativ": 0.688,
            "perKategori": { "tillvaxt": 0.67, "…": "…" },
            "starkast": "lonsamhet", "svagast": "katalysator",
            "osattaVariabler": ["V02","V03","V11","…"],
            "topp3Motiveringar": ["V19 …", "V09 …", "V07 …"],
            "botten3Motiveringar": ["V05 …", "…", "…"] },
  "vaglage": { "perHorisont": { "mikro": "osatt", "kort": "osatt",
                "medellang": "osatt", "lang": "osatt", "mega": "osatt" },
               "fvagDynamik": "forbattras",
               "tolkning": "Fundamentala vågor ej klassade på aggregatnivå …" },
  "konfluens": null,
  "golv": { "typ": "NAV-proxy", "marginal": -0.4217,
            "not": "Bokfört EK/aktie som NAV-proxy (fastighetsundantag)" },
  "risker": ["…", "…", "…"],
  "falsifiering": ["V09 ROE under 15 % nästa rapport ⇒ kvalitetstesen försvagas",
                   "fvagDynamik → försvagas i nästa korstabell ⇒ urvalet omprövas",
                   "datatackning < 0,60 ⇒ raden nergraderas till röd-statuslogik"],
  "lasMer": { "bloggSlug": "analys-np3-fastigheter-2026",
              "kurser": ["/kurser/v09-roe", "/kurser/v19-kassateckning"] },
  "etikett": "Automatiskt forskningsunderlag — ej grundarens 99-sidorsanalys",
  "disclaimer": "Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)."
}
```

Genereringens bestämningsregler (allt ur befintliga filer — ingen ny data-
insamling i MVP): urval + kategoriprofil ur korstabellraden; topp/botten-3
samt osatta-listan ur `data/cache/akm1-{T}.json` (motiveringstexterna är
redan skrivna där — återanvänd ordagrant); vågläge ur korstabellens
fvagPerHorisont + dynamik; golv ur golvMarginal (fastighetsundantaget);
konfluens = null i MVP. Risker och falsifiering genereras mallbaserat per
kategori/kombination (deterministiska regler: t.ex. låg V12 + cyklisk
bransch ⇒ "intäktsvolatilitet", röd V05 ⇒ "värderingsrisk", osatt V11 ⇒
"balansräkningsdata saknas — okänd likviditet"). FALSKIFIERING är kundkultur:
varje analys MINST tre mätbara villkor som skulle förkasta tesen, med
variabel-ID och tröskel — inga "kan gå ner"-fraser.

Versionering: `versionsdatum` = genereringsdagen; hela filen skrivs om vid
omgenerering (oföränderlig historik behövs inte i MVP — korstabellens
`senastKontrollerad` är spåret). Äldre generering arkiveras aldrig i MVP.

### 2.3 (C) PUBLICERING — Forskningsbiblioteket på sajten

Nya rutter (force-static, samma mönster som /analyser):

- `/forskningsbiblioteket` — lista: kortkort per bolag (namn, ticker, status-
  chip grön/gul, AKM1-rel, täckning, dynamik, versionsdatum, länk till detalj
  + till bloggpost om den finns). Varningsrad för låg täckning. Inledande
  text som ÄRLIGT särskiljer från /analyser ("automatiskt underlag, 1 sida,
  20 variabler — grundarens 99-sidorsanalyser finns här: länk").
- `/forskningsbiblioteket/[ticker]` — detaljsida med hela schemat ovan:
  AKM1-profil (kategoribars + topp/bottom-3 med motiveringar), vågläge per
  horisont (5 chips, "osatt" syns), konfluensblock (dolt/„ej mätt" i MVP),
  golv, risker, FALSKIFIERING som egen markerad sektion, urvalsregeln visad
  rå + utfallet för just detta bolag (transparens = kundkultur), disclaimer.
- Korslänkar: /analyser får en rad "Se också: Forskningsbiblioteket
  (automatiska analyser av hela universet)"; /topplista och /portfolj-
  forskning länkar in.

SEO: egen metadata via `pageMetadata()`, longtail-titlar
("NP3 Fastigheter analys — AKM1-forskning | AK1A"), aldrig "99 sidor"-löftet,
JSON-LD `analysisJsonLd`-mönstret återanvänds, anpassat. Ingen indexering av
"osatt"-tunga sidor behövs undvikas — de indexeras, ärligheten är poängen.

Dataflöde: ny server-lib `src/lib/analysfabrik.ts` — `lasAnalyser()` läser
`data/analyser/*.json` (samma toleranta mönster som korstabell-data.ts),
`getAnalys(ticker)` via normaliserad ticker. INTE i analysbank.ts (den är
klient/localStorage och heter nästan likadant — se §6 risk).

### 2.4 (D) BLOGG — generator för "Analys: {bolag}"

Skript `verktyg/kor-analysblogg.mjs` (samma namnmönster som kor-fvag.mjs):
läser toppurvalet (§2.1) + respektive `data/analyser/{T}.json` och skriver
`data/blogg/analys-{namn}-{ar}.json` (t.ex. `analys-np3-fastigheter-2026.json`)
i EXAKT befintligt blogg-schema — slug, title, description, pillar
("Svensk aktieanalys"), author ("Ak1 Apex Nexus"), publishedAt, readingMinutes
(6–8), tags [bolagsnamn, ticker, "AKM1", "forskning", "svensk aktieanalys"],
body (markdown-lik, ## rubriker).

Body-mall (deterministisk, alla siffror interpolerade ur analys-jsonen):

1. Ingress: bolaget + varför det är i urvalet (regeln, inte tycke).
2. "Så ser AKM1-profilen ut" — totalt, relativ poäng, starkast/svagast
   kategori, 2–3 motiveringar ordagrant ur akm1-filen.
3. "Vågläget" — per horisont, med "osatt är osatt"-ärligheten förklarad.
4. "Golv och risker".
5. "Vad som skulle falsifiera bilden" — kundkulturens signatursektion.
6. "Fördjupa dig" — INTERN KURSLÄNKNING: 2–3 `/kurser/v{XX}-…` valda efter
   bolagets starkaste/svagaste variabler (t.ex. NP3 → v09-roe + v05-pb), plus
   länk till detaljanalysen `/forskningsbiblioteket/{ticker}` och relevant
   befintlig guide (t.ex. komplett-guide-svensk-aktieanalys-2026).
7. Kursiv disclaimer-rad.

Kadens i MVP: manuellt körd, 1 bolag/vecka, svenska först. Bloggsluggen
registeras i analys-jsonens `lasMer.bloggSlug` (tvåvägslänk). `getBlogPosts()`
behöver ingen ändring — nya filer dyker upp automatiskt, och speglarna
(/en, /ar) plockar dem via översättningskön som vanligt.

---

## 3. Manual vs auto — den ärliga positioneringen

| | Premium (AK1A-analys-skillen) | Analysfabriken (auto) |
|---|---|---|
| Format | 99 sidor, Monte Carlo, bayesiansk omviktning, Kelly, scenarier | 1 A4-logik, ur befintliga motorlager |
| Grundarens hands-on | ja — manuell nivå | nej — deterministiska regler |
| Djup per variabel | fullt | motiveringar ur akm1-cachen + malltext |
| Omfattning | 1 bolag i taget, on-demand | hela universet varje körning |
| Vågdata | kompletta AK1TS 5×5×4 | fvag-aggregat (ofta "osatt") + prisvågläge saknas i MVP |
| Konfluens | ingår i helhetsbedömning | ej mätt i MVP, snapshot i steg 2 |

Positionering: det automatiska biblioteket är ett FORSKNINGSUNDERLAG och en
prioriteringsmaskin ("vilka bolager förtjänar grundarens 99 sidor först?"),
aldrig en substitutprodukt. Etiketten i §2.2 (`etikett`-fältet) ska synas på
varje detaljsida och varje bloggpost ska innehålla meningen "detta är en
automatiskt genererad forskningsöversikt; den fullständiga AK1A-analysen
tillverkas manuellt". Detta skyddar både varumärket ("99 sidor"-löftet) och
juridiken (lagen 2007:528 — pedagogisk forskning, aldrig rådgivning).

---

## 4. Prioriterad plan

STEG 1 — MVP (ca 1 bygg-session): kandidatregeln i `src/lib/analysfabrik.ts`
(läs korstabell → filtrera → ranka), genereringsskript `verktyg/kor-analyser.mjs`
(skriv 22 json-filer), `/forskningsbiblioteket` + `/forskningsbiblioteket/
[ticker]`, korslänk från /analyser. Utan blogg, utan konfluens. Verifiering:
22 filer, 5 svenska, INDU-C.ST varningstext, namnkontroll INDU-C.ST/INVE-B.ST.

STEG 2 — förädling: (a) konfluens-snapshot per kandidat via /api/konfluens
(10-i-rutschkana, max 3 körningar) sparad i analys-jsonen med mätDatum +
åldersvarning; (b) falsifierings- och riskmallarna breddas per bransch;
(c) blogggeneratorn (§2.4) + första 2 posterna (NP3, TRUE-B.ST — ärliga,
icke-hypade bolag med datakundkultur); (d) sitemap/JSON-LD för detaljsidorna;
(e) ev. skärpning av kandidatregeln med konfluens ≥ 70 (styrelsebeslut).

STEG 3 — automation: cron `/api/cron/analysfabrik` (mönster:
portfolj-uppfoljning) som vid ny korstabellleverans (P6 omkörning)
omgenererar biblioteket, diffar urvalet (in/ut-trädare loggas i
data/rapporter/analysfabrik-{datum}.md), queuear max 1 ny bloggpost till
admin-godkännande (data/blogg får ALDRIG fyllas obevakat — publicering =
redaktionell handling), och flaggar falsifieringsvillkor som TRIGGATS
(följesedeln: "V09 bröts hos X i senaste mätning").

---

## 5. Konkreta filändringar (bygglista för main)

STEG 1 (MVP):
- NY `src/lib/analysfabrik.ts` — lasAnalyser/getAnalys/kandidatregeln/rankning
  (server-side fs-läsning, tolerant normalisering, mönster korstabell-data.ts)
- NY `verktyg/kor-analyser.mjs` — generatorn: korstabell + akm1-cache +
  fvag-cache → data/analyser/{T}.json (sanerade filnamn, schema analysfabrik-v1)
- NY katalog `data/analyser/` (+ 22 genererade filer — körs av skriptet)
- NY `src/app/forskningsbiblioteket/page.tsx` (lista, force-static, metadata)
- NY `src/app/forskningsbiblioteket/[ticker]/page.tsx` (detalj, generateStaticParams,
  JSON-LD, falsifieringssektion)
- ÄNDRA `src/app/analyser/page.tsx` — en rads hänvisning + länk till
  /forskningsbiblioteket
- ÄNDRA `src/app/sitemap.ts` — inkludera nya rutter

STEG 2:
- NY `verktyg/kor-konfluens-snapshot.mjs` (eller utöka kor-analyser.mjs) —
  fyller `konfluens`-fältet via lokalt anrop mot /api/konfluens
- NY `verktyg/kor-analysblogg.mjs` + NYA `data/blogg/analys-{namn}-{ar}.json`
- ÄNDRA analysfabrik.ts — konfluensfält i typer + åldersvarning; ev. regel v2
- ÄNDRA detaljsidan — konfluensblock
- ÄNDRA `src/lib/content.ts` — INGET (blogglistan är redan generisk)
- ÄNDRA `src/app/analyser/[ticker]/page.tsx` — om premiumanalys finns för
  ticker som också finns i biblioteket: korslänka

STEG 3:
- NY `src/app/api/cron/analysfabrik/route.ts` (mönster: portfolj-uppfoljning)
- NY `data/rapporter/analysfabrik-{datum}.md` (diff-loggar, genereras)
- ÄNDRA adminflödet — blogg-kö för godkännande (befintlig admin-struktur)

Dokumentation: ÄNDRA `FOLDER_STRUCTURE.md` och `data/forskning/PROTOKOLL.md`
med nya sökvägar + kandidatregeln (kanoniskt tröskeldokument).

---

## 6. Risker och styrelsebeslut

1. NAMNKOLLISIONEN data/analyses vs data/analyser — hög förvirringsrisk för
   framtida agenter. Beslut krävs; rekommendation ovan (behåll, dokumentera).
2. INDU-C.ST bär namnet "AB Industrivärden" i korstabellen men beskrivs som
   "Indutrade" i manifestets branschmotivering — verifiera innan första
   publiceringen av just detta bolag (det är samtidigt toppkandidat).
3. Konfluens är live-Yahoo och max 10 tickers — beroende av extern källa;
   aldrig grindvillkor förrän snapshot-lagret finns (steg 2).
4. Bloggautomatik kan spamma data/blogg — publicering hålls manuell i steg 3
   (admin-godkännande) för att skydda SEO-kvaliteten och översättningskön.
5. osatt-tunga analyser (fvagPerHorisont nästan alltid osatt) gör att
   "vågläge"-sektionen kan kännas tom — det är DATANS sanning; textmallen
   ska förklara varför (balansräknings-/seriedata saknas, se manifest).
6. Juridik: allt förblir pedagogisk forskning — disclaimer på varje sida,
   post och json; inga köp-/säljord i genererade texter (mallgranskning).

— Slut på rådet. Committa inget; main bygger direkt från §5 när styrelsen
godkänt §2.1-trösklarna och §6.1-namnbeslutet.
