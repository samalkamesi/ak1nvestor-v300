# V173 dataset-djup — U8: AGNICO EAGLE MINES AEM (Kanada/material, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 202 · **Föregångare:** U1–U7 (4661.T · 6752.T · TELUS · RCI-B · NTR · CNR · CP)
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U1-BCE-UTOKNING-OMG24 §10 ("Kanada/material (NTR/AEM/ABX)"), andranamnet.
**P/E-bärarkontroll FÖRE leverans: TTM-netto 2 048 M USD > 0, P/E 31,55 — GRÖN.** Kollisionskontroll exakt-match GRÖN.

## KÄLLDATA (StockAnalysis TSX AEM, hämtat 2026-09-25)

Tre paneler + kompletterande FCF-panel (första FY25-FCF-läsningen oläsbar — kompletteringen är
dokumenterad i källraden), cache-bypass. **Valuta-mix enligt NTR-mönstret:** CAD-pris/utdelning,
USD-rapportering; källans EPS-rad CAD-konverterad (3,23) — P/E EXAKT replikerbar på den basen.

**Repliker:** mcap 0,04 % EXAKT · **P/E EXAKT** (101,86/3,23 = 31,54) · **netto-M EXAKT (23,79 %)**
· **FCF-yield EXAKT (2,333/2,334 %)** · payout 1,3 % · FCF-marginal fältlagd 13,8 % (källans
"2,33 %-rad" är yield — fältlagningen rätt, dokumenterad).

**Guldcykeln (FCX/VALE/NTR-precedenserna):** uppgången är PRISDRIVEN (TTM rev +25,7 % på
guldboomen) — rak 3-årig CAGR FY22→FY25 (oms +13,65 % · netto +19,58 %) med cykelnot; samtliga
FY positiva utan brott (boomfas utan bust); FY25-nettodippen mot FY24 = kostnadsläge, dokumenterat.

**Profilens starka sida:** **Altman 4,89 — vågens sundaste balans** (U1–U8:s klara topp; jämför
blockkollegorna BCE 2,29 · TELUS 1,55 · RCI-B 1,73 · CP 2,69) · D/E 0,25 · räntetäckning 14,66.
Ärlighet öppet: ROIC 5,41 % under WACC 6,53 % (gruvkapital bland de tyngsta) · payout 77,55 %
(hög utdelningsandel av vinsten) · 52v-intervallet 71–105 visar rallyt (beta 0,74) ·
spår-PEG 2,99 · prognosTillväxt +10,55 %.

**Rappdag Q3 est. slutet oktober** — v172-könotis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 269→270 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T |
| llms HELREGEN (diskdrivet, sjätte körningen) | GRÖN 270-läget · K2 round-trip · totalt median P/E 20,4→**20,5** (guldtiltäget syns i universummedianen), n 257→258 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 270 bolag · 484 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (AEM), kirurgisk append 269+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 270-läget
- `verktyg/_r202-v173u8-*.mjs` — sond/inlägg/avslut
- `data/forskning/V173-U8-AEM-AGNICO-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 202-rad

## VÅGENS LÄGE EFTER ÅTTA UTÖKNINGAR (U1–U8)

Universum 262→270 (+8). Kanada-blocket 3→9 på sex branschgrenar (finans · energi · kommunikation
×3 · material ×2 · industri ×2). Balansspektrum: Altman 1,55 (TELUS) till 4,89 (AEM) — cellens
pedagogiska bredd. Två avvisande/stoppar, tre handrättningsfel fångade av skript, instrumenten
generaliserade. Universummedianen P/E rörde sig 20,4→20,5 för första gången under vågen.

## KÖ

1. ABX (Barrick — Kanada/material 2→3, BCE §10:s sista namn) eller rotation.
2. Rappdagarna 10-20→11-04 → v172-kön (sex av vågens åtta bolag rapporterar i fönstret).
3. Kirin-omprövning when normaliserad TTM (villkor i V173-U3).

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; guldcykeln dokumenteras som prisdriven så att CAGR
aldrig feltolkas som strukturell; ROIC/WACC och payout redovisas som mätt — ärlighetsprincipen.
