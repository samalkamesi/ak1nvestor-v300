# Granskning v151 — SEO-guide: aktieanalys-steg-for-steg

- **Objekt:** `data/blogg-utkast/aktieanalys-steg-for-steg.json` (SEO-guiderna våg 95, #5 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v151), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar; utkast-JSON:en är orörd.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/aktieanalys-steg-for-steg.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §5

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `aktieanalys-steg-for-steg`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 49) | 49 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 149) | 149 tkn — stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 817) | 817 ord (rå räkning) — exakt specens tal | ✅ |
| readingMinutes 1 | 1 (grundens formel: 817 ord ÷ 600 → 1) | ✅ |
| Pillar / Author | Institutionell metodik / AK1A Research Lab — pillar är en av de 6 befintliga bland de 55 publicerade posterna | ✅ |
| Tags | aktieanalys, fundamentalanalys, nyckeltal, metodik, checklista — exakt specens lista | ✅ |
| Primärt sökord i H1 + ingress + H2 | title "Aktieanalys steg för steg: …", ingressens första mening "Aktieanalys steg för steg ser i grunden likadan ut…", H2 "De sju stegen — aktieanalys steg för steg" | ✅ |
| Sekundära naturligt (2–4) | nyckeltal ✓ (flera träffar), värdering ✓ ("Värderingen", "värderas mot"), fundamental i delad form "fundamental aktieanalys" (länktext) | ✅ (se fynd 2) |
| Body ordagrant enligt spec | normaliserad diff spec↔JSON: IDENTISK inklusive disclaimer (5 780 + 58 tkn) | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |
| Strukturgrind (kontrolleratextRad-port) | body 5 838 tkn (≥ 800), 6 st "## "-rubriker (≥ 2) | ✅ |

## 2. FAKTA — aritmetik och metodpåståenden (alla gröna)

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| ROE: nettoresultat 36 Mkr ÷ eget kapital 200 Mkr = 18 % | 36 ÷ 200 = 0,18 — korrekt | ✅ |
| P/E: kurs 96 ÷ vinst per aktie 6,00 = 16 | 96 ÷ 6 = 16 — korrekt | ✅ |
| Intern konsistens EPS: 36 Mkr ÷ 6,00 kr/aktie = 6,0 M aktier (heltal); P/E × EPS = 16 × 6 = 96 = kursen | heltal, kedjan stämmer utan remainder | ✅ |
| Multipel-läget: P/E 16 mot historia 14 och branschmedian 18 — "under branschen men över sin egen norm" | 16 < 18 och 16 > 14 — tolkningen korrekt åt båda hållen | ✅ |
| AKM1: "varje variabel poängsätts 0–5" och "alla 20 variablerna" | verifierat mot kursdata (deep-courses.json, akm1-den-kontroversiella-modellen): "20 variabler i sju kategorier, 0–5 poäng per variabel, maximalt 100 poäng" | ✅ |
| Årsredovisningens läsordning: förvaltningsberättelsen → resultaträkningen → balansräkningen → kassaflödesanalysen → noterna | korrekt svensk praxis | ✅ |
| "En pumpmakare är cyklisk; en programvaruleverantör är det mindre" | korrekt metodpåstående med rätt nyansering | ✅ |
| Vallgravstyper (eftermarknad, varumärke, nätverkseffekter, kostnadsfördelar) | korrekt uppräkning, var och en länkad till sin kurs | ✅ |

## 3. LÄNKAR — 9/9 levande (200)

| Länk | Status | Källa finns |
|---|---|---|
| `/kurser/v14-varumarke` | 200 | deep-courses.json ✓ (333 kurser) |
| `/kurser/v15-natverkseffekter` | 200 | deep-courses.json ✓ |
| `/blogg/sa-laser-du-en-svensk-arsredovisning` | 200 | data/blogg/ (1 av 55) ✓ |
| `/kurser/km-002-forvaltningsberattelsen` | 200 | deep-courses.json ✓ |
| `/blogg/hur-raknar-man-roe` | 200 | data/blogg/ ✓ |
| `/kurser/rk-02-emissionrisk` | 200 | deep-courses.json ✓ |
| `/kurser/akm1-den-kontroversiella-modellen` | 200 | deep-courses.json ✓ |
| `/blogg/hur-gor-man-en-snabb-fundamental-aktieanalys` | 200 | data/blogg/ ✓ |
| `/blogg/komplett-guide-svensk-aktieanalys-2026` | 200 | data/blogg/ ✓ |

