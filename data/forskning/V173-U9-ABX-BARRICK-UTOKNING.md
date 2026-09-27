# V173 dataset-djup — U9: BARRICK GOLD ABX (Kanada/material, +1 bolag) — BCE-TRION KOMPLETT

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 203 · **Föregångare:** U1–U8
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/material (NTR/AEM/ABX)") — **SISTA namnet:
trion komplett** (gödning + guld ×2). **P/E-bärarkontroll FÖRE leverans: TTM-netto 3 402 M USD > 0
— GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TSX ABX, hämtat 2026-09-25 + kompletterande FY-panel)

Valuta-mix enligt NTR/AEM-mönstret (CAD-pris/utdelning, USD-rapportering). Pris 53,12 CAD;
mcap 91,13 mdr på 1 722 M aktier; 52v 27,55–55,04 (rallyts fulla spänn).

**Repliker:** mcap 0,37 % · **netto-M 24,14 % EXAKT** · **FCF-yield EXAKT (5,299 = 5,299 %)** ·
P/E 11,73 källvärde på bolagets justerade bas (bas-skillnaden dokumenterad — CNR/CPKC-klassen
med valuta-mix-not).

**Guldcykeln med BOTTENBAS-VARNING — rondens kärna:** FY2022-nettot 432 M = cykelbottnen
(nedskrivningar + lägre guldpris); serien 432→2 748 visar boomens språng (6,4×) och **rak CAGR
från bottnen (+85 %/år) är meningslös som tillväxtmått** — dokumenterad varning. CAGR-fälten bär
**konsekutiv FY23→FY25-bas** (oms +12,53 % · netto +46,98 %); TTM +29,6 % = prisdrivet, ingen
volymexpansion (FCX/VALE/NTR/AEM-precedenserna).

**Profilen:** ROIC 7,05 % ÖVER WACC 6,78 % (guldsektorns kapitaldisiplin) · **Altman 4,42 sund —
guldduon AEM (4,89) + ABX (4,42) är Kanada-blockets balansryggrad** · D/E 0,22 · räntetäckning
15,13 · netto-skuld endast 0,72 mdr · FCF-marginal 34,3 % (kassaflödesstyrkan) · spår-PEG 0,83
(källans 0,28 på 3-års, kalibreringsnot) · prognosTillväxt +14,11 % · utdelning 0,60 CAD (1,13 %,
payout-replik ~27 % med kurskonvertering dokumenterad).

**Rappdag Q3 est. tidigt november** — v172-könotis v45.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 270→271 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, sjunde körningen) | GRÖN 271-läget · K2 round-trip · totalt n 258→259 (medianen 20,5→20,4 — ABX låga multiplar väger tillbaka guldtillskottet) · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 271 bolag · 485 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## VÅGENS LÄGE EFTER NIO UTÖKNINGAR (U1–U9)

Universum 262→271 (+9). Kanada-blocket **3→10** på sex branschgrenar — BCE-OMG24:s hela kö-notis
genomförd (RCU→Rogers, TELUS, CNR, CPKC, NTR, AEM, ABX) plus Japan-tillskotten. Balansspektrum
Altman 1,55–4,89. Universummedianen P/E: 20,4→20,5→20,4 (guldtiltäget och ABX motmultiplar
utjämnade). Instrumenten generaliserade; två avvisanden/stoppar; tre handrättningsfel fångade.

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (ABX), kirurgisk append 270+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 271-läget
- `verktyg/_r203-v173u9-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U9-ABX-BARRICK-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 203-rad

## KÖ

1. **Rotation** — BCE-listan är TOM; nästa kandidatur väljs per styrelserond (evighetskatalogens
   spårlogik: tunnaste celler med dokumenterade lediga namn — ny sondering krävs) ELLER v172-skifte
   (rappdagarna 10-20→11-04: sex av vågens nio bolag rapporterar i fönstret).
2. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; bottenbasvarningen är själva utbildningskärnan
("så läses en cykel-CAGR från botten"); P/E-basen dokumenteras öppet; ROIC/WACC, payout och
Altman redovisas som mätt — ärlighetsprincipen.
