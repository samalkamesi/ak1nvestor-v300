# V173 dataset-djup — U7: CANADIAN PACIFIC KANSAS CITY CP (Kanada/industri, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 201 · **Föregångare:** U1 4661.T · U2 6752.T · U3 TELUS · U4 RCI-B · U5 NTR · U6 CNR
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/industri (CNR/CPKC)"), andrakandidaten.
**P/E-bärarkontroll FÖRE leverans: TTM-netto 3 847 M CAD > 0, P/E 28,17 — GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TSX CP, hämtat 2026-09-25)

Tre paneler, cache-bypass, TSX-primär CAD. Pris 107,49 CAD; mcap 100,27 mdr på 933,0 M aktier.
**Järnvägsduon komplett: CNR + CPKC.**

**Repliker:** mcap 0,02 % EXAKT · **netto-M 26,36 % EXAKT** · **PS EXAKT** · **FCF-yield EXAKT
(1,813 = 1,813 %)** · payout 0,9 % · P/E dokumentklass: källans 28,17 bär bolagets CORE-JUSTERADE
bas (KCS purchase accounting i siffran); GAAP-repliken 26,09 avviker 7,4 % — dokumenterad
(CNR-klassens justerade bas, djupare avvikelse).

**K&A-BROTTET FY2023 (Kansas City Southern):** omsättningshoppet +42 % i ett steg (USA–Mexiko-
nätet tillkommer — struktur, ej organiskt). CAGR på **2-årig konsekutiv post-KCS-bas**
(oms +8,04 % · netto −0,78 %); 3-årig rak bas (+18,5 %) skulle misstolka förvärvet som tillväxt
(AXA/Shaw-precedenserna). Nettot stabilt 3,3–3,9 mdr hela serien; FCF-nedgången 2 876→1 818 =
integrations-capex.

**Ärlighetsposter:** ROIC 5,66 % UNDER WACC 7,37 % — integrationens enorma kapitalbas
(dokumenterad kontrast mot CNR som ligger över; syndes pågår) · Altman 2,69 varningszonen som
datafakta (Piotroski 6) · beta 1,08 (Kanada-blockets enda över 1) · spår-PEG 2,26 (källans 5,41
på 3-års, kalibreringsnot) · prognosTillväxt +12,46 % · utdelning 0,80 CAD (0,74 %, payout 19 %).

**Rappdag 2026-10-28 (Q3)** — v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 268→269 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, femte körningen) | GRÖN 269-läget · K2 round-trip · totalt n 256→257 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 269 bolag · 483 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (CP), kirurgisk append 268+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 269-läget
- `verktyg/_r201-v173u7-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U7-CP-CPKC-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 201-rad

## KÖ

1. AEM/ABX (Kanada/material 1→2/3) — BCE §10:s sista namn; alternativt ny cellöppning.
2. Rappdagar: CNR ~10-20 · RCI-B/TMUS 10-22 · 4661.T 10-29 · 6752.T 10-30 · NTR 11-04 · CP 10-28 → v172-kön.
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; förvärvsbrottet och den justerade P/E-basen
dokumenteras öppet så att varken tillväxt eller värdering feltolkas; ROIC/WACC-kontrasten mot
CNR är pedagogisk jämförelse — ej rekommendation.
