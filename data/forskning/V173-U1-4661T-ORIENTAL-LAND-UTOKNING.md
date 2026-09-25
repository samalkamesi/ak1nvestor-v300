# V173 dataset-djup — U1: ORIENTAL LAND 4661.T (Japan/konsument, +1 bolag)

**Våg:** v173 dataset-djup (evighetskatalogens spår 2, PIPELINE-KO-rotationen) · **Rond:** 195
**Postmall:** "Utöka dataset <bransch/språk>: +<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** S2-U3-JAPAN-KONSUMENT-KOMPLEMENT-OMG20.md — "Oriental Land 4661.T (P/E 36,67,
Consumer Discretionary) — P/E-bärande alternativ, avsändat" (fritt i universumet, konfirmerat
före append: 4661.T fanns ej, disken 262 bolag).

## VAD DENNA LEVERANS ÄR

Universumets första v173-utökning: **262 → 263 bolag** — Oriental Land Co., Ltd. (temaparker,
Tokyo Disney Resort-operatören) i **Japan/konsument** (38→39 i branschen; cellens femte
affärsmodell: bil · närbutik · tobak · hushåll · plagg + nu **temaparker**). Dataset-ytorna är
datadrivna ur `data/portfolj-system/bolagsunivers.json` (src/lib/dataset-medianer.ts +
dataset-aspekter) — utökning = kirurgisk radappend + llms-HELREGEN + läckagevakt; INGET
manuellt bygge (prod-synken äger bygget, V209-konventionen).

## KÄLLDATA (StockAnalysis TYO, hämtat 2026-09-25)

Tre paneler (översikt + statistics + financials), färshämtning med cache-bypass — **en cached
Jan-2025-kopia (P/E 50,53) avvisades först**; inaktuella tal kommer aldrig in i universumet.
Intradag 2026-09-25 09:25 JST delayed: pris 2 967,50 JPY (+0,37 %).

**Repliker (alla inom tolerans, skriptvaliderade — avvikelse >2 % ⇒ ABORT):**

| Tal | Källa | Replik | Not |
|---|---|---|---|
| mcap | 4,85 T | 1,64 mdr × 2 967,50 = 4 867 | 0,34 % (vägt aktietal) |
| P/E | 35,72 | 2 967,50/82,76 = 35,85 | 0,4 %; EPS-identitet 82,76 × 1,64 = 135,73 vs netto 135,70 ✓ |
| P/B | 4,30 | 2 967,50/687,96 = 4,313 | på BVPS |
| PS | 6,72 | 4 850/721,52 | EXAKT |
| EBIT-marginal | 24,58 % | 177,36/721,52 | EXAKT |
| netto-marginal | 18,81 % | 135,70/721,52 | EXAKT |
| FCF-yield | 2,15 % | 104,26/4 850 | EXAKT |
| D/E | 0,29 | 326,30/1 127 | EXAKT |
| ROE | n/a i källa | 135,70/1 127 = 12,04 % | dokumenterad replik, nivåkalibrerad mot ROCE 12,21 % (avv 1,4 %) |

**Ärlighetsposter (redovisade öppet i raden):** prognosTillväxt **NEGATIV −1,81 %** (forward
P/E 36,38 > trailing 35,72 — konsensus väntar lägre EPS) ⇒ **peg NULL** (spår-PEG meningslös
på negativ prognos; källans 3-års PEG 8,87 som kalibreringsnot i paranoid). **COVID-brott
FY2022** (parkstängningar: netto 8,07 mdr på omsättning 275,73 mdr) gör 4-års-CAGR absurda
(oms +26,4 %, netto +97,2 %) ⇒ CAGR-fälten bär **3-årig konsekutiv bas FY2023→FY2026** (oms
13,40 % · res 14,72 %; AXA IFRS17-brott-precedensen). EK-serie saknas (balance-sheet-panel ej
hämtad) ⇒ serier.egetKapital tomt.

