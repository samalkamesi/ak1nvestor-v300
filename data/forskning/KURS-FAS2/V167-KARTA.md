# V167-KARTA — V01–V20:s faktiska slug:ar och var kursdatan lever

Rond 178-förberedelse (rond 176:s kvarlevande steg) · 2026-09-24 · studio
Källa: src/lib/ai-mentor-register.ts (rad 557–576) — maskinellt avläst.

## Mappning V01–V20 (registrets rader, ordagranna slug:ar)

| V | Slug | Titel | Kategori | Kap | Quiz | Min | Nivå |
|---|---|---|---|---|---|---|---|
| V01 | `v01-forsaljningstillvaxt` | Försäljningstillväxt | TILLVÄXT | 11 | 18 | 44 | Nybörjare |
| V02 | `v02-arr-tillvaxt` | ARR-tillväxt (återkommande intäkter) | TILLVÄXT | 11 | 17 | 46 | Intermediär |
| V03 | `v03-intaktsdiversifiering` | Intäktsdiversifiering | TILLVÄXT | 11 | 18 | 43 | Nybörjare |
| V04 | `v04-ps` | P/S (Price-to-Sales) | VÄRDERING | 11 | 18 | 44 | Nybörjare |
| V05 | `v05-pb` | P/B (Price-to-Book) | VÄRDERING | 11 | 18 | 44 | Nybörjare |
| V06 | `v06-ev-ebitda` | EV/EBITDA | VÄRDERING | 11 | 18 | 44 | Intermediär |
| V07 | `v07-bruttomarginal` | Bruttomarginal | LÖNSAMHET | 11 | 18 | 44 | Nybörjare |
| V08 | `v08-ebitda-marginal` | EBITDA-marginal | LÖNSAMHET | 11 | 18 | 44 | Intermediär |
| V09 | `v09-roe` | ROE (Return on Equity) | LÖNSAMHET | 11 | 18 | 44 | Intermediär |
| V10 | `v10-skuldsattningsgrad` | Skuldsättningsgrad | STABILITET | 11 | 18 | 43 | Nybörjare |
| V11 | `v11-likviditet` | Likviditet (Kvick) | STABILITET | 11 | 18 | 43 | Nybörjare |
| V12 | `v12-intaktsstabilitet` | Intäktsstabilitet | STABILITET | 11 | 18 | 43 | Intermediär |
| V13 | `v13-patent-ip` | Patent & Immateriella rättigheter | MOAT | 11 | 18 | 48 | Intermediär |
| V14 | `v14-varumarke` | Varumärke & Kundlojalitet | MOAT | 11 | 17 | 48 | Intermediär |
| V15 | `v15-natverkseffekter` | Nätverkseffekter | MOAT | 11 | 18 | 48 | Avancerad |
| V16 | `v16-produktlanseringar` | Produktlanseringar | KATALYSATOR | 11 | 18 | 48 | Intermediär |
| V17 | `v17-avtal-partnerskap` | Avtal & Partnerskap | KATALYSATOR | 11 | 16 | 48 | Intermediär |
| V18 | `v18-regulatoriska` | Regulatoriska katalysatorer | KATALYSATOR | 11 | 16 | 48 | Avancerad |
| V19 | `v19-kapitalforbranning` | Kapitalförbränning & Emission-risk | RISK | 13 | 24 | 67 | Avancerad |
| V20 | `v20-aterekop-egna-aktier` | Återköp av egna aktier | KAPITALSTRUKTUR | 11 | 16 | 47 | Intermediär |

## Var kursdatan lever (viktigt för manifestet)

- **INTE** i `data/bokmaster/` — inga `v*.json` finns där (sonderad 2026-09-24;
  rond 176:s misstanke bekräftad).
- **Ägande filer:** `public/deep-courses.json` (offentlig data, läses från
  disk — dataleveransväg, inget bygge vid JSON-ändring) samt TS-motparten
  `src/lib/ak1a/deep-courses-data.ts` (kodväg — kräver bygge vid ändring).
  Våg 200 integrerade 100 Fas 2-kapitel (20 kurser × 5 sektioner) via
  `slugToVariableId`-mappningen; våg 203 tillförde 89 utmaning-block med
  sektionsmatchning (sektionsid 1–5 som nyckel).
- **Underlagen:** `data/forskning/KURS-FAS2/underlag-v01…v20` (våg 192/197/
  198/199, 20/20 LEVERERADE) + `data/kurser/fas2-djup/indikatorer-{01-10,
  11-20}.md` (v159:s indikatortexter — rund 176:s fynd).

## Konsekvenser för v167-manifestet (designfrågor som återstår)

1. **Append-mål per uppgift**: `public/deep-courses.json` ELLER ts-motparten —
   valet avgör data-väg (inget bygge) vs kod-väg (bygge). Företräde enligt
   plattformens mönster: JSON (data lever, append-only möjligt).
2. **Strukturkontrakt**: djupkapitel-formatet i deep-courses.json bör
   spegla v166:s mönster (append sista kapitlet, chapters-list-konsistens,
   quiz = kap × 1 = 3 för det nya kapitlet — verifiera vad kontraktet i
   deep-courses säger; V-kurserna har 16–24 quiz totalt, ej 3/kapitel).
3. **KVD-mönster**: talmarkörer från underlag, varumärkesgrind, lagrum,
   append-only mot `commit~1` (INTE HEAD — rond 177:s mätfelsläxa).
4. **Manifestsekvens**: skrivs först när v166 är 24/24 + granskat (rond
   167:s sekvensregel: push-kedjan före nya fabriksmanifest).

*Läge v166 vid karteringens slut: d01–d13 granskade (143 PASS 0 FEL),
d14–d18 levererade (granskning väntar), d19–d24 kvar.*
