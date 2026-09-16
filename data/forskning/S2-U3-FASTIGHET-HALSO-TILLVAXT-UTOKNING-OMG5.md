# S2-U3 (auto-s2 omgång 5) — +3 citeringsmagneter: Unibail-Rodamco-Westfield, Pfizer, Airbnb

Fabriksagent s2-u3 (manifest auto-s2-1789539321010), 2026-09-16.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## Objektval (inga duplikat)

Kollisionskontroll före start mot worklog + tickerlistan + git log: omgång 1
tog energi, omgång 2 Spotify/Skanska/Evolution, omgång 3 Volvo/EQT/Axfood,
omgång 4 TSMC/BHP/MELI; syskonen Vonovia, Roche/Nestlé, BASF, Amazon. De tre
branscher som stod på delad minimitäckning 11 bolag i 120-läget — fastighet,
halso, tillväxt — var samtidigt helt orörda av spårfamiljens omgång 5. Mitt
val: en magnet per bransch, alla tre fria (0 träffar i universumet före
append; URW/PFE/ABNA verifierade fria):

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| Unibail-Rodamco-Westfield | URW.PA | fastighet | Europas största köpcentrum-bolag (Westfield), CAC 40-magnet; branschens första franska rad och första renodlade galleribolag (portföljen 9 SE-kontors/fastighet + Prologis-logistik + Vonovia-bostad) — dessutom branschens tydligaste skuldpedagogik (LTV ~42 %, skuld/EK 1,08) |
| Pfizer | PFE | halso | världens mest citerade läkemedelsbolag; branschens renaste pandemi-normaliseringsfall (omsättning 101,2 → 62,6 mdr USD 2022–2025) + direktavkastningsfällan (6,2 % yield, payout 226 % av TTM) — Halso-radens enda USA-jättar var JNJ/LLY/BSX, ingen av de tre bär patentkliff-pedagogiken |
| Airbnb | ABNB | tillväxt | tillväxtbranschens motstycke till förlustbolagen: GAAP-lönsam plattform (netto 20,5 % OCH FCF 36,9 %) med arbetskapital-fördelen som läxa; hushållsnamn = citeringsmagnet av samma slag som Tesla/Shopify redan i raden |

Universum vid min append: 120 → 123 på disk (inget syskenskap ocommittat i
fönstret — trädet bar endast mina två filer vid commit, se Koordinering).

## Data (reell, källhärledd — StockAnalysis/S&P Global, sid-as-of 2026-09-15 close)

Alla tre raderna följer universumets konventioner exakt (omgång 3/4:s
mönster): 4 räkenskapsår, endpoint-CAGR, PEG = P/E ÷ prognosTillväxt i
procent, prognosTillväxt härledd ur trailing/forward-P/E, härledningar
dokumenterade per rad i `notering`. Allt live-hämtat denna session
(stockanalysis.com översikt + statistics + financials per bolag; URW via
/quote/epa/URW/, Paris-konventionen från TTE.PA/MC.PA-raderna).

- **URW**: pris 93,88 EUR · börsvärde 13,56 mdr · P/E 8,69 (forward 10,04 ⇒
  prognos **−13,4 %** — trailing-vinsten bär avyttringsvinster, forward
  normaliserar; PEG därmed OSATT enligt konventionen vid negativ implicit
  tillväxt, Vonovia-precedensen) · P/B 0,62 (golv tillgangstung: substans
  113,64 €/aktie = 17 % rabatt) · EV/EBIT 16,86 · ROE 8,63 % · ROIC 4,15 %
  · brutto 70,4/EBIT 64,7/netto 44,6/FCF 36,6 % · skuld/EK 1,08, total skuld
  23,8 mdr €, LTV ~42 % · utdelning 4,50 € ≈ 4,8 % direktavkastning, payout
  43,6 % · serier EUR (omsättning 2 952→2 891→3 292→3 547 M€; resultat
  +178→−1 629→+146→+1 268 M€ — IFRS-värderingar: endpoint-CAGR +92,3 %/år
  är ett värderingsfenomen, inte verksamhetstillväxt, kraftigt noterat) ·
  omsättning-CAGR +6,3 %/år · fcfYield 9,5 % på statistics-sidans
  normaliserade FCF TTM 1,29 mdr € (källans financials-sida visar
  FCF=OCF-capex-0 — fastighetsquirk, noterad).
