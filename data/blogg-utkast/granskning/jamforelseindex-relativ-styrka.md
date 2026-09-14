# Granskning: jamforelseindex-relativ-styrka (m9)

- **Uppdrag:** SEO-guideutkast mot spec i `data/forskning/SEO-GUIDER-2026-09.md` (guide #8 av 8, våg 95)
- **Fil:** `data/blogg-utkast/jamforelseindex-relativ-styrka.json`
- **Datum:** 2026-09-14 · **Granskare:** agentfabriks-barn (uppdrag jamforelseindex-relativ-styrka)
- **BEDÖMNING: FLYTTKLAR EFTER RÄTTNING** — 2 fynd, 1 rättning (LÅGT), 0 MEDEL/HÖGT i guide­materialet
- **Publicering = kundens beslut (R2): utkastet har INTE flyttats till data/blogg/.**

## 1. SPEC — GODKÄND

| Krav | Mål | Faktiskt | Status |
|---|---|---|---|
| Slug | `jamforelseindex-relativ-styrka` | samma | ✅ |
| Ord i body | 810 (mål 800–1400) | 810 före granskning, 817 efter rättning | ✅ |
| Title | ≤ 60 tkn | 58 tkn | ✅ |
| OG-beskrivning | ≤ 155 tkn | 154 tkn | ✅ |
| Primärt sökord | "jämförelseindex" i H1 + ingress + 1 H2 | Titel (H1) ✓, ingress rad 1 ✓, två H2:ar ✓ (11 förekomster totalt) | ✅ |
| Sekundära sökord | 2–4 naturligt | "relativ styrka" ×2, "OMX Stockholm" ×3; "benchmark" saknades → **rättat**, nu ×1 | ✅ efter rättning |
| Pillar / Author | Institutionell metodik / AK1A Research Lab | samma | ✅ |
| Tags | jämförelseindex, relativ styrka, teknisk analys, benchmark, OMX | identiska 5 | ✅ |
| publishedAt / readingMinutes | 2026-09-09 / 1 | samma | ✅ |
| Struktur | BlogPost exakt | alla fält närvarande, giltig JSON | ✅ |
| Disclaimer-sista-rad | identisk med publicerade poster | "_Detta är pedagogisk finansanalys, inte investeringsråd._" = formen i t.ex. `5-vanliga-nyborjarmisstag-svenska-aktier.json` | ✅ |
| Spec-body vs JSON | "ordagrant" | byte-identisk före granskning (programverifierad diff = true) | ✅ |

## 2. FAKTA — GODKÄND

Aritmetiken rad för rad (programverifierad):

- RS start: 100 ÷ 1 000 = **0,100** ✅
- RS efter ett år: 108 ÷ 1 120 = **0,0964 ≈ 0,096** ✅ (avrundningen rätt)
- Aktien +8 % (100→108) och börsen +12 % (1 000→1 120) → underprestation **4 procentenheter** ✅ ("procentenheter" korrekt anvagt — det är skillnad mellan två avkastningsprocent)
- RS-mekaniken: aktiekurs ÷ jämförelseindex, normaliserad startpunkt — korrekt beskriven; linjen faller trots stigande aktie ✅
- OMX Stockholm All-Share (OMXSPI) "samlar i princip alla svenska listade bolag" ✅
- OMXS30 "de trettio största": verifierad mot Nasdaq (beskriver själva indexet som "the 30 largest capitalized shares"; urvalsreglerna omsättningsbaserade med free float) — korrekt nog, **orörd** (se fynd F2/INFO)
- Prisindex vs totalavkastningsindex: "prisindex räknar bort utdelningarna" + praktexemplet med utdelningsbolag ✅
- Sharpe-kvoten "lägger risken i nämnaren" (avkastning ÷ standardavvikelse) ✅
- "den starka blir starkare" redovisas som observation/tes, inte påstående ✅

## 3. LÄNKAR — DATAKORREKTA; HTTP-KONTROLL BLOCKERAD AV SAJTBRETT FEL (ESKALERAS)

Fem unika interna länkar, samtliga till kurser (inga länkar till andra utkast ✅ — partiell publicering skapar inga 404:or):

| Väg | Finns i public/deep-courses.json | HTTP localhost:3000 | HTTP prod |
|---|---|---|---|
| /kurser/km-016-sharpe-kvot | ✅ | 500 | 500 |
| /kurser/teknisk-analys-med-johnny-torssell | ✅ | 500 | 500 |
| /kurser/ts-08-volymanalys | ✅ | 500 | 500 |
| /kurser/ts-23-volume-spread-analysis-vsa | ✅ | 500 | 500 |
| /kurser/intermarket-analysis | ✅ | 500 | 500 |

500-svaren är **INTE döda länkar**: redan publicerade sidor som `/kurser/km-009-pe` och `/blogg/vad-ar-ev-ebitda` svarar också 500, medan `/`, `/kurser`, `/blogg` svarar 200. pm2 `ak1a` visar ↺ 1 188 omstarter; felloggen: `InvariantError: The client reference manifest for route "/_not-found" does not exist` + `NoFallbackError` — `.next`-bygget är korrupt/ofullständigt. **Drifteskalering: nybygge krävs under `/tmp/ak1a-deploy.lock` när RAM tillåter (94 % vid granskningstillfället — barnagenten startade INTE bygge).** Guidens länkar bedöms 0 döda i data; guiden blockeras inte av felet (det drabbar hela sajten lika).

## 4. JURISTEN — GODKÄND

- Varumärkesgrindens samtliga 26 förbjudna fraser (samma regexer som `kontrolleraText`, `data/varumarke.json`) mot titel+beskrivning+body: **0 FEL, 0 VARNING** ✅
- Disclaimer sist, negerad form ✅
- Inga lagrum i texten → inga blandade lagrum möjliga ✅
- Alla imperativ är metodiska ("så räknar du", "kontrollera vilket index din kurva bygger på"), inga råd om enskilda aktier — ingen enda namngiven aktie förekommer ✅

## 5. SPRÅK — GODKÄND

Svenska, rak pedagogisk ton, konsekvent terminologi; talstreck och decimaler i svensk convention (0,100/0,096) ✅

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| F1 | LÅGT | Sekundärsökordet "benchmark" (deklarerat i spec + tag) förekom 0 gånger i bodyn — svag SEO/praxis (tagg utan stöd i text) | **Rättat** (se diff) |
| F2 | INFO | OMXS30 "de trettio största" — Nasdaq använder själva "largest capitalized"; urvalsreglerna är omsättningsbaserade. Förenklingen är försvarbar och hänger ihop med guidens egen "Fel index"-punkt (OMXS30 = storbolag) | Orörd (korrekt nog) |
| D1 | **HÖGT (DRIFT, ej guide)** | Prod: 500 på ALLA detaljesidor (kurser + bloggposter) pga korrupt `.next`; pm2 ↺ 1 188; RAM 94 % | **Eskalerad till huvudagent/styrelserond** — nybygge under flock-lås när RAM frigjorts |

## Diff-rapport (1 rättning, enbart utkast-JSON)

```diff
--- body (före)
+++ body (efter)
 ## Vad ett jämförelseindex är
 
-Ett index representerar "marknaden": OMX Stockholm All-Share samlar i princip
+Ett index — på fackspråk ofta kallat benchmark — representerar "marknaden": OMX Stockholm All-Share samlar i princip
 alla svenska listade bolag, OMXS30 de trettio största på Stockholmsbörsen.
```

- Ordantal 810 → 817 (mål 800–1400 ✅). Efter rättning: giltig JSON ✅, varumärkesgrind fortfarande 0/0 ✅, disclaimer fortfarande sista rad ✅.
- Inga andra ändringar i utkastet. Spec-filen `SEO-GUIDER-2026-09.md` är orörd (ägs av huvudagenten).

## Slutsats

**FLYTTKLAR EFTER RÄTTNING.** Ett LÅGT SEO-fynd rättat; fakta, aritmetik, juridik, struktur och språk gröna. Drifteskalering D1 löper parallellt och berör inte guidens kvalitet. Beslut om flytt till `data/blogg/` = kundens (R2).