**Övrigt:** nettokassa 234,37 mdr JPY · räntetäckning 61,01 · Altman 7,89 · beta 0,31 ·
utdelning 16,00 JPY (0,54 %, payout-replik 19,33 %) · analytikerläge Hold 14 st medelmål
3 279,23 (datafakta, ej rekommendation) · **nästa rapport 2026-10-29 (Q2 FY2027) — v172-könotis**.

## KVD (allt skriptbelagt, kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append (`_r195-v173-universum-inlagg.mjs`) | GRÖN 262→263 · 0 gamla rader förändrade · läs-tillbaka ×2 · indent bevarat · fältstruktur == 4452.T-mallen |
| llms HELREGEN (`_r195-v173-llms-regen.mjs`, kropp _s2u1o30) | GRÖN 263-läget · K2 round-trip · konsument P75 24,5→**26,1**, n 37→38 · resCAGR n 35→36 · totalt n 250→251 · **10 aspektrader bevarade** |
| Läckagevakt v3 (`_r195-v173-lackagevakt.mjs`) | GRÖN 0 träffar — 263 bolag · 474 sökningar · dataset-html + llms Dataset-sektionen |
| tsc --noEmit | **0 fel** (src orörd — ren dataleverans) |
| Prod HTTP | **200 ×5**: / · /dataset · /dataset/konsument · /llms.txt · localhost /dataset |
| Sektionsformatmall | _s2u1o30 (GENERISK CAGR-rad — omg29/v209u3-kropparna specialfäller finans och skulle raderat 9 aspektrader; sonden skyddade) |

**Live-mekanik:** /llms.txt bär 263-läget direkt vid push (public/ serveras runtime från
prod-trädet, updateInstead). Dataset-sidornas HTML bär 262-talen tills prod-synkens nästa
bygge/ISR-revalidate (senast 24 h) — datan i git är provenansen, V209-konventionen; inget
manuellt bygge från denna våg.

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (4661.T), kirurgisk append 262+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 263-läget
- `verktyg/_r195-v173-*.mjs` — rundens instrument (sond ×2 · universum-inlägg · llms-regen ·
  lackagevakt · tsc-kvitto · prodkoll · adoption · bokföring)
- `data/forskning/V173-U1-4661T-ORIENTAL-LAND-UTOKNING.md` — detta protokoll
- Adoption: `data/rapporter/motorervalidering-2026-09-02.md` — prod-trädets rena append
  (172 rader, våg 49+52+59+60-täckning) adopterad för ren push (rond 188-mönstret)
- `worklog.md` — rond 195-rad

## KÖ ATT HUVUDAGENTEN (nästa v173-utökningar)

1. **Panasonic 6752.T** (Japan/teknik — cellen har bara 8035.T; OMG20-dokumenterad kandidat
   "P/E 39,53, sektorn Technology i källan ⇒ landar i Japan/teknik"; första
   statistics-hämtningen föll i kontextväxling — färshämtning krävs, cache-bypass).
2. **Kirin 2503.T** (P/E 11,71 men EPS +266 % engångspost-risk — kräver engångspost-analys
   före eventuellt val).
3. **4661.T rapportdag 2026-10-29** → v172-kön (kvartalsrapportsutkast från rapportdatum).
4. Ärvda könotiser (V209-protokollet): kontraktstestets ordlista-import · Maersk
   aktieantal · Yahoo-throttle.

## JURIDIKGRINDEN (2007:528)

Radnotering och paranoid bär enbart datafakta och metod ("så räknas talet"); analytikerläget
redovisas som datafakta med explicit "ej rekommendation"; negativa tal (prognosTillväxt,
COVID-brottet) redovisas öppet — ärlighetsprincipen: osatt ≠ noll, mätt negativ = mätt.
llms-raderna bär kvarstående "Pedagogisk referens — inte investeringsrådgivning".
