# V173 dataset-djup — U26: ROLLS-ROYCE HOLDINGS RR.L (Storbritannien/industri, +1 bolag)

**Våg:** v173 dataset-djup (spår 2) · **Rond:** 222 · **Föregångare:** U1–U25
**Postmall:** "+<n> bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200"
**Kandidatur:** cellmotiverad duo — Storbritannien/industri-cellens **två affärsmodeller**:
BAE Systems (BA.L, försvarsplattformskontraktör — orderbacklog-modellen) +
Rolls-Royce (RR.L, motorer + aftermarket-tjänster — motorn-och-bladet). **P/E-bärarkontroll
FÖRE leverans: TTM-netto 3 038 M GBP > 0 — GRÖN.** Kollisionskontroll primär+sekundär
(AZN-läxan från rond 221: RR.L/RR/RYCEY + namn + käll-URL) — GRÖN.

## KÄLLDATA (StockAnalysis LON RR, hämtat 2026-09-25, fyra paneler)

LSE-primär; prisfältet i PENCE (BA.L/HSBA-cellkonventionen), mcap i GBP mdr. Pris
1 503,2 GBp (föregående close; spann 1 464,4–1 499,8); mcap 123,16 mdr GBP på
8,30 mdr aktier.

**Segmentlåset — vågens första:** Original Equipment [6 273 · 7 635 · 8 389 · 9 103] +
Aftermarket Services [7 247 · 8 851 · 10 520 · 12 104] summerar **exakt** mot
omsättningen samtliga fyra år — motorn-och-bladet: tjänsteandelen 53,6 % → 57,1 %.
Cellens pedagogiska kärna mot BAE:s orderbacklog.

**Elva replikeringslås:** PS 5,32 EXAKT (0,06 %) · P/B 42,73 EXAKT (0,07 %) ·
**EV-dekomposition 0,02 % REN MED NETTO-KASSA** (123,16 + 4,37 − 6,48 = 121,05 mot
121,07 — RR står i netto-kassa +2,11 mdr, mot DSV:s −85 mdr i samma cell: två
balansmodeller i industri-cellen) · netto-M 13,11 % EXAKT · FCF-M 19,26 % EXAKT ·
FCF-yield 3,62 % DUBBELT EXAKT (källrad + 1/P·FCF) · D/E 1,52 · EPS×aktier 1,6 % ·
mcap 1,3 % · EV/Earnings 39,85 EXAKT · FCF-serien. P/E-familjen dokumenterad:
källans rad 41,02, GAAP 40,5, pris/EPS 41,8 (EPS-raden 0,36 avrundad från 0,366).

**Engångskontrollen per fönster (Kirin-U3-doktrinen):** FY2025 netto 5 841 med
netto-M 27,5 % **över** EBIT-M 19,8 % = finanspost/avyttring under EBIT-linjen —
engångskaraktären dokumenterad. **TTM-fönstret som bär fälten är normaliserat**
(netto-M 13,11 % < EBIT-M 20,72 %, ordning OK) — fälten godkända.

**FCF fyra år rakt:** [1 165 · 2 056 · 3 263 · 3 944] + TTM 4 461 — stigande varje år,
rak CAGR +50,2 %; serien intern låst (OCF − capex exakt i samtliga fem fönster).

**Serieprofiler:** oms [13 520 · 16 486 · 18 909 · 21 207] (rak CAGR +16,25 %) ·
netto [−1 269 · 2 412 · 2 521 · 5 841] — **resultatCAGR NULL på negativ bas**
(Vonovia-precedensen: pandemiförlusten FY2022; vändningen dokumenterad i stället).
EPS [−0,15 · 0,29 · 0,30 · 0,69]. Utdelning 0,12 GBP (0,81 %) med källans payout
26,17 % (EPS-bas-repliken 33,3 % på avrundat EPS, noterad) · återköp 0,70 %
(aktieantal −0,70 %) ⇒ nyemissioner 0 · 52v +27,49 % · beta 1,19 · Altman 2,78 ·
Piotroski 6 · räntetäckning 19,12.

**Metodnoter:** ROE 114,48 % och ROIC 470,58 % är källans rader och strukturellt
sanna men historiskt betingade — det tunna EK:t (2,88 mdr) gör avkastningstal
oansenliga som jämförelsetal (ROCE 24,79 % är det jämförbara); P/B 42,73 samma
struktur. WACC 10,56 %. fwd P/E 32,02 ⇒ implied EPS +28 % (referens).
Rappdag est. 2026-11-12 — strax utanför v172-fönstret (10-20→11-04), notis.

## KVD (kvitton i /tmp)

| Kontroll | Resultat |
|---|---|
| Universum-append | GRÖN 287→288 · 0 gamla rader förändrade · läs-tillbaka ×2 · fältstruktur == 4452.T · elva lås + segmentlås på första försöket |
| llms HELREGEN (diskdrivet) | GRÖN 288-läget · K2 round-trip · industri-raden n=28 (median P/E 28) · totalt n 275→276 · 10 aspektrader |
| Läckagevakt v3 | GRÖN 0 träffar — 288 bolag · 519 sökningar |
| tsc --noEmit | **0 fel** (src orörd) |
| Prod HTTP + push | i avslutskriptet (200-krav; adoptionsgren) |

## LEVERANSER

- `data/portfolj-system/bolagsunivers.json` — +1 rad (RR.L), kirurgisk append 287+/0−
- `public/llms.txt` — dataset-sektionen HELREGEN på 288-läget
- `verktyg/_r222-u26-*.mjs` — sond/inlägg/avslut + llms-regen/lackagevakt
- `data/forskning/V173-U26-RR-ROLLSROYCE-UTOKNING.md` — detta protokoll
- `worklog.md` — rond 222-rad

## KÖ

1. Rappdagarna 10-20→11-04 → v172-kön (DSV 10-21 · Astellas 10-30 · Kirin 11-11;
   RR 11-12 strax utanför).
2. UK:s kvarvarande 1-grenar: energi (BP+Shell) · konsument (ULVR+?) · teknik (ARM+?).
3. Kanada (energi CNQ+Enbridge / finans RY+TD) · Spanien (finans Santander+BBVA) ·
   spårrotation enligt evighetskatalogen.

## JURIDIKGRINDEN (2007:528)

Datafakta utan rådgivningskonstruktioner; FY2025-engångsposten dokumenteras öppet så
fältens TTM-bas inte feltolkas som "högtillväxt"; ROE/ROIC-extremerna förklaras med
balansstrukturen (annars feltolkas 114 % som prestation); vändningen och fwd-implied
+28 % redovisas med sin natur (konsensus, aldrig löfte). Analytikerlägen syndikeras
aldrig.
