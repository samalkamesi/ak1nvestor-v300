# KURS-FAS 2 — underlagsbibliotek för de 20 fundamentalindikatorerna

Kunddirektiv 2026-09-18: fördjupa de 20 indikatorerna på djupet — läsa/tolka
faktiska årsredovisningar, praktisk innebörd, kritiskt tänkande, räkna på
RIKTIGA bolag. INGA böcker/författare (gör kunden utanför plattformen).

## Struktur per underlagsfil

1. **Vad indikatorn innebär i praktiken** — affärsförklaring utan jargon
2. **Läsa det i en faktisk årsredovisning** — vilken rad/not, kontraster
3. **Räkneexempel på riktiga bolag** — ur AK1A:s 189-bolagsuniversum
4. **Kritiskt tänkande** — fällor och misstolkningar
5. **Koppling till AKM1** — modellens poängtrösklar (0–5 p)

## Status

| Fil | Indikator | Kategori | Vikt | Status |
|---|---|---|---|---|
| underlag-v01-forsaljningstillvaxt.md | V01 Försäljningstillväxt | Tillväxt | KRITISK | LEVERERAT 2026-09-18 |
| underlag-v02-arr-tillvaxt.md | V02 ARR-tillväxt | Tillväxt | 8 % | LEVERERAT 2026-09-18 |
| underlag-v03-intaktsdiversifiering.md | V03 Intäktsdiversifiering | Tillväxt | 6 % | LEVERERAT 2026-09-18 |
| underlag-v04-ps.md | V04 P/S | Värdering | 8 % | LEVERERAT 2026-09-18 |
| underlag-v05-pb.md | V05 P/B | Värdering | 6 % | LEVERERAT 2026-09-18 |
| underlag-v06 … v20 | resten av registret | — | — | BOKADE (våg 197+: 6–10, 11–15, 16–20) |

**Datakälla:** data/portfolj-system/bolagsunivers.json — 189 noterade bolag,
10 branscher × 10, hämtat 2026-09-03 (Volvo 2026-09-15), källor Yahoo Finance
+ MarketStack (dubbelkollade slutkurser). Poängtrösklar citerade ur
src/components/ak1a/akm1-calculator.tsx (RAKNARE) — modellens egna regler.

**Juridikgrind:** allt material är utbildningsform — "så läser du", "så räknar
modellen" — och innehåller ALDRIG investeringsråd (lagen 2007:528, 2 kap 5 §:
utbildning är tillåtet, rådgivning kräver tillstånd).

**Nästa steg i spåret:** underlagen flyttas in i deep-courses-strukturen
(slugToVariableId-mappningen finns i src/lib/ak1a/deep-courses-data.ts) när
kvalitetsgranskning skett — innehållsleverans först (denna våg), kodintegration
senare.
