# V173 dataset-djup — U6: CANADIAN NATIONAL RAILWAY CNR (Kanada/industri, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 200 · **Föregångare:** U1 4661.T · U2 6752.T · U3 TELUS · U4 RCI-B · U5 NTR
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/industri (CNR/CPKC) — öppna celler"), förstakoordinat.
**P/E-bärarkontroll FÖRE leverans: TTM-netto 4 467 M CAD > 0, P/E 20,88 — GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TSX CNR, hämtat 2026-09-25)

Tre paneler, cache-bypass, TSX-primär CAD. Pris 157,94 CAD; mcap 98,21 mdr på 621,0 M aktier.

**Repliker:** mcap 0,13 % · **netto-M 26,18 % EXAKT** · **PS EXAKT** · **FCF-yield EXAKT (2,621 mot 2,622 %)**
· payout 0,6 % · **P/E dokumentklass:** källans 20,88 bär bolagets JUSTERADE EPS-bas (CNR:s primärmått);
GAAP-repliken 157,94/7,20 = 21,95 avviker 5,1 % — bas-skillnaden dokumenterad (Panasonic-ROE-klassen).

**Profilen — vågens andra brottsfria rad:** FY2022–FY2025 samtliga positiva utan brott eller engångsposter
(efter TELUS): rak 3-årig CAGR omsättning +0,31 % · netto +1,63 %. Klassisk järnvägskvalitet:
**ROIC 9,83 % ÖVER WACC 8,10 %** (värdeskapande — Kanada-blockets utpräglade), ROE 24,22 %,
EBIT-marginal 32,42 % (järnvägsstruktur), brutto 53,34 %.

**Ärlighetsposter:** Altman 3,00 — exakt på källans zongräns (järnvägsbalansens kapitaltäthet;
zonnot dokumenterad) · nettoskuld 20,09 mdr CAD (D/E 1,03, räntetäckning 7,49) · platt tillväxt
redovisas som platt (moat-bolag utan tillväxt — värderingen bärs av ROIC>WACC, inte CAGR) ·
spår-PEG 1,94 mot källans PEG 4,15 på 3-års (olika baser, kalibreringsnot) · prognosTillväxt +10,77 %.

**Rappdag est. 2026-10-20 (Q3)** — v172-könotis v43.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 267→268 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet instrument, fjärde körningen) | GRÖN 268-läget · K2 round-trip · totalt n 255→256 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 268 bolag · 482 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (CNR), kirurgisk append 267+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 268-läget
- `verktyg/_r200-v173u6-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U6-CNR-JARNVAG-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 200-rad

## VÅGENS LÄGE EFTER SEX UTÖKNINGAR (U1–U6)

Universum 262→268 (+6: två Japan + TELUS + Rogers + Nutrien + CNR). Kanada-blocket 3→7 bolag
(fem branschgrenar: finans, energi, kommunikation ×3, material, industri). Två avvisanden/stoppar
på vägen: Kirin (engångsposter, trebevis) och föråldrad TMUS-notis (grindfångad). Tre
handräkningsfel fångade av skriptmätning före commit (U3 cellräkning, U5 cykelbas — maskin före
hand). Instrumenten generaliserade: regen/vakt diskdrivna sedan U3.

## KÖ

1. CPKC (Kanada/industri 1→2) eller AEM/ABX (Kanada/material 1→2/3) — BCE §10:s resterande namn.
2. Rappdagar: CNR est. 10-20 · RCI-B/TMUS 10-22 · 4661.T 10-29 · 6752.T 10-30 · NTR 11-04 → v172-kön.
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; den justerade EPS-basen dokumenteras öppet (annars kan
GAAP-replikens avvikelse feltolkas som datafel); platt tillväxt redovisas som platt — ärlighetsprincipen.