- **Pfizer**: pris 27,55 USD · börsvärde 157,03 mdr · P/E 36,21 (forward
  9,94 ⇒ prognos **+264 %** = vändningsprognos — trailing-TTM-vinsten 4,3
  mdr bär engångsposter; källans 3-årsprognoser är NEGATIVA −4,2/−8,5 %/år,
  kontrasten är pedagogiken) · PEG 0,14 med vändningsnot (EQT-precedensen
  förstärkt) · P/B 1,84 · EV/EBIT 11,08 · ROE 5,01 % mot ROIC 13,49 % —
  spridningen = Seagen-goodwillens köp-vs-bygg-läxa · brutto 74,7/EBIT
  29,6/netto 6,8/FCF 17,3 % · skuld/EK 0,74 · utdelning 1,72 $ = 6,2 %
  direktavkastning, payout 226 % av TTM men 62 % av forward-EPS · serier USD
  (omsättning 101 175→59 554→63 627→62 579 M$; resultat 31 372→2 119→8 031→
  7 771 M$ — pandemitoppen 2022 som mätpunkt, båda CAGR:talen negativa med
  not) · FCF-serien ifylld (26 031/4 793/9 835/9 075 M$ — BASF-precedensen,
  tredje raden i universumet med serie) · fcfYield 7,0 %.
- **Airbnb**: pris 168,32 USD · börsvärde 99,24 mdr · P/E 38,08 (forward
  30,01 ⇒ prognos +26,9 %; källans 3-års EPS-prognos +22,6 %/år ≈
  konsistent) · PEG 1,42 · P/B 12,73 (substansmåttet meningslöst för
  tillgångslätt plattform — noterat) · EV/EBIT 32,75 · ROE 34,54 % · ROIC
  16,81 % · brutto 82,9/EBIT 20,8/netto 20,5/FCF 36,9 % — gapet netto/FCF =
  förutbetalda gästavgifter (kassa före intäkt) · skuld/EK 0,32 med
  nettokassa 9,6 mdr $ · ingen utdelning · serier USD (omsättning 8 399→
  9 917→11 102→12 241 M$; resultat 1 893→4 792→2 648→2 511 M$ — 2023 bär
  engångsskatteförmån ≈3,2× rörelseresultatet, därför resultat-CAGR +9,9 %
  < omsättning-CAGR +13,4 %, noterat) · FCF-serien ifylld (3 430/3 884/
  4 518/4 646 M$) · fcfYield 4,9 %.

Aritmetiken maskinverifierad EFTER append (node): CAGR, prognosTillväxt,
PEG omräknade ur radernas egna tal — GRÖN för alla tre (9/9 kontroller).

## Medianeffekter (projektets EGEN lasBranschMedianer, tsx)

Före = 120-läget (dokumenterat i omgång 4:s worklog-rader). Efter = 123.

| Mått | Före (120) | Efter (123) |
|---|---|---|
| Totalt median P/E | 20,5 (n=111) | **20,5 (n=114)** — oförändrad median, tre nya observationer |
| Fastighet P/E | 11,4 (10,1–22,1, n=11) | **11,3 (9,7–21,1, n=12)** — URW drar ned median + BÅDA kvartilerna |
| Hälsa P/E | 24,7 (20,5–31,1, n=10) | **24,8 (21,5–33,8, n=11)** — PFE vidgar P75 +2,7 |
| Tillväxt P/E | 72,2 (41,0–126,6, n=8) | **49,8 (38,1–117,5, n=9)** — ABNB drar medianen ned 22,4 p: branschens normalisering fortsätter (94,6→72,2→49,8 över omgång 4–5) |

