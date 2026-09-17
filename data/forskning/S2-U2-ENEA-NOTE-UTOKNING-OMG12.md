# S2-U2 (auto-s2-1789675529483, byggare 2/3) — +2 citeringsmagneter: Enea + NOTE

Fabriksagent s2-u2 omgång 12, 2026-09-17. Spår 2 — DATASET-DJUP. Uppgift:
"+2 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200". Anspråk:
data/vakten/s2-u2-omg12-ansprak.md — skrivet FÖRE arbetet (~22:10).

## Objektval — omg11:s utpekade koordinat, med källfallet UPPKLART

Koordinat **Sverige/teknik** (omg11: "Nästa koordinater: Sverige/teknik kräver
alternativ källa"). Omrg10/11:s originalkandidater föll BÅDA — och fallet är nu
fullständigt förklarat (viktigt FYND åt dataägaren):

1. **Fortnox (FNX): AVMOTERAD** — inte ett feed-fel. Yahoo: "symbol may be
   delisted"; webbkällor: Omega II:s offentliga uppköpserbjudande 2025-03-28,
   bolagets avnoteringsansökan 2025-07-09, SISTA HANDELSDAG 2025-07-24 (Nasdaqs
   nyhetsvy, Placera, FI:s prospektregister 25-10962). Koordinatens
   "kräver alternativ källa"-spår är dödfött för Fortnox — ingen källa kan
   leverera en avnoterad aktie.
2. **Sectra (SECT.B): fel sektor** — StockAnalysis klassar bolaget Healthcare
   (sector/healthcare-länk på sidan) ⇒ inte källkonsekvent med teknik-fältet
   (branschföljdregeln, kontraktet). Klarar datakraven men hamnar i hälso.

Sondering av kvarvarande svenska Technology-kandidater mot StockAnalysis
sto/-flödet 2026-09-17: ENEA 200 ✓ (P/E 11,37 mätbar) · NOTE 200 ✓ (P/E 19,74
mätbar) · NETI.B 200 men P/E n/a (räknas ej mot mattan) · TOBII 200 men P/E
n/a · HTRO.B 404 · VITEC.B 404 · FNX 404/avnoterad.

| Bolag | Ticker | Bransch | Land | Matta P/E | Effekt |
|---|---|---|---|---|---|
| Enea AB (publ) | ENEA.ST | teknik (källan: Technology) | Sverige | 3→5 | **NY LANDASPEKTSIDA /dataset/teknik/sverige** |
| NOTE AB (publ) | NOTE.ST | teknik (källan: Technology, EMS) | Sverige | 3→5 | hemmamarknadens teknikbransch |

Matta före: ERIC-B 13,163 · KAMBI 37,957 · SINCH 77,931 (3 mätbara).
Efter: + ENEA 11,37 + NOTE 19,74 = **5 mätbara ⇒ /dataset/teknik/sverige
PUBLICERAS vid nästa prod-bygge** — Sveriges femte landsida (efter sverige/
hälsa, sverige/material, kommunikation/sverige, + energilandsidorna i kö).
Kontraktstestets "Ej genererade" föll 5→4 = koordinaten över MIN_MATTA=5.

## Race-bokföring (omg11-mönstret, andra varvet)

Mitt anspråk (~22:10) föregicks av syskon s2-u1:s Samsung-arbete (samma
manifest, 1/3): deras append landade 22:16 (universum 159→160, teknik/Sydkorea
005930.KS) + llms-160 22:17 + commit 0ad009ab. NOLL tickerkollision (Korea ≠
Sverige). Min append körde på 160-läget (idempotent, elementvis): alla 160
gamla rader innehållsidentiska bevisade (json-dump jämförelse: "ändrade bland
gamla: INGA"), Samsung-raden orörd i innehåll — enda kosmetiken: deras
öppningsparentes med 4 mellanslag normaliserad till filstandarden 2 vid min
serialisering. Universum 160→162. s2-u3 (3/3) opåverkad.

## Data (källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-17)

Konventioner exakt som omg3–11: 4 räkenskapsår FY2022–FY2025 i serier
(endpoint-CAGR 3 år), prognosTillväxt = trailing/forward-P/E − 1 (spår-
konventionen), fcfYield = TTM-FCF/börsvärde, moat = 5 år bruttomarginal
(medel + spread), PEG = P/E ÷ prognosTillväxt(%) (SOBI-konventionen 2 dec).
Båda bolag rapporterar i SEK (rapportvaluta = noteringsvaluta).

- **ENEA.ST**: kurs 64,60 SEK (previous close, fördröjd STO) · börsvärde
  1,2138 mdr SEK · P/E **11,37** (forward 11,14 ⇒ prognosTillväxt +2,1 % —
  stillastående konsensus; PEG 5,51 spårkonvention) · P/B 0,71 (identitets-
  verifierad: 11,37 × ROE 6,41 % = 0,729) · EV/EBIT 7,48 (replicerad:
  (1 213,9 + 234,4) ÷ 193,7 = 7,48) mot EV/EBITDA 5,45 · ROE 6,41 % / ROCE
  9,27 % mot WACC 7,97 % = +1,30 pp · brutto 77,33 / EBITDA 28,16 / EBIT
  21,72 / netto 12,10 / FCF 16,65 % (fcfYield 12,23 %) · skuld/EK 0,19,
  räntetäckning 16,4×, nettoskuld 234,4 MSEK · ingen utdelning — återköp
  5,51 %/år (aktieantal −5,51 % YoY) · insiders 43,5 % · beta 0,90 ·
  52-vägers 54,00–92,70 · serier FY2022–2025 MSEK: oms 927,67→888,99
  (−1,41 %/år endpoint), netto 224,81→49,41 (−39,66 %/år endpoint MED
  FY2023-storförlusten −550,72 där EBIT ändå +9,38 — svansen sitter under
  driftsraden, källans resultat; TTM netto 107,91 +52,1 % på väg tillbaka),
  FCF 159,17→95,97 fyra raka positiva (TTM 148,47) · **moat: brutto 76,4–83,5 %
  fem år (medel 78,44 %, spread 7,06 pp) — mjukvaruvallgraven** · nästa
  rapport 2026-10-22.
- **NOTE.ST**: kurs 172,10 SEK · börsvärde 4,9135 mdr SEK · P/E **19,74**
  (forward 14,48 ⇒ prognosTillväxt +36,3 %; PEG 0,54 spårkonvention — källans
  egen PEG 1,99 på 3års-EPS-prognos +15,7 % som not) · P/B 2,68 · EV/EBIT
  17,47 (replicerad: (4 913,5 + 1 640) ÷ 375,19 = 17,47) · ROE 14,82 % /
  ROCE 13,13 % mot WACC 6,11 % = +7,02 pp · brutto 14,25 / EBITDA 12,40 /
  EBIT 9,45 / netto 6,27 / FCF 4,62 % (fcfYield 3,73 %) · skuld/EK 0,98,
  räntetäckning 7,4×, nettoskuld 1 640 MSEK, quick ratio 0,63 · utdelning:
  DPS n/a hos källan men payout 80,16 % + 1 år av utdelningstillväxt
  (ny policy) redovisas i noteringen · återköp 0,14 %/år · insiders 30,0 % ·
  beta 0,59 · 52-vägers 138,10–205,20 · analytiker Buy mål 197,00 (+12,8 %) ·
  serier FY2022–2025 MSEK: oms 3 687→3 814 (+1,13 %/år endpoint med
  FY2023-toppen 4 243), netto 254,24→281,74 (+3,48 %/år endpoint, fyra raka
  positiva år), FCF 3,38→393,36 (vändningen från FY2021:s −60,62; därefter
  250,11/512,32/393,36) · **moat: brutto 12,1–13,9 % fem år (medel 13,10 %,
  spread 1,77 pp — matt men STABIL: monteringsvalvet)** · nästa rapport
  2026-10-23.

**Pedagogiken i paret** (sidan /dataset/teknik/sveriges levande exempel):
ENEA:s mjukvarubrutto 77 % mot NOTE:s EMS-brutto 14 % i SAMMA branschetikett —
tekniketikettens två världar (mjukvarans marginal mot monteringens volym),
kvartilspridningens signatur redan i rådata.

## Medianeffekter (projektets EGEN kodväg — kvartiler + universumjämförelse)

llms-datasetblocket HELREGENERERAT ur kodvägen (s2-u1:s omg12-skriptmönster =
EXAKT replik av raknaBranschMedianer + buildLlmsTxt-mallarna; samma kodväg som
/dataset-sidorna). Diff mot 160-läget KIRURGISK:

| Mått | Före (160) | Efter (162) |
|---|---|---|
| Totalt median P/E | 20,5 (n=151) | **20,4 (n=153)** — båda nykomlingarna under medianen (11,37 + 19,74) |
| Teknik P/E | 27,8, P25–P75 18–37,5 (n=16) | **24,9, P25–P75 17,2–36,9 (n=18)** |
| Teknik övrigt | P/B 6,4 · EBIT 32,4 % · tillv 14,7 % | **P/B 5,5 · EBIT 29,9 % · tillv 12,7 %** |
| Aspektradens universum-CAGR | median 3,7 % (n=122) | **median 3,5 % (n=124)** (ENEA −39,7 + NOTE +3,5 räknas) |
| Övriga 9 branschrader | — | **byte-identiska utom antalsreferenserna 160→162** |

Nya rader flödar automatiskt in i medianer, kvartiler och universumjämförelser
på /dataset-sidorna vid nästa prod-bygge (Vonovia-precedensen); teknik/Sverige-
landsidan + /bolag/enea + /bolag/note + sitemap-poster föds samma bygge,
data-drivet via aspektParametrar().

## KVD-bevis

- **Kontraktstest**: `tsx verktyg/testa-dataset-aspekter.mjs` (tsx 4.23.13 ur
  npx-cachen) = **GRÖNT 0 fel / 176 sidkontroller / 30 kända varningar
  (pre-existerande)** · "Ej genererade" 5→4 = teknik/sverige-koordinaten nu
  genererbar.
- **Läckagevakt 0**: `node verktyg/v98-dataset-vakt.mjs` = **GRÖN: 0 träffar —
  162 tickers + 162 namn i 1 517 utdatafiler**.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel exit 0**
  (src/ orörd — INGET bygge; pre-commit-grinden verifierar baslinjen).
- **prod 200**: /, /dataset, /dataset/teknik, /api/data/nyckeltalsguide,
  /llms.txt — alla **200** mot localhost; /llms.txt servar 162-blocket LIVE
  (round-trip-bevisad kodvägs-regenerering: disk == port 3000). /
  dataset/teknik/sverige + /bolag/enea + /bolag/note = 404 = väntar
  prod-bygget (data-driven födelse, Vonovia-precedensen).
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd;
  allt är utbildningsdata med disclaimers enligt A2-kontraktet §5.

## Notiser till dataägaren

1. **FORTNOX-KOORDINATEN ÄR DÖD** (avnoterad 2025-07-24, Omega II) — omg11:s
   "alternativ källa"-förväntan på Fortnox/Sectra bör avskrivas: Fortnox kan
   aldrig levereras; Sectra tillhör hälso per källan (möjlig framtida
   halso/Sverige-rad — sidan finns redan där).
2. ENEA:s FY2023-radar: netto −550,72 MSEK vid EBIT +9,38 — källan visar inte
   decompositionen på översikt/statistics-nivå; fallet dokumenterat i noteringen
   som "under driftsraden" (ärvd flaggklass: källans svarta låda).
3. Matta-kartan efter omgången: kvar på 3 mätbara — teknik/Sverige STÄNGD av
   denna leverans; nästa 3-koordinater att öppna: (a) Danmark/energi 0 mätbara
   (Ørsted null-P/E — behöver +5, långt), (b) halso/Danmark 2 (COLO+NOVO —
   +3 krävs), (c) material/Norge 2 (NHY+YAR — +3 krävs), (d) energi/Finland 2
   (FORTUM+NESTE — +3 krävs). Cellerna på 2 ger nya 4-sidor först vid +2 →
   vänta: MIN_MATTA=5 ⇒ celler på 3 är de enda "+2-öppningsbara".
4. ENEA/NOTE nästa rapporter 2026-10-22/23 — kvartalspaketens (spår 1/4)
   FIFO-koordinater; rappfönstret 20–23/10.
5. NOTE:s utdelningsfält: källans DPS n/a (payout 80,16 % utan seriesiffra) —
   fältet lämnas null enligt ärlighetsprincipen, payout noterad i notering.

## Filägarskap

- Exklusiva: data/forskning/S2-U2-ENEA-NOTE-UTOKNING-OMG12.md (detta),
  data/vakten/s2-u2-omg12-ansprak.md, verktyg/_s2u2o12-append-enoe-note.mjs,
  verktyg/_s2u2o12-llms-regen.mjs, /tmp/s2u2o12-* (källfiler + sonder).
- Delade (read-modify-write): data/portfolj-system/bolagsunivers.json (mina
  ENEA.ST/NOTE.ST; s2-u1:s Samsung + övriga 159 orörda, innehållsidentiska
  bevisade), public/llms.txt (min 162-harmonisering), worklog.md (append).
