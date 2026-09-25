# V173 dataset-djup — U21: FREENET AG FNT.DE (Tyskland/kommunikation, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 217 · **Föregångare:** U1–U20
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Tyskland/kommunikation-cellens **två affärsmodeller**:
Deutsche Telekom (integrerad nätjätte) + freenet (MVNO/mobil detalj — kassageneratorn utan
egen nätägande). **P/E-bärarkontroll FÖRE leverans: TTM-netto 610 M EUR > 0 — GRÖN.**
Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis ETR FNT, hämtat 2026-09-25 + TRE kompletterande hämtningar)

ETR-primär i EUR. Pris 23,92 EUR; mcap 3,133 mdr på 130,9 M aktier.

**P/E-fallet — Shin-Etsu-precedensen andra gången:** källans P/E-rad 11,40 **motsägs av källans
egen EPS-rad 4,66** (11,40 × 4,66 = 53,1 ≠ priset 23,92). Fältet bär aktiebas-repliken
**5,13**, låst av **tre oberoende identiteter**: EPS × aktier = netto (609,994 ≈ 610 ✓) ·
**FCF-yield EXAKT (17,87 = 17,86 %)** · mcap 0,05 %. Källans PS- och payout-rader bär samma
fönsterdokumentation (1,00 mot 1,23; 80,4 % mot 39,7 % aktiebas). **prognosTillväxt NULL**
(fwd-basen delar det tvistiga fönstret — basblandning vägras).

**Vågens nionde brottsfria rad:** netto [447 → 491 → 549 → 580] **stigande varje år** med stabil
FCF ~430 hela serien — rak CAGR oms +2,06 % · netto +9,07 % (MVNO-marginalutflytten: mobilabonnent
värderas högre än TV/fast).

**MVNO-metodnoten:** ROIC 5,9 % ≈ WACC 6,0 % är modellens struktur (hyr nätet — minimalt
kapitalkrav, smalare marginalspektrum), inte struktursvaghet. **Kassageneratorprofilen:** P/FCF
5,6 · FCF-marginal 22 % · **direktavkastning 7,73 %** — dokumenterad som modellens utdelningsfil.
Altman 2,1 varningszon (licenser/spektrum + åtaganden) som datafakta; Piotroski 7 · rappdag Q3
est. november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 282→283 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · två enhetsbuggar i skriptet fångade av grindsystemet FÖRE append (mcap M/mdr + fcfY-formel — rättade) |
| llms HELREGEN (diskdrivet, nittonde körningen) | GRÖN 283-läget · K2 round-trip · **kommunikation-medianen P/E 16,9→16,2** (freenets låga multiplar syns i cellen — datasetet fångar båda riktningarna) · totalt n 270→271 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 283 bolag · 509 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (FNT.DE), kirurgisk append 282+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 283-läget
- `verktyg/_r217-u21-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U21-FNT-FREENET-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 217-rad

## KÖ

1. Tysklands kvarvarande 1-grenar: fastighet (VNA +?), material (BAS +?).
2. Omprövningar: Astellas 4503.T + Kirin 2503.T (TTM-vändningsvillkor dokumenterade).
3. Rappdagarna 10-20→11-04 → v172-kön (FNT Q3 est. november med vid kalenderberöring).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; P/E-tvisten dokumenteras fullt (tre lås mot källraden)
och direktavkastningen förklaras med modellen (annars feltolkas 7,7 % som signal utan kontext);
prognosTillväxt-NULL:en är ärlighetsprincipen.
