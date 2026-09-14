# Granskning m9 — Börspsykologi: fallstugor september 2026

- **Utkast:** `data/blogg-utkast/m9-ko/boerspsykologi-fallstugor-v1.json` (m9-fabriken, version 1, status utkast)
- **Granskare:** m9-granskningsagent (agentfabriksomgång), 2026-09-14
- **Bedömning: FLYTTKLAR** — 0 rättningar behövdes, utkastet är orört sedan generering.

Publicering är kundens beslut (R2) — denna granskning flyttar ALDRIG filen till
`data/blogg/` och rör ALDRIG databasen. "Färdigt att flyttas" betyder: innehållet
håller för export när kunden beslutar.

---

## 1. Källor — md5 mot aktuell fil

| Källa | Md5 i kvitto | Md5 i trädet | Utfall |
|---|---|---|---|
| `data/rapporter/vagvalidering-SENASTE.json` | `42970c1a777eefe45791ad8839eae282` | `42970c1a777eefe45791ad8839eae282` | MATCHAR — oförändrad |
| `data/varumarke.json` | `9b906e4204a759db24c2c78b4b332e18` | `9b906e4204a759db24c2c78b4b332e18` | MATCHAR — oförändrad |

Båda källorna är byte-identiska med det urdraget bygger på — inget värde behöver
härledas om.

## 2. Siffror — mekanisk verifiering (28/28 gröna)

Skript: `.zcode/granskning-m9-verify.mjs` (kördes 2026-09-14; 28 kontroller, 0 fel).
Verifierade mot `vagvalidering-SENASTE.json`:

| Påstående i utkastet | Källvärde | Utfall |
|---|---|---|
| totalt 52 % träff, n=48 dömda, osatta 20 % | `totalt {52, 48, 20}` | STÄMMER |
| kort/impulsvåg 100 % på n=2 | `{kort, impulsvåg, 100, 2}` | STÄMMER |
| medellång basbygge 0 % (6 dömda) | `{medellång, basbygge, 0, 6}` | STÄMMER |
| mega basbygge 0 % (6 dömda) → 0/12 | `{mega, basbygge, 0, 6}` | STÄMMER |
| impulsvåg medellång 100 % (n=6), mega 100 % (n=6) | `perHorisontKlass` | STÄMMER |
| räknare sedan 2026-09-04, 12 tickers | `rullandeSedan`, `universumAntal` | STÄMMER |
| tröskel ± 6 % | `domProtokollText` ("|momentum| ≤ 6 %") | STÄMMER |
| dom-protokollet citerat ordagrant | `domProtokollText` — stränglikhet | STÄMMER (exakt) |

- **n-mätta:** summan av `nDomda` per cell = 48 = `totalt.nDomda`; antal icke-null
  procentrader = 8 — konsistent; rekonstruerad total träffprocent 25/48 ≈ 52 % stämmer.
- **Medianer:** utkastet innehåller inga medianpåståenden (serien bygger på
  träffprocent/n, inte medianer) — inget att granska, korrekt avstånd.
- **Bodyns matematik:** P(2/2 | slant) = 25 % ✓; P(0/12 | slant) = 0,5¹² ≈ 0,02 % ✓;
  tumregel 3/n med n=2 → 150 % ("ingen begränsning alls") ✓.

## 3. Determinism — kvittot reproducerat

Skript: `.zcode/granskning-m9-rekonstruera.mjs` (spegling av `byggBoerspsykologi` +
`montera` ur `verktyg/m9-fabrik.mjs`). Ur källfilen + kod återskapades:

- **bodyMarkdown: byte-identisk** med utkastets (4 995 tecken) — titel, ingress,
  urdrag och källor likaså.
- **mallMd5 `fc608a6d6b4c2a84e5ef0e8b86103d2d`: reproduceras exakt.**
- **kandidatMd5 `b90e7b95b8f260c731ef668b952bbe9e`: reproduceras exakt.**

Slutsats: utkastet är **oekkat sedan generering** — integritetskvittot håller hela vägen.

## 4. Juridik — REN (lagen 2007:528, utbildningsformen)

- Inga rådgivningsformuleringar: regexsökning efter direktiv ("köp/sälj/undvik +
  denna/den aktien") → 0 träffar; inga tickers eller bolagsnamn förekommer.
- Texten är konsekvent pedagogisk: "så fungerar protokollet", "de förklarar vad
  datan KAN säga, inte vad den kommer att göra", "inte en slutsats att handla på".
- Tydlig anti-rådgivningsmarkering i ingressen ("utbildning, aldrig rådgivning") och
  disclaimern sist i bodyn: "Pedagogisk forskning — aldrig investeringsrådgivning
  (lagen 2007:528)".
- Lagrum: endast 2007:528 nämns — inga blandade lagrum.

## 5. Kvalitet

- **Titel:** informativ (serie + månad + vinkel). Se fynd F1 om "(utkast)"-suffixet.
- **Disposition:** ingress → tre fallstudier → "Vad träffprocenten inte är" →
  ändringslogg → fördjupning → kvitto (tas bort vid export) → disclaimer. Logisk
  och välskriven svensk.
- **Internlänkar 3/3 verifierade:** `/kurser/km-019-bekraftelsefalla` och
  `/kurser/km-036-overconfidence` finns som `sokvag` i `data/llms-fragor.json`;
  `/blogg/mr-market-psykologi-svenska-borsen` finns som publicerad fil i
  `data/blogg/`.
- **Disclaimer sist:** ja (sista raden i bodyMarkdown — kvarvarande sist även efter
  att kvittoavsnittet tas bort vid export).
- **fabrik.kontroll** stämmer: 7 "##"-rubriker i hela bodyn (6 i mallen + kvittots
  rubrik), strukturfel 0, kontrolleraText 0 fel/0 varningar — alla bekräftade av
  mina mätningar.

## Fyndlista

| # | Grad | Fynd | Åtgärd |
|---|---|---|---|
| F1 | LÅG | Titeln bär "(utkast)" — ska strykas av exportvägen samtidigt som kvittoavsnittet tas bort (samma tvättklass som kvittot dokumenterar självt). | Exportvägens jobb, ej utkastets. Noterad. |
| F2 | LÅG | Utkastfilen lagrar urdragen med nyckelordning `{datum, varde, notering}` medan kandidatMd5 beräknades med kodens `{varde, datum, notering}` — en granskare som återskapar hashen ur filen ensam (utan källkod) får fel resultat och kan tro att utkastet är ändrat. Denna granskning verifierade mot källkoden: kvittot ÄR korrekt. | Informativ för framtida granskare; ingen ändring i utkastet. |
| F3 | LÅG | Källkodens fallback "okänt datum"/"? tickers" träder aldrig in (fälten normaliseras) — bodyns "sedan 2026-09-04, 12 tickers" är korrekt ur källan. | Ingen. |

Inga HÖGA eller MEDELA fynd.

## Diff-rapport

**0 rättningar.** Utkast-JSON:en är lämnad byte-identisk — kandidatMd5:oekat sedan generering (se § 3), så varje ändring från min sida skulle bara ha brutit kvittot.

## Slutsats

**FLYTTKLAR.** Källor oförändrade, 28/28 sifferkontroller gröna, determinismkvitto
reproducerat exakt, juridiken ren och kvaliteten hög. När kunden beslutar publicera:
exportvägen tar bort "Granskningsunderlag"-avsnittet och "(utkast)" i titeln — därefter
är innehållet klart att leva som blogginlägg.
