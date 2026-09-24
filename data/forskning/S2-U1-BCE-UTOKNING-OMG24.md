# Protokoll S2-U1-BCE-UTOKNING-OMG24 — Kanada/kommunikation 0→1, universumets första rena TSX/CAD-rad

**Manifest:** auto-s2-1789927508250 (byggare 1/3, omgång 24) · **Datum:** 2026-09-20 · **Agent:** s2-u1
**Universum:** 231→232 (min rad; diskens läge vid commit 237 med syskonens ride-alongs) · **Objekt:** BCE Inc. (TSX:BCE, Toronto-primär, CAD, dec-bokslut)

## 1. Koordinatval (anspråk FÖRE arbetet — data/vakten/auto-s2-1789927508250-s2-u1-ansprak.md, gitignorerad)

- **Sondering FÖRE val (BP:s Aramco-mönster):** kö-notisens (omg23 s2-u3) förstanamn **TEF.MC sonderades
  först — AVVISAD: TTM-netto −3 570 M EUR, källans eget P/E-fält n/a, FY2025 −4 580 M EUR** = P/E-bärar-
  kriteriet faller (Sony/Honda-fällan; Vestas-före-Ørsted-logiken). BP-protokollets FIFO-alternativ **VOD.L
  sonderad — AVVISAD samma skäl** (TTM −346,65 M, P/E n/a).
- **VAL: TSX:BCE** — kö-notisens andrakoordinat, sonderad GRÖN: (a) **Kanada/kommunikation 0→1** — Kanadas
  3:e gren (finans RY · energi CNQ); (b) magnet: Bell Canada 1880 — telefonens historiska förgrening,
  universumets äldsta bolagkonto jämte 1888-HUL; (c) **P/E-bärare** uppfylld: P/E 4,60 på TTM-netto
  +6 270 M CAD; (d) kanal: SA TSX-primär — universumets FÖRSTA rena Toronto/CAD-rad (RY/CNQ bär NYSE-USD).
- **Syskon-koordinater:** u2:s anspråk OR.PA + 000660.KS (läst), u3:s anspråk Japan/kommunikation-trion
  (läst) — noll överlapp med BCE; deras rader landade på disk under mitt fönster (race, se §4).

## 2. Dataunderlag (källor, hämtade 2026-09-20)

1. **StockAnalysis** `/quote/tsx/BCE/` (+ /statistics/ + /financials/ + /financials/balance-sheet/ +
   /financials/cash-flow-statement/ + /dividend/) — underlag S&P GMI + Fiscal.ai; close 2026-09-18 16:00 Toronto.
   CF-sidan krävde två WebFetch-försök (första tom — Mizuho-precedensens två-ytor-fenomen); webReader-vintagen
   (Capital IQ-mall, når sep-24) dubbelbevisar FY2021–23 identiska.
2. **Yahoo Finance chart-API** `BCE.TO` — paranoid kurskoll: 30,90 CAD mot SA 30,90 = **0,00 % band**
   (identisk close; dagens spann 30,50–31,06 och prev 31,20 matchar).

**Valuta-konvention:** TSX-primär i CAD (pris, mcap, samtliga serier — ingen FX-brygga behövs; renaste
valutasituation i universumet: allt i en valuta).

## 3. Aritmetikgrind — 21/21 GRÖNA (FÖRE skrivning; verktyg/_s2u1o24-radbyggare.mjs)

Körning 1 fångade **1 eget fel** (BCE14: FY2025-betalda utdelningar blandad med TTM-basen) ⇒ ABORT filen
orörd, rättat, omkört 21/21. Nyckelidentiteter:

- **BCE1/2** aktiebas: 30,90×0,93253 mdr = 28,82 mdr (0,02 %) · P/E 30,90÷6,72 = 4,601 mot 4,60 (0,03 %)
- **BCE3 BAS-KORSBEVIS** P/B 1,19 ⇒ basen 24,2 mdr = D/E 1,73:s bas 41,78÷1,73 = 24,2 — SAMMA total-EK-bas;
  common-basen 22,14×0,93253 = 20,6 mdr ger P/B 1,40/D/E 2,02 (BAS-SPLITTRA dokumenterad, HUL/AMT-konventionen)
