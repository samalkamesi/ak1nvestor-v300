# V173 dataset-djup — U2: PANASONIC HOLDINGS 6752.T (Japan/teknik, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 196 · **Föregångare:** V173-U1 (Oriental Land 4661.T, rond 195)
**Postmall:** "Utöka dataset <bransch/språk>: +<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md — "Panasonic 6752.T (P/E 39,53) — FALLER:
sektorn Technology i källan ⇒ hade landat i Japan/teknik" — precis cellen som hade endast 8035.T.
Konfirmerat före append: 6752.T fanns ej, disken 263 bolag.

## VAD DENNA LEVERANS ÄR

Universumets andra v173-utökning: **263 → 264 bolag** — Panasonic Holdings Corporation i
**Japan/teknik** (28→29 i branschen; Japan-cellen 21→22 bolag). Enligt U1-mönstret: kirurgisk
radappend + llms-HELREGEN + läckagevakt; INGET manuellt bygge (prod-synken äger bygget).

## KÄLLDATA (StockAnalysis TYO, hämtat 2026-09-25)

Tre paneler (översikt + statistics + financials), färshämtning direkt med cache-bypass.
Intradag 2026-09-25 09:46 JST delayed: pris 4 517,00 JPY (+0,20 %; 52v +178,36 % —
AI/datacenter-rally, 52v-range 1 553–4 982).

**Repliker (alla inom tolerans, skriptvaliderade — avvikelse >2 % ⇒ ABORT):**

| Tal | Källa | Replik | Not |
|---|---|---|---|
| mcap | 10,53 T | 2,33 mdr × 4 517 = 10 525 | 0,05 % ✓ |
| P/E | 41,57 | 4 517/108,45 = 41,65 | 0,2 %; EPS-identitet 108,45 × 2,33 = 252,7 vs netto 253,2 ✓ |
| P/B | 1,89 | 10 530/5 570 = 1,890 | EXAKT på källans bas mcap/EK (BVPS-raden bär vägt aktietal) |
| PS | 1,29 | 10 530/8 170,9 | EXAKT |
| EBIT-marginal | 6,77 % | 553,0/8 170,9 | EXAKT |
| netto-marginal | 3,10 % | 253,2/8 170,9 | EXAKT |
| FCF-yield | 2,25 % | 237,0/10 530 | EXAKT |
| D/E | 0,28 | 1 553,99/5 570 = 0,279 | EXAKT |
| ROE | 5,25 % | (källtal används) | TTM-replik netto/EK = 4,55 % — dokumenterad skillnad (källans EK-underlag annat fönster) |

**Ärlighetsposter (redovisade öppet i raden):**
- **prognosTillväxt +104,88 %** (forward P/E 20,29 mot trailing 41,57 — konsensus väntar
  EPS nästan dubblad på AI-infrastruktur/datacenter-effekten; Q1 FY2027-transkriptet bekräftar
  uppåt reviderade prognoser) ⇒ spår-PEG 0,40 (källans PEG 0,49 på 3-års som kalibreringsnot).
- **STRUKTURBROTT FY2026:** Automotive-segmentet DEKONSOLIDERAT + restrukturering
  ("Sales and profit declined in FY 2026 due to restructuring and Automotive deconsolidation")
  — FY26-nettodipen −48,2 % (189,5 mdr) bär engångs-/strukturposter; omsättningstillbakagången
  FY25→FY26 är delvis avknoppning, ej organisk. CAGR-fälten bär 4-årig HEL serie med brottet
  dokumenterat (oms +2,16 % · netto −7,18 %) — ingen bas spänner inte över brottet, därför hel
  serie + dokumentation (SMFG-konventionen) hellre än konsekutiv kortbas (AXA) som inte finns.
- **Altman 2,23 — UNDER 3** (källans egen flagga för förhöjd risk) redovisas som datafakta.
  Piotroski 7 (stark) bredvid — hälsotalen spretar, båda redovisade.
- ROIC 6,80 % under WACC 7,99 % (negativt värdeskapande TTM) — syns i radens fält som de är.

**Övrigt:** nettoskuld 436,61 mdr JPY · räntetäckning 14,77 · beta 0,85 · utdelning 54,00 JPY
(1,20 %, källans payout 36,88 %; TTM-replik 49,8 % dokumenterad) · bruttomarginalserien
stadigt stigande [28,21 → 31,51] ⇒ moat-medel 29,49 % med spread 4,51 pp · analytikerläge
Buy 16 st medelmål 4 861,19 (datafakta, ej rekommendation) · **nästa rapport 2026-10-30
(Q2 FY2027) — v172-könotis, dagen efter Oriental Land 10-29**.

## KVD (allt skriptbelagt, kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append (`_r196-v173u2-universum-inlagg.mjs`) | GRÖN 263→264 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T-mallen |
| llms HELREGEN (`_r196-v173u2-llms-regen.mjs`) | GRÖN 264-läget · K2 round-trip · teknik P75 37,5→**38**, n 28→29 · resCAGR n 25→26 · totalt n 251→252 · 10 aspektrader bevarade |
| Läckagevakt v3 (`_r196-v173u2-lackagevakt.mjs`) | GRÖN 0 träffar — 264 bolag · 476 sökningar · dataset-html + llms Dataset-sektionen |
| tsc --noEmit | **0 fel** (src orörd — ren dataleverans) |
| Prod HTTP | **200 ×5** (före push; efter push verifieras live-rubriken) |
| Prod-trädet rent | 0 M-rader (ingen adoption behövdes denna rond — U1:s motorervalidering var enda M) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (6752.T), kirurgisk append 263+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 264-läget
- `verktyg/_r196-v173u2-*.mjs` — rundens instrument (universum-inlägg · llms-regen · lackagevakt)
- `data/forskning/V173-U2-6752T-PANASONIC-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 196-rad

## KÖ ATT HUVUDAGENTEN

1. **Kirin 2503.T** (Japan/konsument-komplementets sista dokumenterade kandidat — P/E 11,71
   men EPS +266 % engångspost-risk; kräver engångspost-analys före val).
2. **Rapportdagar 10-29 (4661.T) och 10-30 (6752.T)** → v172-kön: kvartalsrapportsutkast
   från rapportdatum (kalendrarna i data/blogg-utkast/kvartal/2026-q3/).
3. Ärvda könotiser (V209-protokollet): kontraktstestets ordlista-import · Maersk
   aktieantal · Yahoo-throttle.

## JURIDIKGRINDEN (2007:528)

Radnotering och paranoid bär enbart datafakta och metod ("så räknas talet"); analytikerläget
redovisas som datafakta med explicit "ej rekommendation"; negativa tal (resCAGR −7,2 %,
Altman under 3, ROIC under WACC, strukturbrottet) redovisas öppet — ärlighetsprincipen:
osatt ≠ noll, mätt negativ = mätt. llms-raderna bär kvarstående "Pedagogisk referens —
inte investeringsrådgivning".
