# S2-U1 omgång 6 — Dataset-djup: Siemens AG (industri +1) — industrins första tyska konglomeratjätte; universum 126 → 127 (2026-09-16)

**Spår:** 2 DATASET-DJUP (evighetskatalogen, citeringsmagneterna) · **Agent:** s2-u1 (byggare, agentfabrik auto-s2)

## Objektval (kollisionskontroll före start)

Universumet stod på 126 bolag (efter omgång 5: u1 Allianz, u2 Novartis+Visa,
u3 URW/Pfizer/Airbnb). Tunnaste branscher var teknik/industri/fastighet/
material/tillväxt (12 var). Valet följde BASF/Allianz-precedenten —
STRUKTURELL LUCKA hellre än tunnhet: genomgång av industrins tolv bolag visade
nio svenska kvalitetsrader (ABB, Alfa Laval, ASSA, Atlas Copco, Hexagon,
Industrivärden, Sandvik, SKF, Skanska, Volvo = tio med Volvo), amerikanska
Eaton och GE Aerospace (ren flyg efter 2024 års splittring) — men INGEN
europeisk konglomeratjätte. Val: **Siemens AG (SIE.DE, Xetra)** — Europas
största industriteknikkoncern, DAX-toppmagnet med automatisering (Digital
Industries), elektrofikation (Smart Infrastructure), transport/mobilitet och
det konsoliderade Healthineers-engagemanget (medicinteknik); femte tyska
raden i universumet (.DE-konventionen med fyra precedenser: SAP, Vonovia,
BASF, Allianz — tre av dem just s2-u1:s egna). SIE/Siemens fria: 0 träffar i
universumet, spårets alla protokoll och worklog vid start; arbetskopian ren
på bolagsunivers.json + llms.txt (inga flytande syskonrader att skydda).

## Leverans 1 — bolagsraden Siemens AG (industri 12 → 13)

Ny bolagsrad i `data/portfolj-system/bolagsunivers.json`, alla tal hämtade
2026-09-16 från stockanalysis.com (översikt + statistics + financials +
financials/income-statement; underlag S&P Global Market Intelligence/Fiscal.ai;
översikt/statistics sid-as-of 2026-09-16 intradag, financials uppdaterad
2026-08-06):

| Fält | Värde | Fält | Värde |
|---|---|---|---|
| Kurs | 260,75 EUR | Börsvärde | 198,76 mdr EUR |
| P/E (TTM) | 25,87 | Forward-P/E | 19,80 |
| P/B | 2,64 | EV/EBIT | 23,13 (EV/EBITDA 17,61 i not) |
| ROE | 12,47 % | ROIC | 6,58 % |
| Bruttomarginal | 39,36 % (TTM) | EBIT-marginal | 12,36 % (TTM) |
| Nettomarginal | 9,80 % (TTM) | FCF-marginal | 14,61 % (TTM) |
| Skuld/EK | 0,66 | FCF-yield | 5,96 % (11 850/198 760) |
| PEG | 0,84 (spårkonvention) | Räntetäckning | 6,08 (not; fältet null) |

Serier FY2022–FY2025 (bokföringsår **oktober–september**, årsetikett = slutår —
BHP-/Visa-precedensen tredje instansen; EUR M): omsättning 71 977 / 74 882 /
75 930 / 78 914; bruttovinst 25 847 / 29 116 / 29 823 / 30 399; resultat
3 723 / 7 949 / 8 301 / 9 620; FCF (OCF−capex) 8 157 / 10 093 / 9 577 /
10 812. Endpoint-CAGR 4 räkenskapsår (maskinverifierat i append-skriptet):
omsättning +3,11 %, resultat +37,22 %, FCF +9,85 %.

Metodnoteringar (radens `notering`-fält, spårets konventioner):
- **Normaliseringsriktningen (BASF-/Allianz-ärlighetskonventionen):** P/E 25,87
  står på TTM-resultatet 7 950 M€ (netto −19,7 %, EPS 10,10 €) som är NEDTRYCKT —
  förra TTM-perioden bar FY2025:s engångsposter. Forward-P/E 19,80 (implicit
  EPS ≈ 13,17 €) ⇒ prognosTillväxten +30,66 % ur P/E-kvoten är
  NORMALISERINGSARTEFAKT, ej underliggande volymtillväxt (källans 3-årsprognoser:
  intäkter +7,08 %, EPS +4,97 %). peg 0,84 enligt spårkonventionen P/E ÷
  prognosTillväxt i procent (källans 3-års-PEG 2,74 som not).
- **Engångsposterna kvantifierade ur källan:** FY2025-nettot 9 620 M€ bär
  avvecklingsverksamhet +2 059 M€ (motoravknoppningen Innomotics stängde under
  året enligt bolaget; källan namnger ej objektet) och tillgångsförsäljnings-
  vinster 502 M€ — källans EBT exklusive engångsposter 10 327 M€ mot rapporterat
  10 829 M€. Ingen egen justerad EPS beräknas; riktningen dokumenteras.
- **resultatCAGR +37,22 % mätt från deprimerat basår:** FY2022-nettot 3 723 M€
  (EPS −39,5 % enligt källan) gör endpoint-CAGR:n till ett basårstal — noterat
  i stället för att osättas (startvärdet positivt; BASF-precedensen omvänt,
  där negativt startvärde gav null).
