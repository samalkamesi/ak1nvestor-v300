# V173 dataset-djup — U18: HITACHI 6501.T (Japan/industri, +1 bolag) — universumet 280

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 214 · **Föregångare:** U1–U17
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Japan/industri-cellens **två affärsmodeller**: Komatsu
(byggnadsmaskiner) + Hitachi (digitala system/Lumada-konglomerat efter omvandlingen).
**P/E-bärarkontroll FÖRE leverans: TTM-netto 539 mdr JPY > 0 — GRÖN.** Kollisionskontroll
exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TYO 6501, hämtat 2026-09-25 + kompletterande FY-panel)

TYO-primär i JPY; mars-bokslut. Pris 4 111 JPY; mcap 19 700 mdr på 4 787 M aktier.

**Repliker med dokumenterade basvister:** **FCF-yield EXAKT (2,60 %)** · mcap 0,1 % · P/E 22,25
källans justerade bas (GAAP-replik 36,9 — minoritetsrikt konglomerat gör basgapet stort;
dokumenterad) · källans netto-M-rad 7,4 % bär annat fönster (fältet bär seriekonsistent replik
6,19 % med not) · payout-rad saknades i källan (GAAP-replik med not).

**Omvandlingsprofilen — rundens kärna:** netto [67 → 173 → 350 → 559] — **fyrdubblat på tre år**
medan omsättningen är platt (+1,4 %/år): konglomeratomvandlingen (tunga divisioner sålda, digitala
Lumada-system växer) — **VINSTEN är storyn, ej volymen**. Rak netto-CAGR +102,8 % bär låg bas
(vändningshörnet) och dokumenteras som **VÄNDNINGS-CAGR** med bas-not (Daiichi-klassen). Samtliga
FY positiva. EPS-serien [13,8 → 35,7 → 72,2 → 115,3].

**Kvalitetsprofilen:** ROIC 7,2 % ÖVER WACC 6,4 % (värdeskapande post-omvandling) · ROE 13,6 % ·
räntetäckning 17,3 · Altman 2,9 gränszon (konglomeratbalans) · Piotroski 6 · prognosTillväxt
+16,61 % (spår-PEG 1,34 mot källans 1,68 — nära kalibrering) · utdelning 77 JPY (1,87 %) ·
rappdag Q2 FY2026 est. november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 279→**280** · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, sextonde körningen) | GRÖN 280-läget · K2 round-trip · totalt n 267→268 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 280 bolag · 503 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (6501.T), kirurgisk append 279+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 280-läget
- `verktyg/_r214-u18-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U18-6501T-HITACHI-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 214-rad

## KÖ

1. Japan/energi (1605.T INPEX +?) — Japans sista enbolagscell; alternativt Tysklands 1-grenar.
2. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade).
3. Rappdagarna 10-20→11-04 → v172-kön (6501 Q2 FY2026 est. november med vid kalenderberöring).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; vändnings-CAGR:en dokumenteras med sin låga bas
(annars läses +103 %/år som tillväxtfall); basgisterna (P/E, netto-M) förklaras öppet —
ärlighetsprincipen i varje fältval.
