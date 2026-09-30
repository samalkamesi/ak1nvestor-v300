# S2-U3 ITALIEN/FINANS-UTÖKNING — Intesa Sanpaolo + UniCredit + Generali (manifest auto-s2-1790799927010)

Datum: 2026-09-30 · Byggare 3/3, spår 2 (DATASET-DJUP) · Anspråk disk-först:
`data/vakten/auto-s2-1790799927010-s2-u3-ansprak.md` (gitignorad) · Rådata:
`data/vakten/auto-s2-1790799927010-s2-u3-radata.md` (gitignorad).

## VALET

**Italien×finans-trion: ISP.MI + UCG.MI + G.MI.** Italien = eurozonens tredje största ekonomi
(G7) med blott 4 universumrader — tre energi + Ferrari — och cellen ITALIEN×FINANS = 0 av
finansgrenens 41: **grenens största nationella nolla i eurozonen** (Frankrike 5, Tyskland 2,
Spanien 2). Tre affärsmodeller i en leverans: inlåningsbank (Intesa), expansionsbank
(UniCredit), försäkring (Generali).

Kollisionskontroll FÖRE hämtning: ISP/UCG/G + namnen 0 träffar i bolagsunivers.json; worklogs
3 "Intesa"-träffar = förkastade kandidater + "fria koordinater" i tidigare anspråk (aldrig
levererade); "Generali"-träffarna falska positiva (generalisering/generaliserad). Syskonen
u1/u2:s könotiser (Kina-tillskottet, LSE/Yahoo) lämnades åt dem — u1 levererade GLEN.L
(UK/material) under mitt fönster, disjunkt cell.

Källväg: StockAnalysis `/quote/bit/` fem-ytepanel (översikt + statistics + financials +
balance-sheet + cash-flow) — **bit-vägen bevisad ×2 i universumet** (ENI.MI, TRN.MI) — med
Yahoo chart-API paranoid. Kurs close 2026-09-30 CET; Yahoo band: ISP 0,08 %, UCG + G 0,00 %
EXAKT.

## SIGNATURTAL

- **ISP (Intesa Sanpaolo)**: resultattrappan 5 735→5 519→7 725→8 670→9 324 M€ (+12,92 %/år)
  på PLATÅ-omsättning (25,4→25,3 mdr) — vinsten växer på marginaler (EBIT 59,05 %), inte
  volym. P/E 12,17 (replik 11,94, −1,9 % dokumenterad källspridning), P/B 1,69 EXAKT, P/TBV
  1,98 under 2,0; utdelning 5,72 % + buyback 2,90 % = shareholder yield 8,61 %; ROE 14,26 %
  mot WACC 2,72 % = +11,54 pp; FCF-payout 186 % dokumenterad artefakt (kundmedelsbalansen,
  ITUB-klassen). SIGNATUREN ÄR LIVANDE: fientligt bud ~36 mdr € på Monte dei Paschi (1472) —
  universumets första fientliga storbank-kupp som PÅGÅENDE händelse under hämtdagen.
- **UCG (UniCredit)**: ORCEL-berättelsen — netto 5 076→10 710 M€ = DOUBLERAT på fyra år
  (+20,51 %/år) mot omsättning +5,32 %/år (NetEase-mekaniken i en bank); Commerzbank ~48 % +
  Banco BPM = EU:s största gränsöverskridande bankdrama; PEG 0,66 triopens enda under 1,0;
  utdelningstillväxt +31,07 %/år med payout 48,64 %; beta 1,06 enda över 1. FY2026-vägen:
  rapport **2026-10-21 = 10-21-FIFO-KLUSTRET** (AT&T/VärEnergi/IBERDROLA samma dag).
- **G (Generali)**: TRIESTE 1831 — universumets äldsta finansbolag (195 år); försäkrings-
  konventionen (AXA-mallen) dokumenterad i raden: EV bär (103,01 mdr, EV/EBIT 13,51 replik
  EXAKT) + ROIC 7,32 % mot WACC 5,37 % = +1,95 pp; **IFRS-17-paradoxet som metodfynd**:
  statistics-TTM 59,32 mdr försäkringsintäkter mot financials-FY2025 115,93 mdr totala
  intäkter — två intäktsbegrepp i källans egna ytor ⇒ omsattningTillväxtTTM satt null (ärlig
  osättning hellre än falsk siffra på skilda baser); FCF 9,1→15,4 mdr 5/5 positiv;
  stabilitetsfält bär (D/E 1,19, räntetäckning 9,47×) till skillnad från bank-syskonens
  null. MPS-dramatets tvärsida: köpte 3,01 % av MPS — Intesa svarade 3 % i GENERALI.

