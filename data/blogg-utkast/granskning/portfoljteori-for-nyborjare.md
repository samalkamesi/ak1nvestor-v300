# Granskning m9 — SEO-guide: portfoljteori-for-nyborjare

- **Objekt:** `data/blogg-utkast/portfoljteori-for-nyborjare.json` (SEO-guiderna våg 95, #3 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång m9), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar; utkast-JSON:en är orörd.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/portfoljteori-for-nyborjare.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §3

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `portfoljteori-for-nyborjare`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 59) | 59 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 152) | 152 tkn — stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 805) | 805 ord (whitespace-räkning, systemets eget metric — se fynd 2) — exakt specens tal | ✅ |
| readingMinutes 1 | 1 (grundens formel: 805 ord ÷ 600 → 1) | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab — exakt specen | ✅ |
| Tags | portföljteori, modern portföljteori, risk, korrelation, portfölj — exakt specens lista | ✅ |
| Strukturgrind (kontrolleratextRad-port) | body 5 354 tkn (≥ 800), 5 st "## "-rubriker (≥ 2) | ✅ |
| Primärt sökord i H1 + ingress + 1 H2 | title "Portföljteori för nybörjare — …" (H1), ingressens första mening "Portföljteori är idén att …", H2 "Portföljteori i siffror — korrelationens effekt" | ✅ |
| Sekundära naturligt (2–4) | korrelation ✓ (återkommande), standardavvikelse ✓ (två träffar); "modern portföljteori" endast i OG-description + tagg — se fynd 1 | ✅ |
| Body ordagrant enligt spec | normaliserad diff spec↔JSON: IDENTISK (5 335 tkn) | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |

## 2. FAKTA — portföljteori: aritmetik och riskmått (8/8 gröna)

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| Markowitz formaliserade portföljteorin 1952 | "Portfolio Selection", Journal of Finance 1952 — korrekt år och tillskrivning | ✅ |
| Förväntad avkastning = viktat medel: 0,7 × 8 + 0,3 × 3 = 6,5 % | 5,6 + 0,9 = 6,5 % — korrekt | ✅ |
| σ = 15 %, förväntad 8 % → "majoriteten av sina år mellan −7 och +23 procent" | 8 − 15 = −7; 8 + 15 = +23; normalfördelningen ger ~68 % inom ±1σ = majoritet — och texten qualifierar själv med feta svansar | ✅ |
| Två tillgångar σ = 20 %, v = 0,5/0,5, r = +1 → portföljrisken "exakt 20 procent" | √(0,25·400 + 0,25·400 + 2·0,5·0,5·1·400) = √400 = 20,0 — exakt | ✅ |
| r = 0 → "20 × √0,5 ≈ 14 procent", "cirka 30 procent mindre svängningar" | √200 = 14,14; (20 − 14,14) ÷ 20 = 29,3 % ≈ 30 — korrekt | ✅ |
| r = −1 → "svängningarna kan till och med ta ut varandra" | vid lika σ och vikter blir σ_p = √(100+100−200) = 0; formuleringen "kan" är korrekt försiktig | ✅ |
| Två-tillgångsformeln: varians = v₁²σ₁² + v₂²σ₂² + 2·v₁·v₂·r·σ₁·σ₂ | korrekt standardformel; variabeldefinitionerna (v, σ, r) korrekta | ✅ |
| "med tjugo innehav är de 190 stycken" (korrelationstermer) | antal par = n(n−1)/2 = 20·19/2 = 190 — korrekt | ✅ |
| Övrigt: effektiv fronten (max förväntad avkastning per risknivå), CAPM via beta, korrelationer söker sig mot +1 i kriser, normalfördelningen underskattar extrema dagar, vardagsexemplet 60+25+15 = 100 | samtliga etablerade och korrekt formulerade portföljteori-påståenden med rätt förbehåll | ✅ |

## 3. LÄNKAR — 4/4 levande (200)

| Länk | Status | Källa finns |
|---|---|---|
| `/kurser/km-014-korrelation-diversifiering` | 200 | deep-courses.json ✓ (333 kurser) |
| `/kurser/km-015-beta-capm` | 200 | deep-courses.json ✓ |
| `/kurser/pf-01-portfoljbyggande` | 200 | deep-courses.json ✓ |
| `/kurser/pf-03-diversifiering` | 200 | deep-courses.json ✓ |

Korslänksregeln (specen: endast publicerade kurser/poster, inga
utkast-till-utkast) är uppfylld — guiden länkar enbart till de fyra kurserna,
ingen länk pekar på de andra sju utkasten eller obeﬁntliga bloggposter.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** kontrolleraText-portad mot `data/varumarke.json` (samma
  regexer, flaggor "giu", körd på title + description + body): **0 FEL,
  0 VARNINGAR**.
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — teckenidentisk med publicerade poster (jämförd med
  `data/blogg/5-vanliga-nyborjarmisstag-svenska-aktier.json`) och uppfyller
  gründens negerade-form-krav.
- **Inga råd:** texten beskriver teori och mekanik ("Så räknar du fallet med två
  tillgångar"); exempelsammansättningen 60/25/15 avfokuseras explicit ("Poängen
  är inte exakten — den är riktningen"), och fronten-avsnittet betonar att
  teorin "säger inte vilken punkt på fronten du ska välja" och att "ingen
  formel kan göra den åt dig". Ingen imperativ köp-/bygg-formulering finns.
- **Inga lagrum** förekommer i texten → inga blandade lagrum är möjliga.
- Fördelningsförbehållet ("Det är en förenkling — verkliga fördelningar har
  feta svansar") finns på plats vid riskmåttet — bra.

## 5. SPRÅK — grönt

Svenska, rak och varm ton, jämn stil med de publicerade posterna. Inga tonala
anmärkningar från varumärkesgrinden. Terminologin (bärpelare, effektiv fronten,
feta svansar, karta inte territorium) förklaras vid första användning.

## Fyndlista

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | LÅG (observation) | Sekundära sökordet "modern portföljteori" (listat i specen) förekommer inte i bodyn — endast i OG-description och som tagg. Kravet "2–4 sekundära naturligt" är dock uppfyllt via korrelation och standardavvikelse i bodyn; sökordet bär dessutom SEO-yta i metadata + tagg | Ingen — kravet uppfyllt, tvångsinsprängning vore onaturlig |
| 2 | INFO (metodnot) | Specens "805 ord" gäller whitespace-räkning (samma metric som kontrolleratextRad/readingMinutes); strikt alfanumerisk räkning ger 757. Systemets eget metric är det bindande | Ingen |

**HÖG: 0 · MEDEL: 0 · LÅG: 1 · INFO: 1**

## Diff-rapport

Ingen — 0 rättningar gjordes; `data/blogg-utkast/portfoljteori-for-nyborjare.json`
är byte-identisk med granskat tillstånd och den body som specen förordagar.

LEVERANS: portfoljteori-for-nyborjare bedömning=FLYTTKLAR fynd=2 rättningar=0