- **BCE10 prognosTillväxt −62,3 %** (trailing 4,60 one-off-upphöjd mot normaliserad fwd 12,20) — **SPEGELVÄND
  mot BP:raden** (trailing dyr/fwd billig); PEG null (negativ tillväxt ⇒ meningslös; källans PEG 9,14 på
  3-års-EPS +0,91 % som not)
- **BCE12 resCAGR +23,5 % endpoint LJUGER UPPÅT** (2 709→6 305 — MLSE-försäljningsvinsten ~+4,8 mdr CAD bär
  FY2025; pretax-marginal 30,98 % >> operativ 21,71 % bevisar den icke-operativa bäraren) — endpoint-fällans
  andra riktning: BP −84 % ljuger nedåt, BCE +23,5 % uppåt = lärarparet i samma spårfamilj
- **BCE13 moat-bandet** bruttomarginalserie 43,01/43,55/43,91/44,78/45,05 % — medel 44,06, spread 2,04 pp:
  infrastruktur-moatets stillastående band (BP:s råvaruband 6,6 pp som kontrast)
- **BCE14 utdelningsvolym** DPS 1,75×0,93253 = 1,632 mdr = TTM dividends-paid 1 778 − preferens 146 = 1 632
  EXAKT (0,006 %)
- **BCE15 fcf 6/6 positiva** med varje års OCF−capex EXAKT (3 156/3 232/3 365/3 091/3 293 + TTM 2 657);
  capex-trappa 4 852→3 700 (fibreråret FY2021 = taket, −24 %/år)
- **BCE16 EV-replik EXAKT**: 28,82+41,78+**PREFERENSER 3,52**−0,48 = 73,64 — preferensposten är EV-gapets
  bärare (preferensutdelningar 146–180 M/år lever; dokumenterad)
- **BCE18 aktiebas +1,48 %/år** (DRIP-maskinen; BP:s −5,94 %-återköpsmaskin spegelvänd)
- **BCE19/20** netto>0 P/E-bärare (one-off-dokumenterat; normaliserad fwd-EPS 2,53 ⇒ netto-normal ~2,36 mdr
  > 0) · payout 26,03 % på one-off-EPS mot normaliserad 69,2 %

## 4. Append — kirurgisk, race-dokumenterad (verktyg/_s2u1o24-append.mjs)

Diskens läge vid append: **233** (u2:s OR.PA + 000660.KS hade landat under fönstret — race 14) ⇒ append
233→234, **0 befintliga rader förändrade** (bevis: bit-identisk stringify-prefix), kanonformat indent 2,
readback GRÖN: BCE sist, land=Kanada bransch=kommunikation valuta=CAD. Vid llms-regen var disken **237**
(u3:s 9432.T/9434.T/4751.T landade under fönstret) — HELREGEN bygger på diskens faktiska läge per design
(konvergent, idempotent; omg13–23-precedenserna). **Commit enligt CLOBBER-kuren omg13/15/23:** hela
237-läget committas i EN sekvens — syskonens 5 rader ride-along i min commit med ägarskapet bokfört här:
OR.PA/000660.KS = s2-u2, 9432.T/9434.T/4751.T = s2-u3 (BASF-precedensens spegelbild).

## 5. Medianer + kvartiler + universumjämförelse (verktyg/_s2u1o24-medianer.mjs, raknaBranschMedianer-replik)

Mina raders effekter (FÖRE 231-disk → EFTER min rad; syskonen tillkommer konvergent i regen):

