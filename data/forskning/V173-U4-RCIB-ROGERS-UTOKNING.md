# V173 dataset-djup — U4: ROGERS COMMUNICATIONS RCI-B (Kanada/kommunikation, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 198 · **Föregångare:** U1 4661.T · U2 6752.T · U3 TELUS (+Kirin avvisad)
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 kö-notisens FÖRSTAKOORDINAT ("Kanada/kommunikation
1→2/3: RCU Rogers + TELUS (båda P/E-bärare sannolikt)") — TELUS togs i U3, Rogers är
andrakoordinatens förstanamn. **P/E-bärarkriteriet kontrollerat FÖRE leverans enligt
Sony/Honda-doktrinen: TTM-netto +1 838 M CAD > 0, P/E mätt 15,92 — GRÖN.** Kollisionskontroll
exakt-match mot disk (rond 197:s läxa): RCI-B/RCI/RCU/Rogers — ingen träff.

## KÄLLDATA (StockAnalysis TSX RCI.B, hämtat 2026-09-25)

Tre paneler (översikt + statistics + financials), färshämtning direkt med cache-bypass.
TSX-primär klass B i CAD (BCE/TELUS-precedensen). Intradag 2026-09-25 delayed: 49,28 CAD.

**Repliker (alla inom tolerans, skriptvaliderade):**

| Tal | Källa | Replik | Not |
|---|---|---|---|
| mcap | 26,50 mdr | 536,7 M × 49,28 = 26,45 | 0,2 % ✓ |
| P/E | 15,92 | 49,28/3,10 = 15,90 | EXAKT på källans EPS-bas; EPS-identitet 1 838/536,7 = 3,425 gäller netto inkl. NCI (~174 M) — bas-skillnaden dokumenterad |
| netto-M | 9,07 % | 1 838/20 269 = 9,066 % | EXAKT |
| FCF-yield | 1/P/FCF = 2,821 % | 748/26 500 = 2,823 % | EXAKT |
| payout | 58,11 % | 2,00/3,10 = 64,5 % | dokumentklass |

**Ärlighetsposter (redovisade öppet):**
- **SHAW-BROTTET FY2023:** förvärvet (april 2023, ~26 mdr CAD) ger omsättningshoppet +25,5 %
  i ett steg (struktur, ej organiskt) och FY23-nettot 2 557 M bär fair value-engångsposter.
  CAGR därför på **2-årig konsekutiv post-Shaw-bas FY2023→FY2025** (oms +3,29 % · netto
  −16,82 % — nettofallet är aritmetik mot engångspoståret, dokumenterat); en 3-årig rak bas
  (+10,2 %) skulle misstolka Shaw-hoppet som tillväxt (AXA-brott-precedensen).
- **FCF-kollapsen FY2025:** 748 M mot 2 446 M (FY24) = capex-/spectrumcykel (5G-expansionen) —
  syns i P/FCF 35,45; FCF-marginal 3,7 %.
- **ROIC 3,91 % under WACC 6,79 %** — telekom-JV-struktur med minoritetsavdrag i kapitalbasen.
- **Altman 1,73 (varningszon)** som datafakta (Piotroski 6 bredvid); nettoskuld 28,63 mdr CAD.
- prognosTillväxt +20,61 % (fwd 13,20 mot trailing 15,92; spår-PEG 0,77).

**Övrigt:** ROE 14,43 % · brutto 55,55 % · EBIT-M 18,86 % · D/E 1,79 · räntetäckning 2,54 ·
utdelning 2,00 CAD (4,05 %) · rappdag est. **2026-10-22** (Q3) — v172-könotis (samma dag som
TMUS est.) · kommunikation-cellen 25→26 · Kanada 4→5 (rättCellräkning från start — r196:s
paranoid-läxa tillämpad före skrivning denna gång).

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append (`_r198-v173u4-universum-inlagg.mjs`) | GRÖN 265→266 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (U3-instrumentet, diskdrivet) | GRÖN 266-läget · K2 round-trip · kommunikation n 23→24, antal 26 · totalt n 253→254 · 10 aspektrader bevarade |
| Läckagevakt v3 (U3-instrumentet) | GRÖN 0 träffar — 266 bolag · 480 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | körs i avslutskriptet (200-krav; adoptionsgren om prod-trädet smutsigt) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (RCI-B), kirurgisk append 265+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 266-läget
- `verktyg/_r198-v173u4-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U4-RCIB-ROGERS-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 198-rad

## KÖ

1. Kanada/material (NTR/AEM/ABX) och Kanada/industri (CNR/CPKC) — BCE §10:s öppna celler
   (Kanada 5 bolag; kommunikation vid matta 5 efter U4 — cellens tredje gren klar).
2. Rappdagar: 4661.T 10-29 · 6752.T 10-30 · TELUS Q3 nov · RCI-B/TMUS est. 10-22 → v172-kön.
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Radnotering/paranoid bär datafakta och metod; Shaw-brottet och FCF-kollapsen redovisas öppet
(så läses CAGR rätt); inga målkurs-/rekommendationstal förs in; "ej rekommendation" gäller
analystreferenser. Negativa tal redovisas som mätta — ärlighetsprincipen.
