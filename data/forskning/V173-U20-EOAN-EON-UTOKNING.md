# V173 dataset-djup — U20: E.ON EOAN.DE (Tyskland/energi, +1 bolag) — producent/distributör-parallellen komplett

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 216 · **Föregångare:** U1–U19
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Tyskland/energi-cellens **två affärsmodeller**: RWE
(produktion/grön kraft) + E.ON (nätdistribution) — **samma producent/distributör-kontrast som
Japan/energi-duon (INPEX + Tokyo Gas, U19)**: pedagogisk parallellitet över länderna, dokumenterad
i båda raderna. **P/E-bärarkontroll FÖRE leverans: TTM-netto 3 207 M EUR > 0 — GRÖN.**
Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis ETR EOAN, hämtat 2026-09-25 + kompletterande FY-panel)

ETR-primär i EUR. Pris 12,01 EUR; mcap 31,17 mdr på 2 596 M aktier.

**Repliker:** **netto-M EXAKT (7,28 %)** · **PS EXAKT (0,708)** · **payout EXAKT (46,2 %)** ·
mcap 0,02 % · FCF-yield 9,77 % (källans invers 9,80 %, 0,3 %) · P/E 12,89 källans justerade bas
(GAAP-replik 9,72 noterad — Tokyo Gas/Hitachi-klassens dokumentnot).

**Vågens åttonde brottsfria rad:** netto [2 096 → 2 884 → 2 930 → 3 076] **stigande varje år**,
FCF stigande tre år räknat — rak CAGR oms +3,76 % · netto +13,64 % (energikrisårens
nättariffexpansion + reglerad bas). EPS-serien [0,807 → 1,111 → 1,129 → 1,185].

**Reglerade nämetodnoter (Redeia/Cellnex/Tokyo Gas-klassen):** ROIC 3,5 % mot WACC 4,8 % =
avkastningsformeln på tillgångsbasen · Altman 1,5 varningszon = nätutbyggnadsprogrammets tunga
infrastrukturinvestering · D/E 1,22 · utdelning 4,75 % (krisårens höjda nivå) ·
prognosTillväxt +11,80 % (spår-PEG 1,09) · rappdag Q3 est. tidigt november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 281→282 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, artonde körningen) | GRÖN 282-läget · K2 round-trip · totalt n 269→270 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 282 bolag · 507 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (EOAN.DE), kirurgisk append 281+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 282-läget
- `verktyg/_r216-u20-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U20-EOAN-EON-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 216-rad

## KÖ

1. Tysklands kvarvarande 1-grenar: kommunikation (DTE +?), fastighet (VNA +?), material (BAS +?).
2. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade).
3. Rappdagarna 10-20→11-04 → v172-kön (EOAN Q3 est. november med vid kalenderberöring).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; nämetodnoterna och utdelningens krisårsförklaring
dokumenteras så att varken "hög direktavkastning" eller "låg Altman" feltolkas utan kontext.