- **Moat-serien fylld (BASF-precedenten):** bruttomarginaler 35,91/38,88/39,28/
  38,52 % — medel 38,15 %, spread 3,37 pp; industri = fjärde branschen med
  moat-data (material, hälsa, finans, nu industri). roeMedel null (ingen
  ROE-serie hos källan).
- **EV/EBIT-not:** 23,13 hög mot EBIT-marginalen 12,4 % — EV:n bär pensions-
  och leaseåtaganden samt kassadiskont; jämförelsen med de renodlade svenska
  kvalitetsraderna noteras.
- Utdelning 5,35 €/aktie (2,0 % direktavkastning; payout 52,4 % enligt källan,
  utdelningstillväxt +2,88 %, 4 tillväxtår) — utdelningsfält null enligt
  plattformskonventionen. 52-vägers spann 198,00–291,70 €; nästa rapport
  2026-11-12 (FY2026 Q4).

## Leverans 2 — medianer, kvartiler, universumjämförelse

Omräkning via projektets EGEN `lasBranschMedianer` (cachad tsx-CLI, färsk
process; npx användes EJ) på 127-läget:

- **Totalt: median P/E 20,5 → 20,8 (n=117 → 118/126 → 127)** — Siemens 25,87
  ligger ÖVER universummedianen och drar UPP den (Allianz-omgångens spegelbild,
  som drog ned ett halvsteg).
- **Industri (12 → 13 bolag): P/E 28,0 → 27,8, kvartiler 18,2–35,8 → 18,7–35,4
  (n=13)** · P/B 4,9 → 4,8 · EBIT-marginal 16,9 % (oförändrad) · FCF-marginal
  10,8 → 11,2 % · omsättningstillväxt 8,4 → 7,7 %.
- **Universumjämförelsen (Siemens position):** P/E 25,87 = premium 24 % mot
  universumet (20,8) men RABATT 7 % mot egen bransch (27,8) — tyskt
  konglomerat under svensk kvalitetsmedian; P/B 2,64 mot universum 2,8 och
  industri 4,8 (bensinräkenskapen i P/B-termen: svenska raderna bär 2×
  kapitalmultiplar); EBIT-marginal 12,4 % under industrins 16,9 %
  (konglomeratmixen), FCF-marginal 14,6 % över medianen 11,2 %.
- **Aspektraden** `/dataset/finans/resultat-cagr-5ar`: finans egna tal
  oförändrade (median 12,2 %, kvartiler 9–14 %, n=8); universumjämförelsen
  uppdaterad legitimt: median 3,2 → 3,4 % (n=92 → 93 — Siemens resultatCAGR
  +37,2 % tillför ett mätt värde).
- Kontraktstestets sidkontroller 164 → 164: ingen matta-tröskel (≥5) korsad —
  Siemens öppnar ingen ny aspektsida.

## KVD-bevis

- **Kontraktstest + läckagevakt** `verktyg/testa-dataset-aspekter.mjs` via
  cachad tsx-CLI = **GRÖNT, 0 fel, 164 sidkontroller** (läckagevakten läser
  universumet dynamiskt: 127 namn/tickers förbjudna i modulutdata, 0 träffar;
  30 varningar = kända 'billig'-ord, failar ej enligt testets egen spec).
- **tsc** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src/
  orörd; pre-commit-hooken kör den mekaniskt).
- **Prod 200:** `/` = 200 · `/dataset` = 200 · `/dataset/industri` = 200 ·
  `/api/data/nyckeltalsguide` = 200 · `https://lab.ak1nvestor.com/` = 200.
  Servade sidor visar byggets 126-tal tills nästa prod-bygge (byggen ägs av
  prod-synken under flock — Vonovia-precedensen); kvartiler +
  universumjämförelse och /bolag/sie-de föds vid nästa prod-bygge.
- Endast data/ + public/llms.txt + worklog i min commit — **src/ orörd = inget
  bygge**, R2 orörd (inga priser/tier/publicering; data/blogg/ orörd; llms.txt
  speglar publika dataset = SEO-yta).

## Race-bokföring

Trädet var RENT vid hela fönstret (kollisionskontroll + git status före
append: endast mina två datafiler modifierade efteråt; inga syskonrader att
skydda, ingen trädåterställning skedde). Commit enligt kurredoktrinen
`git commit -o -F <meddelandefil>` — endast namngivna filer, oavsett
delat staging-läge. Append via node-skript med idempotensguard + parse-retry
+ verify-readback (omgång-2/5-läxan behållen).

## Pedagogisk notering till dataägaren

Industrin är nu 13 bolag men fortfarande den mest svenskdominerade branschen
(10 av 13) — Eaton/GE/Siemens är de enda utländska. Nästa strukturkandidat för
den som vill jämna: Airbus (AIR.PA — flyg, men GE-täckning), Caterpillar (CAT
— byggtungt, speglar Skanska-needen) eller Hitachi/Samsung Heavy-typen för
asiatisk industri. Ingen åtgärd krävs — noteras för spårets fortsättning.
