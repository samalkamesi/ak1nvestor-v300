# Granskning m9 — branschmedianer-akm2 (v2)

**Objekt:** `data/blogg-utkast/m9-ko/branschmedianer-akm2-v2.json` (version 2, status utkast, m9-fabrik-v2, seed `904e0fcc…`)
**Granskad:** 2026-09-14 av m9-granskningsagenten (agentfabrikens granskningskö)
**Off-gräns:** publicering = kundens beslut (R2) — filen har INTE flyttats till `data/blogg/`, databasen orörd.

## BEDÖMNING: FLYTTKLAR

**Fynd: 3 (0 höga · 0 medel · 2 låga · 1 info) · Rättningar: 0** — inget fynd kräver ändring i utkast-JSON:en.

---

## 1. Källor — md5 mot aktuell fil

| Källa | md5 i utkast | md5 i arbetsytan | Utslag |
|---|---|---|---|
| `data/portfolj-system/korstabell-grund.json` | `33fe62a0…bd6a` | `33fe62a0…bd6a` | **MATCH** — oförändrad sedan urdrag |
| `data/rapporter/vagvalidering-SENASTE.md` | `b7194627…cff8` | `b7194627…cff8` | **MATCH** — oförändrad |
| `data/varumarke.json` | `9b906e42…2e18` | `9b906e42…2e18` | **MATCH** — oförändrad |

Alla tre källor existerar och är byte-identiska med urdragsunderlaget. Ingen härledning ur "ändrad källa" behövdes — nedanstående siffror är verifierade direkt mot identiskt underlag.

## 2. Siffror — verifiering mot källfilen (krav ≥ 5; 11 urdrag + ytterligheter + förändringspåstående)

Oberoen­de härledning med node (median = medel av två mittersta vid jämnt n, över gruppens icke-null `akm2`) ur `korstabell-grund.json` (skapad 2026-09-03, 100 rader):

| Bransch | Utkast (median · n · spridning) | Källfilen | Ytterligheter (lägst/högst) | Utslag |
|---|---|---|---|---|
| universum | 100 bolag (10×10) | 100 rader, 10 branscher × 10 | — | ✓ |
| teknik | 61 · 10 · 37–78 | 61 · 10 · 37–78 | Sinch / Logitech International | ✓ |
| konsument | 60,5 · 10 · 19–70 | 60,5 · 10 · 19–70 | Electrolux / H & M Hennes & Mauritz | ✓ |
| industri | 60 · 10 · 51–85 | 60 · 10 · 51–85 | ASSA ABLOY / Industrivärden | ✓ |
| kommunikation | 60 · 10 · 39–68 | 60 · 10 · 39–68 | Warner Bros. Discovery / Tele2 | ✓ |
| energi | 58 · 10 · 31–77 | 58 · 10 · 31–77 | RWE / Chevron | ✓ |
| hälsa | 56,5 · 10 · 46–66 | 56,5 · 10 · 46–66 | Fresenius / Novo Nordisk | ✓ |
| fastighet | 50 · 10 · 42–60 | 50 · 10 · 42–60 | Prologis / Diös Fastigheter | ✓ |
| tillväxt | 43 · 10 · 25–58 | 43 · 10 · 25–58 | Polestar Automotive Holding UK / Truecaller | ✓ |
| material | 42 · 10 · 31–79 | 42 · 10 · 31–79 | Stora Enso / Newmont | ✓ |
| finans | 41 · 10 · 30–80 | 41 · 10 · 30–80 | Nordea Bank / Investor | ✓ |

**Alla medianer, n-mätta, spridningar och båda ytterlighetsbolagen per bransch stämmer exakt.** Medianformeln (medel av de två mittersta vid jämnt n) är källkodskontraktet i `src/lib/portfolj-forskning/peer.ts` ("jämnt n ⇒ medel av de två mittersta", rad 104–105) och min oberoende härledning använder samma kontrakt oberoende av utkastet.

**Förändringspåståendet** ("Ingen branschmedian rörde sig sedan den publicerade utgåvan") verifierat mot den publicerade utgåvan `data/blogg/branschmedianer-akm2.json` (publishedAt 2026-09-03): alla 10 medianer + n + spridningar är **identiska** mellan publicerad body och utkast v2 — påståendet är sant, och logiskt nog är underlaget (korstabellen 2026-09-03) detsamma som den publicerade utgåvan byggde på.

