# Granskning v151 — SEO-guide: pe-talet-sa-raknar-du-och-tolkar

- **Objekt:** `data/blogg-utkast/pe-talet-sa-raknar-du-och-tolkar.json` (SEO-guiderna våg 95, #2 av 8, status UTKAST)
- **Granskare:** granskningsagent (agentfabriksomgång v151), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar; utkast-JSON:en är orörd.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` (live-mappen). "Flyttklar" betyder: innehållet håller för export
som `data/blogg/pe-talet-sa-raknar-du-och-tolkar.json` när kunden beslutar.

---

## 1. SPEC — kontroll mot SEO-GUIDER-2026-09.md §2

| Krav (specen) | Faktiskt värde | Utfall |
|---|---|---|
| Form: exakt BlogPost (9 fält) | slug, title, description, pillar, author, publishedAt, readingMinutes, tags, body — exakt 9, inga extra | ✅ |
| Slug `pe-talet-sa-raknar-du-och-tolkar`, ^[a-z0-9-]+$ | matchar | ✅ |
| Title ≤ 60 tkn (spec: 52) | 52 tkn — stämmer med specen | ✅ |
| OG-description ≤ 155 tkn (spec: 155) | 155 tkn — exakt på taket, inom gränsen, stämmer med specen | ✅ |
| Ord i body 800–1 400 (spec: 859) | 859 ord (rå räkning) — exakt specens tal | ✅ |
| readingMinutes 1 | 1 (grundens formel: 890 ord inkl. titel+ingress ÷ 600 → 1) | ✅ |
| Pillar / Author | Grunderna / AK1A Research Lab | ✅ |
| Tags | P/E, nyckeltal, värdering, multipel, fundamentalanalys — exakt specens lista | ✅ |
| Strukturgrind (kontrolleratextRad-port) | body 5 473 tkn (≥ 800), 6 st "## "-rubriker (≥ 2) | ✅ |
| Primärt sökord i H1 + ingress + H2 | title "P/E-talet: så räknar du…", första meningen "P/E-talet — pris per vinst — är…", H2 "Formeln — vad P/E-talet mäter" | ✅ |
| Sekundära naturligt (2–4) | vinst per aktie ✓ (flera naturliga platser), trailing/forward ✓ (H2 "Trailing eller forward" + ingressen), "värderingsmultipel" endast i delar ("värderas", "multipel" separat) — se fynd 1 | ✅ (med observation) |
| Body ordagrant enligt spec | normaliserad diff spec↔JSON: IDENTISK (5 473 tkn) | ✅ |
| publishedAt 2026-09-09 | stämmer med specens "UTKAST v1 (2026-09-09)" | ✅ |

## 2. FAKTA — aritmetik och tolkning (8/8 gröna)

| Påstående i utkastet | Verifiering | Utfall |
|---|---|---|
| P/E = kurs ÷ EPS; 240 kr ÷ 12 kr = 20 (ingress + exempel A) | 240 ÷ 12 = 20,0 | ✅ |
| Bolag B: 150 ÷ 15 = 10 | 150 ÷ 15 = 10,0 | ✅ |
| A växer 15 %/år → "fördubblat vinsten om knappt fem år" | ln 2 ÷ ln 1,15 = 4,96 år — "knappt fem" är korrekt avrundat | ✅ |
| A:s vinst nästa år 13,8 kr | 12 × 1,15 = 13,8 | ✅ |
| Forward-P/E 240 ÷ 13,8 ≈ 17 | 240 ÷ 13,8 = 17,4 → ≈ 17 (rimlig avrundning nedåt, markeras med ≈) | ✅ |
| 1 ÷ P/E = vinstavkastning; P/E 20 ↔ 5 % | 1 ÷ 20 = 0,05 = 5 % | ✅ |
| Ränte−/multipelkoppling: högre ränta → högre kravd vinstavkastning → lägre P/E (och vice versa) | korrekt mekanik, formulerat som förklaring inte prognos | ✅ |
| Trailing = senaste 12 mån redovisat; forward = uppskattat kommande 12 mån; "24 trailing / 15 forward" som exempel | korrekt definition; exemplet är hypotetiskt och konsekvent (växande vinst → lägre forward) | ✅ |

**Tolkningsnyansering — kärnkravet "aldrig 'billig aktie = köp'":** uppfyllt aktivt.
Texten ger dubbla läsningar på varje nivå ("Lågt P/E kan betyda ett billigt bolag
ELLER ett bolag där marknaden prissatt fallande vinster"), håller "multipeln är
en fråga, inte ett svar" som genomgående princip, frågorna "B är hälften så
billigt? Endast om framtiden ser likadan ut" samt "billigt av ett skäl är inte
billigt" (cykeltoppen) och avrånder explicit från "lägsta P/E i index"-sortering.
Banker mot P/B och skuld-osynlighet hos P/E (EV/EBIT, EV/EBITDA som alternativ)
är korrekt metodik. Inga enskilda aktier nämns — A och B är abstrakta exempel.

## 3. LÄNKAR — 5/5 levande (200)

| Länk | Status | Källa finns |
|---|---|---|
| `/blogg/peg-multipeln-svagheter-2026` | 200 | data/blogg/ (live) ✓ |
| `/kurser/km-009-pe` (×2 i bodyn) | 200 | deep-courses.json ✓ |
| `/kurser/km-010-evebit` | 200 | deep-courses.json ✓ |
| `/blogg/vad-ar-ev-ebitda` | 200 | data/blogg/ (live) ✓ |
| `/kurser/km-011-relativ-vardering` | 200 | deep-courses.json ✓ |

Korslänksregeln (specen: endast publicerade kurser/poster, inga
utkast-till-utkast) är uppfylld — inga länkar pekar på de andra sju utkasten.

## 4. JURISTEN — grönt

- **Varumärkesgrind:** kontrolleraText-portad mot `data/varumarke.json` (samma
  regexer, flaggor "giu", titel+ingress+body): **0 FEL, 0 VARNING** — inte ens
  en träff. Disclaimer-raden "inte investeringsråd" är den negerade formen och
  passerar regexen exakt som avsett.
- **Disclaimer sist:** sista raden är `_Detta är pedagogisk finansanalys, inte
  investeringsråd._` — majoritetsformen bland befintliga poster, identisk med
  övriga sju utkast i våg 95.
- **Inga råd:** texten beskriver mekanik och tolkningsmetod ("så räknar du",
  "så räknar du framåt"); imperativen ("Kontrollera jämförelsestörande poster",
  "Jämför genom cykeln") är metodinstruktioner i utbildningsform, aldrig
  handlingsråd om enskilda aktier.
- **Inga lagrum** förekommer i texten → inga blandade lagrum är möjliga.

## 5. SPRÅK — grönt

Svenska, rak och saklig ton, jämn stil med de publicerade posterna. Terminologin
(EPS, trailing/forward, earnings yield, multipel) införs med förklaring vid
första användning — rätt nivå för pillar "Grunderna".

## Fyndlista

| # | Allvarlighetsgrad | Fynd | Åtgärd |
|---|---|---|---|
| 1 | LÅG (observation) | Sekundärt sökord "värderingsmultipel" förekommer endast i delar ("värderas ofta hellre…", "multipel"/"multipeln" separat) — specens krav är "naturligt", och sammansättningen vore tung i löptexten; ämnesorden värdering + multipel är båda täckta | Ingen — tvångsinpassning av sammansättningen vore värre för läsbarheten |
| 2 | LÅG (observation) | "B är hälften så billigt?" — strikt vore "hälften så dyrt" eller "halva multipeln"; konstruktionen "hälften så billig" (= halva priset) är etablerad vardagssvenska och meningen är en retorisk fråga som direkt nyanseras ("Endast om framtiden ser likadan ut") | Ingen — pedagogiken vinner på den retoriska bågen |
| 3 | INFO (observation) | "fastighetsbolag i direktavkastning" är en elliptisk meningsdel i uppräkningen av branschnormer (underförstått "värderas på direktavkastningskrav") — knapp men begriplig i sitt sammanhang | Ingen |

**HÖG: 0 · MEDEL: 0 · LÅG: 2 · INFO: 1**

## Diff-rapport

Ingen — 0 rättningar gjordes; `data/blogg-utkast/pe-talet-sa-raknar-du-och-tolkar.json`
är byte-identisk med granskat tillstånd och den body som specen förordagar.

LEVERANS: pe-talet-sa-raknar-du-och-tolkar bedömning=FLYTTKLAR fynd=3 rättningar=0