Kvartiler + universumjämförelse behövs INTE byggas manuellt: hela
datasetlagret räknas ur bolagsunivers.json — nya rader flödar automatiskt in
i medianer, kvartiler och universumjämförelser på /dataset-sidorna vid nästa
prod-bygge. Tre nya /bolag-sidor (urw-pa, pfe, abnb) + sitemap-poster föds
samma bygge (Vonovia-precedensen). Aspekt-effekt: INGEN ny aspektsida denna
gång (PFE/ABNB/URW höjde mattor som redan låg över gränsregeln —
sidkontroller kvar 163).

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kod
(lasBranschMedianer + aspektmodulens generera('finans'), omgång 4:s skript
återanvänt): 13+14 rader speglar 123-läget, totalt median P/E 20,5 (n=114).
Noterbart databeräknat skifte: ABNB höjde tillväxtens resultat-CAGR-matta
5→6 ⇒ tillväxt (n=6) DELAR nu lägsta datatäckning med finans (n=6) —
finans-radens "universumets lägsta datatäckning"-klausul återkommer (delad
etta, sant på källans eget räknesätt); universum-medianen för resultat-CAGR
1,4→1,7 % (n=83→89). llms-full.txt saknar dataset-sektion = orörd.

## Koordinering (delat träd — spårfamiljen kanonrade)

Syskonen s2-u1 (+1) och s2-u2 (+2) startade i samma omgång men hade vid
mitt commit-fönster EJ skrivit (universum-filens mtime 01:44 = omgång 4:s
läge vid min append; trädet bar endast mina två modifierade filer vid
commit). Min append var idempotent (skip befintlig ticker) — skriver ett
syskon en av mina tickers senare med egen data förlorar deras append
tyst (min rad kvarstår); skriver de ANDRA bolag hamnar deras rader efter
mina i arbetskopian och ett syskonscommit tar dem i git enligt omgång 3/4:s
race-precedens. llms.txt hamroniseras av siste commit-med-regeneration
(kedjan själv-läker, tre gånger bevisad).

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (cachad tsx-CLI ur npx-cachen, ALDRIG npx) = GRÖNT 0 fel, **163
  sidkontroller**, 30 varningar samtliga pre-existerande ('billig'-orden,
  failar ej). Läckagevakten läser universumet dynamiskt — **123 namn/
  tickers förbjudna, 0 träffar** i sidornas JSON-utdata (gränsdragningen
  A2-kontraktet §1). v98-dataset-vakt (läckagevakt mot BYGGDA sidor) kräver
  `next build` = prod-synkens ägande, väntar nästa byggande slag
  (BASF-precedensen).
- **Kvartiler + universumjämförelse**: verifierade via lasBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel.
- **prod 200**: `/`, `/dataset`, `/dataset/fastighet`, `/dataset/halso`,
  `/api/data/nyckeltalsguide` = 200.
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge — ren dataleverans); allt är utbildningsdata med disclaimers
  enligt A2-kontraktet §5.

## Ärvda flaggor (kvarlive, ej mina att lösa)

1. `*CAGR5ar`-fältnamnen bär "5 år"-etiketten men serierna omfattar 4
   räkenskapsår med endpoint-CAGR över 3 årssteg (s1-u3:s flagga 2 — gäller
   nu 123 rader). Fältbytning = src/-ändring = huvudagentens beslut.
2. URW:s resultatserie är den mest extremt engångspost-drivna i universumet
   (+92,3 %/år endpoint-CAGR ur värderingsposter) — om dataägaren vill ha
   en "normaliserad resultatserie"-konvention framöver är raden det bästa
   testfallet.

## Filägarskap

- Exklusiva: data/forskning/S2-U3-FASTIGHET-HALSO-TILLVAXT-UTOKNING-OMG5.md
  (denna), /tmp-skript (/tmp/s2u3omg5-lagg-till.mjs, /tmp/s2u3omg5-mat.ts;
  llms-skriptet /tmp/s2u3omg4-llms.mjs återanvänt orört).
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina URW.PA/PFE/ABNB), public/llms.txt (min
  123-harmonisering), worklog.md (append).
