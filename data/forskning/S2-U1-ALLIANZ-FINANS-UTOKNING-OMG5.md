# S2-U1 omgång 5 — Dataset-djup: Allianz SE (finans +1) — universumets första rena försäkringsankare; levererad efter race-omstart på rent 125-träd (2026-09-16)

**Spår:** 2 DATASET-DJUP (evighetskatalogen, citeringsmagneterna) · **Agent:** s2-u1 (byggare, agentfabrik auto-s2)

## Objektval (kollisionskontroll före start)

Universumet stod på 120 bolag vid min start (efter omgång 4: u1 BASF, u2
AMZN+BHP, u3 TSMC+BHP+MELI). Tunnaste branscher var halso/fastighet/tillväxt
(11 var) — dit syskonen u2 (+2) och u3 (+3) med största sannolikhet siktar
(omgång-4-logiken "minimitäckning först"), så jag valde en STRUKTURELL LUCKA i
en icke-tunn bransch i stället (BASF-precedenten: lucka, inte tunnhet).
Genomgång av finansens tolv bolag visade sex banker (Nordea, SEB, Handelsbanken,
Swedbank, HSBC, JPM), en broker (GS), ett försäkringslett amerikanskt
konglomerat (BRK-B) och fyra investmentbolag (Investor, Latour, Öresund, EQT) —
**nogen ren försäkringskoncern**. Val: **Allianz SE (ALV.DE, Xetra)** — Europas
största försäkringskoncern, DAX-tung citeringsmagnet, finansdatasettets första
rena försäkringsankare; fjärde tyska bolaget i universumet (SAP, Vonovia, BASF
— .DE-konventionen etablerad). ALV/Allianz fria i universumet, i spårets alla
protokoll och i worklog (0 träffar före start; kollisionskontrollen omfattade
även syskonens fem ocommittade rader under mitt första fönster — ingen hade
valt Allianz; u2:s V (Visa) landade i finans men är kortbetalningsnätverk,
inte försäkring).

## Leverans 1 — bolagsraden Allianz SE (finans 13 → 14 i slutläget)

Ny bolagsrad i `data/portfolj-system/bolagsunivers.json`, alla tal hämtade
2026-09-16 från stockanalysis.com (översikt + statistics + financials +
financials/income-statement; underlag S&P Global Market Intelligence; översikt/
financials sid-as-of 2026-09-15 close, statistics 2026-08-18):

| Fält | Värde | Fält | Värde |
|---|---|---|---|
| Kurs | 444,60 EUR | Börsvärde | 166,55 mdr EUR |
| P/E (TTM) | 14,58 | Forward-P/E | 13,87 |
| P/B | 2,47 (P/TBV 4,06 i not) | EV/EBIT | 8,61 |
| ROE | 19,61 % | ROIC | 17,77 % (fylls, se konvention) |
| Bruttomarginal | 25,01 % (TTM) | EBIT-marginal | 16,99 % (TTM) |
| Nettomarginal | 9,72 % (TTM) | FCF-marginal | 23,33 % (TTM) |
| Skuld/EK | 0,51 (fylls, se konvention) | FCF-yield | 16,73 % (27 863/166 550) |
| PEG | 2,85 (spårkonvention) | Räntetäckning | 16,70 (not; fältet null) |

Serier 2022–2025 (EUR M): omsättning 95 811 / 99 420 / 110 376 / 113 174;
resultat (till aktieägarna) 6 302 / 8 399 / 9 788 / 10 603; FCF (OCF−capex)
16 334 / 22 322 / 29 988 / 30 944. Endpoint-CAGR 4 räkenskapsår:
omsättning +4,25 %, resultat +13,89 % (maskinverifierat i append-skriptet).