| Yta | FÖRE | EFTER (min rad) |
|---|---|---|
| **TOTALT P/E** | 20,5 (kv 14,3–29,2, n 221 på 231) | 20,5 (kv 14,3–29,1, n 222) — BCE rank 3/222 |
| **kommunikation P/E** | 17,6 (kv 11,9–25,4, n 17) | **16,9 (kv 11,7–24,5, n 18)** — medianen −0,7 av BCE:s one-off-botten |
| kommunikation P/B | 2,7 (kv 1,7–4,4, n 19) | 2,5 (kv 1,6–4, n 20 — BCE 1,19 rank 2/20) |
| kommunikation resCAGR | 7,7 % (kv −2,1–37,7, n 12) | 9,0 % (kv −0,7–37,6, n 13 — BCE +23,5 % i toppen) |

**BCE i grenen:** P/E 4,60 = **grenens NYA BOTTEN** (rank 1/18, under CMCSA 7,36) — med dokumenterad
källspridning: fältet bär one-off-EPS 6,72; pretax>operativ-marginalen bevisar engångsbäraren. Universum-
jämförelseraden: **trailing-multipeln billigast i grenen MEN normaliserad fwd 12,20 = mitt i trappan**
(T 8,59 … TMUS 17,63) — multipeln ljuger om vinstens kvalitet; det är radens pedagogiska kärna.
**Kvartilplacering:** universumets P/E-trappa rank 3/222 (bottenkvartilen), P/B 1,19 näst lägst i grenen.

## 6. llms.txt HELREGEN (verktyg/_s2u1o24-llms-regen.mjs — omg23-kroppen ordagrant)

Sektionen ombyggd på diskens 237-läge (konvergent med syskonen): huvudrad 237 bolag, totalt median P/E 20,4
(n=227); kommunikation-raden 23 bolag P/E 16,2 (kv 11,9–21,9, n=21). **Prod round-trip LIVE:** curl bär
"237 bolag i 10 branscher … totalt median P/E 20,4 (n=227" — disk == prod.

## 7. Läckagevakt v3 — GRÖN, 0 träffar (verktyg/_s2u1o24-lackagevakt.mjs)

422 sökningar (237 bolags namn+tickers); 3 dataset-html-filer + llms.txt Dataset-sektionen bevakade = 0 träffar.

## 8. Prod-sond — 200 × 4 (OOM-loopen från BP-fönstret är LÄKT)

- `/` = **200** · `/llms.txt` = **200 LIVE på 237-läget** · `/dataset` = **200** · `/dataset/kommunikation` = **200**
- (BP-protokollets 500-manifestfel var prod-synkens OOM-loop — sidorna byggda igen i aktuell .next-yta.)

## 9. KVD-sammanfattning

GRÖN: aritmetik 21/21 i abort-grind FÖRE skrivning (1 eget fel fångat i körning 1) · append kirurgisk
bit-identisk prefix + readback · llms HELREGEN konvergent på diskens läge · läckagevakt 0 (422 sökningar) ·
prod 200 × 4 inkl. dataset-sidorna · **INGA nya URL:ar** (Kanada saknar land.ts-modul; kommunikation/kanada
matta 1 < 5; sitemap dynamisk) · src orörd = INGET bygge (Vonovia-precedensen; tsc bärs av pre-commit-
grinden) · R2 orörd · data/blogg/ orörd · anspråk gitignorerad (omg14-läxan) · FIFO BCE Q3 **2026-11-05**.

## 10. Kö-notiser till nästa omgång

- Spanien/kommunikation (TEF) och UK/kommunikation (VOD.L) sonderade och **P/E-döda i dagsläget** — cellerna
  kräver källvändning (TTM>0) ELLER P/E-bärande alternativ (Spanien: Cellnex/Redeia? UK: BT?) innan öppning.
- Kanada/kommunikation 1→2/3 mot matta 5: RCU Rogers + TELUS (båda P/E-bärare sannolikt) — ny landsida
  möjlig på +4; även Kanada/material (NTR/AEM/ABX) och Kanada/industri (CNR/CPKC) öppna celler.
- CF-sidans två-mallar-fenomen (Financial.ai når TTM, Capital IQ når sep-24) återkom — konventionen
  (bära Financial.ai-vyn, dubbelbevisa överlapp) nu dokumenterad i två protokoll (Mizuho + detta).
