# V173 dataset-djup — U5: NUTRIEN NTR (Kanada/material, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 199 · **Föregångare:** U1 4661.T · U2 6752.T · U3 TELUS · U4 RCI-B
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/material (NTR/AEM/ABX) — öppna celler").
**P/E-bärarkontroll FÖRE leverans: TTM-netto 2 153 M > 0, P/E 17,28 — GRÖN.** Kollisionskontroll
exakt-match GRÖN (NTR ej på disk).

## KÄLLDATA (StockAnalysis TSX NTR, hämtat 2026-09-25)

Tre paneler, cache-bypass. **Valuta-mix dokumenterad:** TSX-noting med pris/utdelning i CAD,
koncernrapportering i USD — dual-valuta-konventionen (serier/marginaler USD; pris/mcap/avkastningar CAD).

**Repliker:** mcap 0,13 % · P/E 0,2 % (payout-konsistens 2,18/4,36 = 50,0 % mot källans 50,05 %
bekräftar EPS-basens CAD-konvertering) · **netto-M 8,26 % EXAKT** · **PS EXAKT** · payout ✓ ·
FCF-yield 4,20 % mot P/FCF-invers 4,09 % (fönsterskillnad, dokumentklass).

**Cykeldokumentation (FCX/VALE-precedensen) — rondens kärna:** Gödningsbranschen är priscykel:
FY2022 = kaliumtoppen (krigets prisboom, netto 7 660 M) · FY2024 = nedskrivningsdippen (744 M)
· FY2025 = återhämtning (2 153 M). CAGR-fälten bär **konsekutiv FY23→FY25-bas** (oms −5,32 % ·
netto +23,57 %) medan **cykelbasen FY22→FY25 (oms −11,74 % · netto −34,47 %) redovisas öppet**
— tillväxten är priscykel, ej strukturell expansion. (Händelsen i ronden: min handräknade
cykelbas i paranoid avvek från skriptets exakta tal — rättad kirurgiskt FÖRE commit; maskin
före hand, tredje gången denna våg.)

**Övrigt:** prognosTillväxt +1,77 % (platt) ⇒ **peg NULL** (spår-PEG 9,77 meningslös; källans
PEG 3,66 kalibreringsnot) · ROIC 5,76 % under WACC 7,13 % (kapitaltät industri) · **Altman 3,24
— Kanada-raden med sund zon** (BCE 2,29 · TELUS 1,55 · RCI-B 1,73) · D/E 0,43 · räntetäckning
8,58 · utdelning 2,18 CAD (2,90 %) · rappdag est. 2026-11-04 (Q3) → v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 266→267 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · paranoid-rättning verifierad |
| llms HELREGEN (diskdrivet instrument) | GRÖN 267-läget · K2 round-trip · totalt n 254→255 · 10 aspektrader bevarade |
| Läckagevakt v3 | GRÖN 0 träffar — 267 bolag · 481 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (NTR), kirurgisk append 266+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 267-läget
- `verktyg/_r199-v173u5-*.mjs` — sond/inlägg/rättning/avslut
- `data/forskning/V173-U5-NTR-NUTRIEN-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 199-rad

## KÖ

1. Kanada/industri (CNR/CPKC) — BCE §10:s sista öppna cell (Kanada 6; material 0→1 klar).
2. Kanada/material fortsättning: AEM/ABX (2→3 mot matta 5).
3. Rappdagar: RCI-B/TMUS est. 10-22 · 4661.T 10-29 · 6752.T 10-30 · NTR est. 11-04 → v172-kön.
4. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Cykeldokumentationen är i sig utbildningskärna: "så läses en cykelbransch CAGR" — fältvärde
och cykelkontrast redovisas tillsammans så att talet aldrig feltolkas som strukturell tillväxt.
Datafakta utan rådgivningskonstruktioner; peg NULL-doktrinen värdebärande på platt prognos.
