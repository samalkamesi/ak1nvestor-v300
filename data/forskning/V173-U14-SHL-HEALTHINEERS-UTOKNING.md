# V173 dataset-djup — U14: SIEMENS HEALTHINEERS SHL.DE (Tyskland/halso, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 210 · **Föregångare:** U1–U13
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo enligt U13-mönstret — Tyskland/halso-cellens **två
affärsmodeller**: Fresenius (vårdoperatör) + Siemens Healthineers (medtech/bild-diagnostik).
**P/E-bärarkontroll FÖRE leverans: TTM-netto 2 472 M EUR > 0 — GRÖN.** Kollisionskontroll
exakt-match GRÖN.

## KÄLLDATA (StockAnalysis ETR SHL, hämtat 2026-09-25 + kompletterande FY-panel)

ETR-primär i EUR. Pris 54,36 EUR; mcap 59,84 mdr på 1 102 M aktier. **September-bokslut**
(etikett = slutår — sällsynt konvention, dokumenterad i raden).

**Repliker:** netto-M EXAKT · PS EXAKT · FCF-yield EXAKT (4,94 %) · mcap 0,12 % · P/E 0,1 % ·
payout 0,1 % — sex kontroller varav tre exakta.

**Vågens femte brottsfria rad** (efter TELUS/CNR/Redeia/Munich Re): samtliga FY positiva med
**stadigt stigande netto** (1 730 → 2 417 M EUR) — rak CAGR oms +2,55 % · netto +11,79 %
(vinsttillväxten bär marginalexpansion, dokumenterat — inte volym).

**Kvalitetsprofilen:** ROIC 8,24 % ÖVER WACC 7,18 % (värdeskapande medtech) · räntetäckning 9,61
· Piotroski 7 · Altman 2,86 gränszon (medtech-nduvvet med FDA-godkännandekapital — datafakta) ·
prognosTillväxt +24,05 % (spår-PEG 1,01 — källans PEG 2,98 på 3-års, kalibreringsnot) ·
utdelning 1,20 EUR (2,21 %, payout 53,24 %) · rappdag Q4 FY2025 est. november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 275→276 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, tolfte körningen) | GRÖN 276-läget · K2 round-trip · totalt n 263→264 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 276 bolag · 495 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (SHL.DE), kirurgisk append 275+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 276-läget
- `verktyg/_r210-u14-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U14-SHL-HEALTHINEERS-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 210-rad

## KÖ

1. Cellmotiverade duon kvar: Tyskland/industri (Siemens + DHL-logistik), Japans enbolagsceller
   (material/halso/industri/energi), Tyskland/kommunikation (Telekom +?), Tyskland/fastighet
   (Vonovia +?).
2. Rappdagarna 10-20→11-04 → v172-kön (SHL Q4 est. november med vid kalenderberöring).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; sep-bokslutskonventionen dokumenterad (annars jämförs
året fel mot kalenderårsbolag); marginalexpansionen förklaras (annars läses netto-CAGR som
volymtillväxt).
