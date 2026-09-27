# V173 dataset-djup — U17: DAIICHI SANKYO 4568.T (Japan/halso, +1 bolag) — Astellas avvisad först

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 213 · **Föregångare:** U1–U16
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Japan/halso-cellens två modeller: Takeda (global diversifierad
farmaka) + kandidat. **Astellas 4503.T sonderades först och AVVISADES på P/E-bärarkriteriet**
(TTM-netto −47 mdr JPY ≤ 0 — patentklippur + nedskrivningar; Sony/Honda-doktrinen,
Vestas-före-Ørsted-logiken; omprövningsvillkor dokumenterat). **Daiichi Sankyo GRÖN**
(TTM-netto +213 mdr JPY > 0, P/E 61,9 mätt). Kollisionskontroll exakt-match GRÖN (båda).

## KÄLLDATA (StockAnalysis TYO 4568, hämtat 2026-09-25 + kompletterande FY-panel)

TYO-primär i JPY; mars-bokslut. Pris 5 374 JPY; **mcap 15 240 mdr — repliken 0,00 % EXAKT**.

**Repliker med dokumenterade fönsterblandningar (källans interna baser):** P/E 61,9 källa på
justerad EPS-bas 86,8 (GAAP-replik 71,6 noterad) · PS 2,20 källa (replik 2,53 noterad) ·
P/FCF på FY25-FCF 456 (replik 2,99 % exakt på den basen; TTM 2,60 % noterad) ·
**netto-M 3,54 % EXAKT**. Alla avvikelser dokumenterade — Shin-Etsu-klassens dokumentnoter.

**Profilen — vändningsfasen öppet:** omsättningstillväxt +14,5 %/år (Enhertu-rampen) med
FY23-vinstdipen (patentförluster + R&D-topp) dokumenterad; nettomarginalen 3,5 % är **farmatunn**
mot cell-kollegan Takeda (~12–15 %) och redovisas öppet som pågående vändning. **prognosTillväxt
+125,9 %** (fwd P/E 27,4 mot trailing 61,9 — konsensus väntar nettofyrdubbling; spår-PEG 0,49).
ROIC under WACC dokumenterad som **investeringsfas-not** (ADC-plattformens R&D — inte
strukturbrist). Altman 2,2 varningszon som datafakta; utdelning 60 JPY (1,1 %, payout-replik 8,1 %
med not om källans saknade payout-rad).

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 278→279 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, femtonde körningen) | GRÖN 279-läget · K2 round-trip · totalt n 266→267 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 279 bolag · 501 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (4568.T), kirurgisk append 278+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 279-läget
- `verktyg/_r213-u17-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U17-4568T-DAIICHISANKYO-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 213-rad

## KÖ

1. Japans kvarvarande enbolagsceller: industri (6301.T Komatsu +?), energi (1605.T INPEX +?).
2. Tysklands resterande 1-grenar (energi/kommunikation/fastighet/material).
3. **Astellas 4503.T — omprövningsvillkor dokumenterat** (TTM-vändning konfirmeras i källpanel).
4. Rappdagarna 10-20→11-04 → v172-kön (4568 Q2 FY2026 est. november med vid kalenderberöring).
5. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; vändningsprognosen (+126 %) redovisas med sin natur
(konsensusförväntan, inte löfte) och tunna marginalen som mätt — ärlighetsprincipen; Astellas-
avvisandet dokumenterar varför ett "billigt" P/E-saknande bolag inte förs in utan kontroll.
