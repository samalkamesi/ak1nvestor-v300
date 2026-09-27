# V173 dataset-djup — U16: SHIN-ETSU CHEMICAL 4063.T (Japan/material, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 212 · **Föregångare:** U1–U15
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Japan/material-cellens **två affärsmodeller**: Nippon Steel
(bulkstål) + Shin-Etsu Chemical (specialkemi/kisel — världens största kiseltillverkare:
halvledarwafer + silikon). **P/E-bärarkontroll FÖRE leverans: TTM-netto 725 mdr JPY > 0 — GRÖN.**
Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TYO 4063, hämtat 2026-09-25 + TRE kompletterande hämtningar)

TYO-primär i JPY; mars-bokslut (etikett = slutår). Pris 6 624 JPY; mcap 9 726 mdr på 1 468,4 M
aktier. Första översiktsläsningen bar inkoherenta tal — skärpningen krävde tre kompletterande
hämtningar (dokumenterat i källraden).

**P/E-fallet — rundens metodkärna:** källans statistics-rad P/E 19,34 är **internt inkonsistent**
med källans egna EPS/nettomarginal/mcap/aktier. Fältet bär därför aktiebas-repliken
6 624/494 = 13,42, **låst av fyra oberoende källtal**: mcap 0,01 % EXAKT · PS EXAKT (3,34) ·
netto-M EXAKT (24,91 %) · payout ✓ (30,4 mot 30,10). Källraden dokumenteras som avvikande
(troligen GAAP-jp-fönster mot IFRS-serien). **prognosTillväxt sätts NULL** — med tvistande P/E-bas
vore trailing/fwd-beräkning basblandning (källans fwd 17,42/PEG 0,81 enbart referens i paranoid).
Ärlighetsprincipen: osatt hellre än oärligt tal.

**Vågens sjätte brottsfria rad — och den starkaste:** FY-serien stiger **på samtliga fyra mått
varje år** (omsättning, netto, FCF, EPS — ingen enda nedgång): rak CAGR oms +7,59 % · netto
+14,03 %. Halvledarboomens kiseltillgång + silikondiversifiering.

**Kvalitetsprofilen:** ROIC 7,35 % ÖVER WACC 5,75 % · räntetäckning 53,67 (!) · **Altman 4,11**
· Piotroski 7 · D/E 0,59 · FCF-yield 5,88 % · utdelning 150 JPY (2,26 %, payout 30,10 %) ·
buyback 0,75 % aktiv · rappdag Q2 FY2026 est. november → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 277→278 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, fjortonde körningen) | GRÖN 278-läget · K2 round-trip · totalt n 265→266 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 278 bolag · 499 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (4063.T), kirurgisk append 277+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 278-läget
- `verktyg/_r212-u16-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U16-4063T-SHINETSU-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 212-rad

## KÖ

1. Japans kvarvarande enbolagsceller: halso (4502.T Takeda +?), industri (6301.T Komatsu +?),
   energi (1605.T INPEX +?).
2. Tysklands resterande 1-grenar (energi/kommunikation/fastighet/material).
3. Rappdagarna 10-20→11-04 → v172-kön (4063 Q2 FY2026 est. november med vid kalenderberöring).
4. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; P/E-tvisten dokumenteras fullt (fyra låsande repliker
mot källraden) så att ingen läsare luras av antingen 13,4 eller 19,3 utan kontext;
prognosTillväxt-NULL:en är ärlighetsprincipen — osatt ≠ gissat.
