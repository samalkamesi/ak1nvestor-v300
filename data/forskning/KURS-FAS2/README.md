# KURS-FAS 2 — underlagsbibliotek för de 20 fundamentalindikatorerna

Kunddirektiv 2026-09-18: fördjupa de 20 indikatorerna på djupet — läsa/tolka
faktiska årsredovisningar, praktisk innebörd, kritiskt tänkande, räkna på
RIKTIGA bolag. INGA böcker/författare (gör kunden utanför plattformen).

## Struktur per underlagsfil

1. **Vad indikatorn innebär i praktiken** — affärsförklaring utan jargon
2. **Läsa det i en faktisk årsredovisning** — vilken rad/not, kontraster
3. **Räkneexempel på riktiga bolag** — ur AK1A:s 195-bolagsuniversum
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
| underlag-v06-ev-ebitda.md | V06 EV/EBITDA | Värdering | 8 % | LEVERERAT 2026-09-19 |
| underlag-v07-bruttomarginal.md | V07 Bruttomarginal | Lönsamhet | KRITISK | LEVERERAT 2026-09-19 |
| underlag-v08-ebitda-marginal.md | V08 EBITDA-marginal | Lönsamhet | 8 % | LEVERERAT 2026-09-19 |
| underlag-v09-roe.md | V09 ROE | Lönsamhet | 8 % | LEVERERAT 2026-09-19 |
| underlag-v10-skuldsattningsgrad.md | V10 Skuldsättningsgrad | Stabilitet | 6 % | LEVERERAT 2026-09-19 |
| underlag-v11-likviditet.md | V11 Likviditet | Stabilitet | 6 % | LEVERERAT 2026-09-19 |
| underlag-v12-intaktsstabilitet.md | V12 Intäktsstabilitet | Stabilitet | 6 % | LEVERERAT 2026-09-19 |
| underlag-v13-patent-ip.md | V13 Patent & IP | Moat | 6 % | LEVERERAT 2026-09-19 |
| underlag-v14-varumarke.md | V14 Varumärke | Moat | 6 % | LEVERERAT 2026-09-19 |
| underlag-v15-natverkseffekter.md | V15 Nätverkseffekter | Moat | 6 % | LEVERERAT 2026-09-19 |
| underlag-v16-produktlanseringar.md | V16 Produktlanseringar | Katalysator | 6 % | LEVERERAT 2026-09-19 |
| underlag-v17-avtal-partnerskap.md | V17 Avtal & Partnerskap | Katalysator | 6 % | LEVERERAT 2026-09-19 |
| underlag-v18-regulatoriska.md | V18 Regulatoriska | Katalysator | 6 % | LEVERERAT 2026-09-19 |
| underlag-v19-kassatackning.md | V19 Kassatäckning — nyemissionsrisk | Risk | KRITISK | LEVERERAT 2026-09-19 |
| underlag-v20-aterekop.md | V20 Återköp av egna aktier | Kapitalstruktur | 6 % | LEVERERAT 2026-09-19 |

**Alla 20 underlag levererade (våg 192 + 197 + 198 + 199).** Kvalitetsgranskning
SKETT 2026-09-19 (GRANSKNING-2026-09-19.md: NO-GO med 8 rättningar — samtliga
verkställda samma dag; substansen stark: trösklar och tal paritetsverifierade
mot kärnan och bolagsunivers.json).

**KODINTEGRATION LEVERERAD (våg 200, rond 89, commit b1fe517b):** 100 kapitel
(20 kurser × 5 sektioner) in i public/deep-courses.json via slugToVariableId-
mappningen — md-rensning + tabell→listor enligt renderingskontraktet, hela
genererade kedjan ombyggd atomärt, LARVAG-SYNK GRÖN 440 (0 fantomer),
gränssnittsvakten 0 fynd efteråt. **Utmaning-block LEVERERADE (våg 203, rond 96):** samtliga 100 Fas 2-kapitel
bär exakt ett utmaning-block (89 tillfogade från fabrikens 20 fragmentfiler,
11 fanns sedan våg 200) — LARVÄGSSYNK GRÖN 446.

**Vikternas betydelse:** vikt-kolumnen (8 %/6 %/KRITISK) är den pedagogiska
etikettskalan — i akm1-klassisk profil väger alla 20 indikatorer LIKA (uniform
1/20); procenttabellen 5×8 % + 12×6 % är ÖVERGIVEN (R2 §2). Källa:
src/lib/akm2/vikter.ts.

**Datakälla:** data/portfolj-system/bolagsunivers.json — 195 noterade bolag,
10 branscher (15–27 bolag per bransch), hämtat 2026-09-03 (Volvo 2026-09-15),
källor Yahoo Finance + MarketStack (dubbelkollade slutkurser). Poängtrösklar
citerade ur modellkärnan (src/lib/akm2/karna.ts) samt kalkylatorn (RAKNARE)
där de sammanfaller.

**Juridikgrind:** allt material är utbildningsform — "så läser du", "så räknar
modellen" — och innehåller ALDRIG investeringsråd (lagen 2007:528, 2 kap 5 §:
utbildning är tillåtet, rådgivning kräver tillstånd).

**Nästa steg i spåret:** klart — biblioteket
slutlevererat i både underlag, granskning, kodintegration och interaktivitet.