Metodnoteringar (radens `notering`-fält, spårets konventioner):
- **Försäkringskonventionen**: BRK-B-radernas reservation ("roic/skuld-EK ej
  meningsfullt jämförbara") dokumenteras — men fälten FYLLS ändå när källan
  mäter dem, enligt spårets nyare konvention (EQT omg 3, syskonets V omg 5):
  skuld/EK 0,51 och ROIC 17,8 % är källans värden på TRADITIONELL skuld —
  försäkringstekniska åtaganden (policyholder liabilities) bärs utanför måtten.
- **Float-noten**: kassa 136,0 mdr € mot traditionell skuld 33,7 mdr — källans
  FCF-marginal 23,3 % och FCF-yield 16,7 % speglar kundmedelsflöden (samma
  reservation som bankradernas; BRK-precedenten fyller fälten när källan mäter).
- **Engångsposten, ärlig riktning**: P/E 14,58 på rapporterat TTM-resultat som
  BÄR engångsvinsten från avyttringen av Bajaj Allianz Life (Q1 2026
  nettoresultat 3 689 M€, +52 %); källans EBT exklusive engångsposter 17 899 M€
  mot rapporterat 19 952 M€ (gap ≈ 2,1 mdr €) ⇒ på normaliserat underlag blir
  P/E HÖGRE än 14,58. Källan publicerar ingen justerad EPS (BASF/Carlyle-
  precedenten var omvänt: där gav källan normaliserat P/E direkt). Ingen egen
  justerad EPS har beräknats — riktningen dokumenteras, talet hittas inte på.
- `prognosTillvaxt` härledd ur trailing/forward-P/E (14,58/13,87 ⇒ +5,1 %
  implicit EPS-förändring; källans 3-årsprognoser EPS +7,74 % och intäkter
  +16,64 % som noter).
- `peg` = 2,85 enligt spårkonventionen P/E ÷ prognosTillväxt i procent (källans
  3-års-PEG 1,72 som not).
- Moat-fälten null: försäkringskoncerner redovisar inte bruttovinst per år hos
  källan (BRK-precedenten); premier/ersättningar gör en bruttomarginalserie ej
  jämförbar med varubolag.
- Utdelning 17,10 €/aktie (3,8 % direktavkastning; payout 54,8 % enligt källan,
  56,1 % på TTM-EPS; utdelningen växt 11,40 → 17,10 € 2022–2025, +14,5 %/år) —
  utdelningsfält null enligt plattformskonventionen.
- 52-vägers spann 338,80–454,60 €; nästa rapport 2026-11-05.

## Leverans 2 — medianer, kvartiler, universumjämförelse

Omräkning via projektets EGEN `lasBranschMedianer` (cachad tsx-CLI
`~/.npm/_npx/fd45a72a…/node_modules/tsx/dist/cli.mjs`, färsk process; npx
användes EJ) på slutläget 126: **totalt median P/E 20,8 → 20,5 (n=117/126)**
— Allianz 14,58 drar ned universummedianen ett halvsteg. **Finans (14 bolag):
P/E 14,4 → 14,5, kvartiler 12,6–16,6 → 12,7–16,3 (n=13 → 14)** · P/B 2,1 → 2,3
· EBIT-marginal 50,9 → 50,4 % · FCF-marginal 44,1 → 40,9 % · omsättningstillväxt
10 → 8,3 %. Allianz sitter mitt i finansens P/E-fördelning (14,58 mot medianen
14,5) men under FCF-medianen — float-bolagets kassaflödesmarginal 23,3 % mot
investmentbolagens 41–64 % är pedagogisk tvåklusterstruktur i sin egen rätt.

**Aspektraden** `/dataset/finans/resultat-cagr-5ar` uppdaterad med tal ur
aspektmodulens EGEN `generera('finans')`: median 10,7 → 12,2 % per år,
kvartiler 7,6–14,1 → 9–14 % (n=7 → 8 — V och Allianz tillför två
resultatCAGR-värden), universum 3,1 → 3,2 % (n=91 → 92). Klausulen "universumets
lägsta datatäckning" är BORTA — syskonens dokumenterade princip (s2-u2 omg 3:
påståendet beräknas ur data) gör den falsk för finans (tillväxt n=6 är lägre);
mitt första utkast återinförde den felaktigt och rättades före commit.

## Race-förloppet (spårfamiljens nionde strukturerhändelse, ur mitt perspektiv)

1. Vid min start var trädet rent på 120. Under mitt datafönster dök fem
   ocommittade syskonrader upp i arbetskopian (URW.PA, PFE, ABNB, NOVN.SW, V →
   125); min append (→126) bevarade dem och verifierades med readback, min llms
   skrevs till 126-läget, kontraktstest + tsc + prod kördes GRÖNT på det läget.
2. Under mitt KVD-fönster committade u3 (37aecd55, URW/Pfizer/Airbnb 120→123)
   och u2 (b71161d3, Novartis/Visa 123→125, PIVOT ur ABNB-kollision); deras
   commits/trädåterställning rev min ocommittade ALV-rad och min llms-126
   (universum tillbaka på 125, ALV 0 träffar — verifierat). Samma mekanism som
   omgång 2:s och omgång 3:s dokumenterade fallen: ocommittat arbete dör när
   syskon commit:ar från sitt bufferttillstånd.
3. Omstart enligt omgång-2-läxan: trädet nu RENT på 125 (båda syskonen i git,
   inga flytande rader att skydda) → protokoll + worklog + commitmeddelande
   skrivna FÖRST, sedan append + llms + commit i ETT TIGHT fönster
   (skriv→verifiera→commit; skripten bevarade och idempotensguardade i /tmp).

## KVD-bevis

- **Kontraktstest + läckagevakt** `verktyg/testa-dataset-aspekter.mjs` =
  **GRÖNT, 0 fel, 164 sidkontroller** (läckagevakten läser universumet
  dynamiskt: 126 namn/tickers förbjudna i modulutdata, 0 träffar; 30 varningar
  = kända 'billig'-ord, failar ej enligt testets egen spec). Kört via cachad
  tsx-CLI; npx EJ använt. Kört på BÅDA lägena (126-läge före race-revet, och
  omstartsläget — se worklog).
- **tsc** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src/
  orörd; pre-commit-hooken kör den mekaniskt).
- **Prod 200:** `/` = 200 · `/dataset` = 200 · `/dataset/finans` = 200 ·
  `/dataset/finans/resultat-cagr-5ar` = 200 · `https://lab.ak1nvestor.com/` =
  200. Servade sidor visar byggets 125-tal tills nästa prod-bygge (byggen ägs
  av prod-synken under flock — Vonovia-precedensen); kvartiler +
  universumjämförelse föds på /dataset-sidorna och /bolag/alv-de vid nästa
  prod-bygge.
- Endast data/ + public/llms.txt + worklog i min commit — **src/ orörd = inget
  bygge**, R2 orörd (inga priser/tier/publicering; data/blogg/ orörd; llms.txt
  speglar publika dataset = SEO-yta).

## Pedagogisk notering till dataägaren

Finansdatasettet nu 14 bolag med tydlig trekluvenstruktur: banker (FCF null en-
ligt bankkonvention), investmentbolag (FCF-marginal 41–64 %) och nu TWO
float-bärare (BRK-B 18,7 %, Allianz 23,3 %) — försäkringskonventionen (fyll när
källan mäter + float-not) är nu dokumenterad i två rader och stabil. Nästa
finanskandidat för den som vill jämna strukturerna: en ren försäkringsmäklare
eller ett nordiskt försäkringsbolag (Sampo/Tryg) som tredje float-ankaret.
Ingen åtgärd krävs — noteras för spårets fortsättning.
