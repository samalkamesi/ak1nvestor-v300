# Granskning v151 — SEO-guide: hur-fungerar-aktier

- **Objekt:** `data/blogg-utkast/hur-fungerar-aktier.json` (SEO-guiderna våg 95, #1 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v151), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar; utkast-JSON:en är orörd.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/hur-fungerar-aktier.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §1

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `hur-fungerar-aktier`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 51) | 51 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 154) | 154 tkn — stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 928) | 928 ord (rå räkning) — exakt specens tal | ✅ |
| readingMinutes 2 | 2 (grundens formel: 958 ord inkl. titel+ingress ÷ 600 → 2) | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab | ✅ |
| Tags | aktier, börsen, nybörjare, utdelning, kursbildning — exakt specens lista | ✅ |
| Strukturgrind (kontrolleratextRad-port) | body 5 880 tkn (≥ 800), 6 st "## "-rubriker (≥ 2) | ✅ |
| Primärt sökord i H1 + ingress + H2 | title "Hur fungerar aktier? …", första meningen "Hur fungerar aktier? Kort svar:…", H2 "Hur fungerar aktier i praktiken — ett räkneexempel" | ✅ |
| Sekundära naturligt (2–4) | börsen ✓, utdelning ✓, direktavkastning ✓, "vad är en aktie" i böjd form (H2 "Vad en aktie egentligen är") — naturlig placering | ✅ (se fynd 3) |
| Body ordagrant enligt spec | normaliserad diff spec↔JSON: IDENTISK (5 860 tkn) | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |

## 2. FAKTA — aritmetik och mekanik (9/9 gröna)

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| 100 aktier × 50 kr = 5 000 kr insats | 100 × 50 = 5 000 | ✅ |
| Utdelning 2,50 kr/aktie → 250 kr | 2,50 × 100 = 250 | ✅ |
| Direktavkastning 5 % | 250 ÷ 5 000 = 5 % (också 2,50 ÷ 50 = 5 % — båda vägarna som texten visar) | ✅ |
| Slutkurs 54 kr → posten 5 400 kr | 54 × 100 = 5 400 | ✅ |
| Totalavkastning (5 400 − 5 000 + 250) ÷ 5 000 = 13 % | 650 ÷ 5 000 = 13,0 % | ✅ |
| 8 pp kurs + 5 pp utdelning | (54 − 50) ÷ 50 = 8 %; 8 + 5 = 13 | ✅ |
| Tio av tusen aktier = 1 % av bolaget | 10 ÷ 1 000 = 1 % | ✅ |
| Orderboken: bud = köpkurser, lösen = säljkurser, bästa bud = högsta köp, bästa lösen = lägsta sälj, spread = gapet, kontinuerlig matchning | korrekt börsterminologi och mekanik | ✅ |
| A/B-aktier: A bär fler röster (ofta 10×), utdelning i princip lika per aktie; Investor och H&M som exempel på grundarfamiljekontroll | korrekt med rätt förbehåll ("ofta", "i princip") | ✅ |
| Övrigt: börsvärde = kurs × antal aktier; nyemission = enda vägen nya pengar går till bolaget; kurs = senaste pris, inte beräknat värde | korrekt | ✅ |

## 3. LÄNKAR — 5/5 levande (200)

| Länk | Status | Källa finns |
|---|---|---|
| `/kurser/portfolj-ekosystemet` (×2 i bodyn) | 200 | deep-courses.json ✓ |
| `/kurser/pf-12-arsrapportering` | 200 | deep-courses.json ✓ |
| `/kurser/pf-08-isk-vs-aktiedepa` | 200 | deep-courses.json ✓ |
| `/kurser/ud-06-svenska-utdelningsaktier` | 200 | deep-courses.json ✓ |
| `/blogg/5-vanliga-nyborjarmisstag-svenska-aktier` | 200 | data/blogg/ (1 av 55) ✓ |

Korslänksregeln (specen: endast publicerade kurser/poster, inga utkast-till-utkast) är
uppfylld — inga länkar pekar på de andra sju utkasten.

**Driftnot (se fynd 2):** första mätomgången gav 2 × 404 (pf-08 + bloggposten) — det
visade sig vara en artefakt av en pm2-omstart/deploy som pågick samtidigt (byggtid
18:09, pm2-upp 8 s vid mättillfället). Återmätning efter omstarten + full loop över
alla 55 bloggposter: 0 fel. Inga döda länkar finns i utkastet.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** kontrolleraText-portad mot `data/varumarke.json` (samma
  regexer, flaggor "giu", titel+ingress+body): **0 FEL, 0 träffar** (inte ens VARNING).
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — exakt den form 40 av 55 befintliga poster bär (majoritetsformen
  som specens "identisk med befintliga poster" syftar på).
- **Inga råd:** texten beskriver mekanik ("så räknar du", "så bildar börsen en kurs");
  Investor och H&M nämns som exempel på röststruktur, aldrig som köpobjekt.
- **Inga lagrum** förekommer i texten → inga blandade lagrum är möjliga.
- Förbehållet "Vi räknar utan courtage och skatt" finns vid räkneexemplet — bra.

## 5. SPRÅK — grönt

Svenska, rak och varm ton, jämn stil med de 55 publicerade posterna. Inga tonala
anmärkningar från varumärkesgrinden.

## Fyndlista

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | LÅG (observation) | "en procent av den vinst bolaget redovisar" — strikt äger man 1 % av utdelningen (vinsten kan återinvesteras); men nästa stycke hanterar just detta ("beslutet fattas år för år") och ägande av orörd vinst är ändå korrekt aktieägar-teoretiskt | Ingen — pedagogiken håller, tvångsrättning vore värre |
| 2 | INFO (drift, ej utkastfel) | 2 × 404 under första länkmätningen orsakade av samtidig pm2-omstart/deploy; återmätning 5/5 = 200 | Ingen i utkastet; noteras för att framtida granskare inte larmas av samma artefakt |
| 3 | LÅG (observation) | Sekundärt sökord "vad är en aktie" förekommer endast i böjd form ("Vad en aktie egentligen är", H2) — specens krav är "naturligt", vilket böjd form uppfyller | Ingen |

**HÖG: 0 · MEDEL: 0 · LÅG: 2 · INFO: 1**

## Diff-rapport

Ingen — 0 rättningar gjordes; `data/blogg-utkast/hur-fungerar-aktier.json` är
byte-identisk med granskat tillstånd och den body som specen förordagar.

LEVERANS: hur-fungerar-aktier bedömning=FLYTTKLAR fynd=4 rättningar=0