**Metodpåståenden i bodyn verifierade:**
- "viktprofilen akm2-2026" ✓ — står i korstabellens `akm2Regler.formel`.
- "medianen räknas över gruppens mätta bolag", "en grupp under 5 mätta bolag redovisas aldrig", "de kanoniska branscherna (10 bolag var)" ✓ — peer.ts kontrakt (rad 19 "grupp < 5 bolag ⇒ osatt", rad 121 "de 10 kanoniska", rad 149 median över mätta).

## 3. Juridik (lagen 2007:528 — utbildning, aldrig rådgivning)

- **Inga rekommendationsfraser**: maskinsökning på titel+ingress+body mot *köp/sälj/rekommendera/bör du/undvik denna/bra affär* → **0 träffar**. Texten beskriver statistik ("median", "spridning", "lägst/högst poäng i gruppen") utan hållning eller uppmaning — rent deskriptiv, pedagogisk ram.
- **Lagrum**: endast 2007:528 nämns (värdepappersrörelse — rätt system för påståendet "aldrig investeringsrådgivning"). **Inga blandade lagrum** (2022:260/2022:261/1985:716/2005:59 förekommer ej).
- **Disclaimer sist**: slutraden "_Pedagogisk forskning — aldrig investeringsrådgivning (lagen 2007:528)._" är bodyns sista rad ✓ (och förblir sist när kvitto-avsnittet tas bort, eftersom kvittot står före den).
- Jämförbarhetsnoten om investmentbolag ("Det är information, inte fel") är föredömligt pedagogisk.

## 4. Kvalitet

- **Titel**: informativ, med månads- och modellangivelse. Suffixet "(utkast)" hanteras av exportvägen (den publicerade utgåvans titel saknar det) — se fynd 3.
- **Disposition**: ingress → så räknas medianen → varje bransch (lista) → jämförbarhetsnot → ändringen sedan senaste → fördjupa dig → kvitto → disclaimer. Logisk, 5 `##`-rubriker, uppfyller kravet (≥ 2).
- **Svenska**: korrekt och proffsig; bolagsnamn i officiell form ("H & M Hennes & Mauritz", "Polestar Automotive Holding UK"). Fabrikens kontrolleraText-förkontroll: FEL 0 · VARNINGAR 0 (stämmer med min genomläsning).
- **Internlänkar — alla giltiga**: `/forskningsbiblioteket` (route `src/app/(huvud)/forskningsbiblioteket/` finns) · `/kurser/v07-bruttomarginal` och `/kurser/v09-roe` (slugs verifierade i `src/lib/larvag-karta.ts` rad 37 resp. 39; dynamisk route `kurser/[slug]` finns).

## Fyndlista

| # | Allvarlighet | Fynd | Åtgärd |
|---|---|---|---|
| 1 | LÅG | Källan `vagvalidering-SENASTE.md` är angiven i `fabrik.kallor` men används i inget urdrag och saknar bäring på branschmedianer (rapporten handlar om vågmotorns träffhistorik, universum 12 tickers). Overksamt underlag — inget faktafel i texten. | Ingen (källistan är fabrikskvitto med md5 i seed-underlaget; inget i bodyn bygger på den). Flagga till m9-fabriken för framtida urval. |
| 2 | LÅG | Branschnamnen presenteras som "hälsa"/"tillväxt" medan källfilens kanoniska nycklar är `halso`/`tillvaxt`. Presentationsnamn vs maskinnyckel — inget tal påverkas. | Ingen (presentationsskick är föredöme: kundvänlig svenska). |
| 3 | INFO | Titelsuffix "(utkast)" och avsnittet "Granskningsunderlag — maskinens kvitto" ska bort före export. Exportvägen gör detta (bevis: publicerad utgåva har titel utan suffix och body utan kvitto), och texten instruerar själva borttagningen. | Ingen (flödesdesign enligt våg 66 — mänsklig granskning före statusbyte). |

## Diff-rapport

**0 rättningar.** Utkast-JSON:en är oändrad av granskaren — fynden ovan kräver ingen ändring i utkastet. Kontroll-blocket i JSON (`rubriker: 5, strukturFel: 0, disclaimerSist: true …`) stämmer med min mätning (5 `##` i hel body; 4 i mall-body utan kvitto — konsekventa sinsemellan).

## Slutsats

**FLYTTKLAR** — källor byte-identiska, samtliga siffror oberoende verifierade exakt (11/11 urdrag + 20 ytterlighetsbolag + förändringspåståendet), juridiken ren (0 rådgivningsfraser, rätt lagrum, disclaimer sist), kvaliteten hel (titel, disposition, svenska, 3 giltiga internlänkar). Beslut om publicering väntar kunden (R2).
