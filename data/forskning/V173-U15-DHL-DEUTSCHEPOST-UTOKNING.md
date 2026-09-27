# V173 dataset-djup — U15: DEUTSCHE POST DHL DHL.DE (Tyskland/industri, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 211 · **Föregångare:** U1–U14
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo enligt U13/U14-mönstret — Tyskland/industri-cellens **två
affärsmodeller**: Siemens (industriautomation) + DHL (logistik/express). **P/E-bärarkontroll FÖRE
leverans: TTM-netto 4 893 M EUR > 0 — GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis ETR DHL, hämtat 2026-09-25 + kompletterande FY-panel)

ETR-primär i EUR. Pris 48,66 EUR; mcap 57,93 mdr på 1 190 M aktier.

**Repliker:** **netto-M EXAKT (5,61 %)** · **FCF-yield EXAKT (5,60 %)** · **payout EXAKT (52,31 %)**
· mcap 0,04 % · P/E dokumentklass (attributable-bas; totalnetto-replik 11,84 mot 12,87 = 8 %,
minoritets-/vägningsnot).

**Pandemibooms-brottet FY2022 — rundens kärna:** netto 8 458 M = paketboomens toppår
(e-handelsexplosionens slut) följt av normalisering till ~4,7–5,1 mdr. Rak CAGR från boomen
(−15,3 %/år netto) är vilseledande — **CAGR-fälten bär konsekutiv post-boom-bas FY23→FY25**
(oms +3,23 % · netto +2,50 % = den normaliserade bilden). NTR/AEM-klassens spegelvända situation:
där var bottenbasen problems, här är boomstoppsbasen problems — samma doktrin, båda riktningar.

**Kvalitetsprofilen:** ROIC 8,90 % ÖVER WACC 7,41 % (värdeskapande logistik) · ROE 20,10 % ·
räntetäckning 8,36 · Piotroski 7 · Altman 2,63 varningszon (leasad logistikbalans — flygplan/fordon
— som datafakta) · prognosTillväxt +10,95 % (spår-PEG 1,18 mot källans 1,29 — vågens närmaste
kalibrering) · utdelning 2,15 EUR (4,42 %) · rappdag Q3 est. tidigt november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 276→277 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, trettonde körningen) | GRÖN 277-läget · K2 round-trip · totalt n 264→265 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 277 bolag · 497 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (DHL.DE), kirurgisk append 276+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 277-läget
- `verktyg/_r211-u15-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U15-DHL-DEUTSCHEPOST-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 211-rad

## KÖ

1. Cellmotiverade kvar: Japans fyra enbolagsceller (material/halso/industri/energi), Tysklands
   resterande 1-grenar (energi RWE+? · kommunikation DTE+? · fastighet VNA+? · material BAS+?).
2. Rappdagarna 10-20→11-04 → v172-kön (DHL Q3 tidigt november med vid kalenderberöring).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; pandemibooms-brottet dokumenteras så att CAGR aldrig
läses som strukturell nedgång (normalisering) eller boom som normaltillstånd — ärlighetsprincipen
i båda riktningarna.
