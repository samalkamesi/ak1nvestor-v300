# V173 dataset-djup — U12: BT GROUP BT.L (UK/kommunikation, +1 bolag) — BCE-OMG24-LISTAN SLUT

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 208 · **Föregångare:** U1–U11
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10:s UK-alternativ ("UK: BT?") — **LISTANS SISTA NAMN:
med U12 är samtliga öppna koordinater i BCE-protokollet antagna, avvisade eller levererade.**
VOD.L sonderades i OMG24 och var P/E-död (TTM −346,65 M); BT bär med +1 591 M GBP. **P/E-bärar-
kontroll FÖRE leverans GRÖN.** Kollisionskontroll exakt-match GRÖN (r206-sonden).

## KÄLLDATA (StockAnalysis LSE BT, hämtat 2026-09-25 + kompletterande FY-panel)

LSE-primär i pence (GBX; pris 205,30 = 2,053 GBP). **Mars-bokslut** (etikettkonventionen från
Japan-radera). mcap 20,41 mdr GBP på 9 940 M aktier.

**Vågens starkaste replikrad — SEX EXAKTA:** mcap 0,01 % · **P/E EXAKT** (205,30/12,89 = 15,93)
· **netto-M EXAKT (7,71 %)** · **PS EXAKT (0,989)** · **FCF-yield EXAKT (8,02/8,03 %)** ·
**payout EXAKT (63,3 %)**. P/E på källans attributable-EPS (minoritetsnot ~310 M dokumenterad).

**Ärlighetskärnan — båda sidorna av historien:** rak 3-årig CAGR är **NEGATIV** (oms −0,73 % ·
netto −10,48 % — legacy-telekomns fastlandskundsutflyttning är strukturell) och redovisas öppet,
medan prognosTillväxt +53,17 % (fwd P/E 10,40 mot trailing 15,93) bär konsensus förväntad
EPS-återhämtning när fiberrullouten mognar. FY24-dipen (1 092 M — avskrivningstoppet) följs av
FY25-återhämtning + TTM-momentum. Spår-PEG 0,30 (källans 1,23 kalibreringsnot).

**Övrigt:** Altman 1,71 varningszon (UK-telekommönstret, datafakta) · ROIC 5,71 % under WACC
7,53 % (fiberkapitalbasen) · **bruttoMarginal null** — leverantörens bruttobegrepp är osammanhängande
för telekom och fältet lämnas osatt hellre än felbaserat (ärlighetsprincipen även i fältval) ·
nettoskuld 21,78 mdr · rappdag H1 FY2026 est. slutet oktober → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 273→274 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, tionde körningen) | GRÖN 274-läget · K2 round-trip · kommunikation n 25→26 (resCAGR-median 5,8→3,5 % — BT:s negativa CAGR syns i cellen) · totalt n 261→262 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 274 bolag · 491 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (BT.L), kirurgisk append 273+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 274-läget
- `verktyg/_r208-u12-*.mjs` — inlägg/avslut (kollisionskontrollen i r206-sonden)
- `data/forskning/V173-U12-BT-BTGROUP-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 208-rad

## VÅGENS SLUTLÄGE EFTER TOLV UTÖKNINGAR (U1–U12)

Universum 262→274 (+12). BCE-OMG24:s hela koordinatlista fulländad: Rogers · TELUS · CNR · CPKC ·
NTR · AEM · ABX · Cellnex · Redeia · BT (VOD/TEF avvisade som P/E-döda i källomgången; Kirin
avvisad på tre bevis; TMUS upptagen av syskon). Kanada 3→10 · Spanien 3→5 · Japan +2 · UK 10→11.
Balansspektrum Altman 1,01–4,89; tre brottsfria serier; fyra cykel/brott-dokumentationer;
CAGR-nullen som fältvakt (Cellnex). Verktygen: regen/vakt diskdrivna, tio körningar utan avvikelse.

## KÖ

1. Ny koordinatsondering krävs (alla dokumenterade listor tomma) — Tysklands 8 enbolagsceller,
   Japans 4, eller evighetskatalogens nästa spårrotation per styrelserond.
2. Rappdagarna 10-20→11-04 → v172-kön (BT H1 est. slutet oktober med i nästa kalenderberöring).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; den negativa historiken och den positiva prognosen
redovisas sida vid sida (annars blir antingen "billigt på historiken" eller "tillväxtcase" ensidigt);
fältet bruttoMarginal null är ärlighetsprincipen i fältval — osatt ≠ noll ≠ felbas.