Korslänksregeln (specen: endast publicerade kurser/poster, inga utkast-till-utkast)
är uppfylld — inga länkar pekar på de andra sju utkasten.

**Driftnot (se fynd 1):** första mätomgången gav 8 × 404 (alla utom AKM1-kursen)
— artefakt av pm2-omstart/deploy som avslutades 18:10 (samma deploy som
dokumenterad i hur-fungerar-aktier-granskningen fynd 2). Återmätning + full loop
över samtliga 55 publicerade bloggposter: 9/9 = 200, 0 fel. Inga döda länkar
finns i utkastet.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** kontrolleraText-portad mot `data/varumarke.json`
  (samma regexer, flaggor "giu", samtliga 26 förbjudna fraser mot
  title+ingress+body): **0 FEL, 0 VARNING**.
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — exakt den form majoriteten av de 55 befintliga posterna
  bär, och den är räknad in i body-identiteten mot specen.
- **Inga råd:** regex-svep efter köp/sälj/undvik/rekommenderar+i aktiesammanhang:
  0 träffar. Texten handlar hela vägen om metoden ("Så räknar du", "Läs
  årsredovisningen i ordning"); exempelbolaget är deklarerat påhittat, och
  multipel-dröjsmålet (16 mot 14/18) redovisas som tolkningsfråga, inte som
  handlingsrekommendation.
- **Ina lagrum** förekommer i texten → inga blandade lagrum är möjliga.
- AKM1-poängsättningen beskrivs som struktur ("tvingar fram ett 'varför'"),
  aldrig som signal — kurskällan bekräftar själv "aldrig ett köpsignal i sig".

## 5. SPRÅK — grönt

Svenska, rak och varm ton, Du-form genomgående, jämn stil med de 55 publicerade
posterna. Inga tonala anmärkningar från varumärkesgrinden.

## Fyndlista

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | INFO (drift, ej utkastfel) | 8 × 404 under första länkmätningen orsakade av pm2-uppvärmning efter deploy 18:10; återmätning 9/9 = 200 och full loop 55/55 bloggposter = 0 fel | Ingen i utkastet; noteras för att framtida granskare inte larmas av samma artefakt |
| 2 | LÅG (observation) | Sekundärt sökord "fundamentalanalys" förekommer inte som sammansatt ord i body, endast i delad form ("fundamental aktieanalys", länktext) och som tag — specens krav "2–4 sekundära naturligt" uppfylls ändå av nyckeltal + värdering + fundamental i böjd form | Ingen — böjd form är naturlig placering; tvångsrättning vore onaturlig |
| 3 | LÅG (observation) | "Två divisioner, och lönsamheten och värderingen ligger redan på bordet" — ROE och P/E är exakt två divisioner; korrekt, men läsaren räknar själv ut att 36/200 och 96/6 är de två | Ingen — pedagogiken håller |
| 4 | INFO (drift, ej utkastfel) | Commit blockerades en gång av kvalitetsgrinden: `npx tsc` träffade registrets dummy-paket ("This is not the tsc command you are looking for") därför att `node_modules/.bin` tillfälligt saknades — en prod-synkdeploy (flock + `npm ci && npm run build`, start 18:17) höll på att bygga om node_modules. Commit väntades in tills deployen var klar och projektets TS 5.9.3 fanns på plats igen; grinden kördes sedan oförändrad och grönt (0 typfel, baslinjen hålls) | Ingen i utkastet; noteras så att framtida fabriksagenter under pågående deploy väntar ut låset i stället för att söka workaround |

**HÖG: 0 · MEDEL: 0 · LÅG: 2 · INFO: 2**

## Diff-rapport

Ingen — 0 rättningar gjordes; `data/blogg-utkast/aktieanalys-steg-for-steg.json`
är byte-identisk med granskat tillstånd och den body som specen förordar.

LEVERANS: aktieanalys-steg-for-steg bedömning=FLYTTKLAR fynd=3 rättningar=0