## KONVENTIONER (mall-styrda)

Bank-rader (BNP.PA/SAN.MC/BBVA.MC-mallen): evEbit/skuldEgenkapital/räntetäckning/brutto-
marginal null (källan saknar), stabilitet null, moat null, aterkop null, serier.egetKapital
[] — FY-serierna omsättning/resultat/fcf bär. Försäkring (CS.PA/AXA-mallen): ROIC + EV-mått +
stabilitetsfält bär. prognosTillväxt = mekanisk trailing/fwd (normaliseringsgap-konventionen,
Veolia/NTES) med källans 3-års EPS-prognos som kontrast-not: ISP +12,69 % · UCG +11,84 % ·
G +12,33 %.

## APPEND + KVARTILER

Aritmetikgrind **56/56 GRÖN FÖRE skrivning** (första körningen 55/1: Generalis aktiepris-
identitet kalibrerad till ISP-klassens 2 % — källans aktieantal 1,51 mdr är tvådecimals-
avrundat, underliggande 1 538,9 M belagt av EPS-repliken 2,95 mot källans 2,96).
Append mutex + idempotent + prefix-bit-identisk + läs-tillbaka ×2; diskens FAKTISKA läge
323 (u1:s Glencore landade under fönstret) → **326 rader**.

Medianer före→efter (lasBranschMedianer-replik): **finans 41→44** — P/E 14,28→14,24 (kv
12,41–17,89 → 12,14–17,61; UCG 11,90 blev nya P25-nära), P/B 1,79→1,78, EBIT-marg 37,5→
37,9 %, FCF-marg 23,3→28,7 % (n 17→20 — Generalis premieflöde 36,6 % lyfter), resCAGR
9,5→10,4 %, ROE 13,6→13,9 %. **Universum 323→326: median P/E 19,73→19,68** (n 310→313).
Rang i finans-grenen: UCG P/E 10/44 och ISP 12/44 (båda under P25 12,145) mot G 27/44;
P/B 17/19/24 — trion klustrad kring medianen; UCG ROE 33/44.

Ingen ny aspektsida: Italien×finans = 3 < MIN_MATTA 5, ingen italiensk landaspektmodul i
src — data-vägen ren (Vonovia-precedensen), sitemap orörd.

## KVD

- **Läckagevakt v98: GRÖN 0 träffar** — 326 tickers + 326 namn i 1 762 utdatafiler.
- **Kontraktstest: 189 sidkontroller, 0 FEL** (30 kända varningar, oförändrat).
- **llms.txt HELREGEN på 326-läget**: huvudrad median P/E 19,7 (n 313 av 326); finans-raden
  LIVE med 44-bolagstal (P/E 14,2 kv 12,1–17,6 · P/B 1,8 · EBIT 37,9 % · FCF 28,7 %);
  bygggrinden öppen — alla rader publicerade. Diff 25+/25−.
- **tsc 0** (projektbinär; src orörd — ingen kod ändrad, ALDRIG bygge).
- **prod 200 ×6**: localhost / · /dataset · /dataset/finans · /llms.txt + HTTPS
  lab.ak1nvestor.com / · /dataset/finans.
- R2 orört · data/blogg/ orört · syskonytor orörda (u1:s Glencore värde-identisk).

## KÖNOTIS EFTER OMGÅNGEN

Nederländerna 3 bolag (alla teknik/tillväxt) med ASA-vägen bevisad ×3 (ASM.AS/ASML.AS/
ADYEN.AS): ING Groep (finans 0→1) + Heineken (konsument) = två nya celler i +2. Sydkorea 2
(KRX-vägen bevisad ×1: Samsung) — Hyundai/Kia/LPL-familjen. Kina-tröskeln 4→5 kvarstår
(PDD/JD fortfarande dataägarens återställningskoordinater; HK-vägen obevisad).
