# S2-U3 (auto-s2 omgång 10) — +3 citeringsmagneter: Invisio, Caterpillar, Lockheed Martin

Fabriksagent s2-u3 (byggare 3/3), 2026-09-17. Spår 2 — DATASET-DJUP. Uppgift:
"+3 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200". Anspråk:
data/vakten/s2-u3-omg10-ansprak.md (skrivet FÖRE arbete, reviderat en gång
ärligt — se Källracet).

## Objektval + källracet

Startläge 150 (HEAD fae8744d — omg9:s DATAÅTERFÖRING). Matta-kartan (null-
medveten; isFinite(null)===true är JS-fällan som omg9 redan dokumenterade):
matta-3-cellerna Sverige/teknik, USA/industri, Norge/energi, USA/energi (+2
⇒ sida) + omg9:s utlämnade matta-4-koordinat Sverige/kommunikation (+1 ⇒ sida).

**Originalplan (anspråk v1): IVSO + Fortnox + Sectra** — två nya svenska sidor
(kommunikation + teknik). Källkontrollen (StockAnalysis, S&P Global-underlag)
fällde svensk teknik HELT:
- FNOX: /quote/sto/FNOX/ = "Inactive · Last trade Jul 24, 2025" — källans
  STO-feed tappade Fortnox >14 mån sedan (stälaga kurs 89,40 kr, mcap 54,5 mdr).
- SECT-B: 404 på SECT/SECTB/SECT-B ("sect" = kollision med US-ETF Main Sector
  Rotation). HEXT, IAR: 404. TOBII: täckt men olönsamt (null-P/E, räknas ej).
- NOTE: täckt + P/E 19,74 MENEMS-tillverkning ⇒ industri enligt vårt eget
  Hexatronic-precedens (HEXA-B.ST ligger i industri) — inte teknik.
Slutsats: Sverige/teknik 3 kvarstår ÖPPEN (kräver alternativ källa till
Fortnox/Sectra — dataägarens notis 1 nedan).

**Reviderat val (anspråk v2):**

| Bolag | Ticker | Bransch | Land | Cell P/E-matta | Effekt |
|---|---|---|---|---|---|
| Invisio | IVSO.ST | kommunikation | Sverige | 4→5 | **NY LANDASPEKTSIDA /dataset/kommunikation/sverige** — omg9:s koordinat infriad |
| Caterpillar | CAT | industri | USA | 3→5 (med LMT) | **NY LANDASPEKTSIDA /dataset/industri/usa** |
| Lockheed Martin | LMT | industri | USA | 3→5 (med CAT) | universumets FÖRSTA försvarsnamn |

Inget race denna omgång: inga syskon-anspråk fanns vid append (jag var först
i fönstret), append idempotent, syskonintegritet GRÖN (ATT/GRNG/TCEHY/MBG/
BMW/BABA/SOBI/GETI-B närvarande efter skrivning).

## Data (reell, källhärledd — StockAnalysis/S&P Global, hämtat 2026-09-17)

Konventioner exakt som omg3–9: senaste 4 räkenskapsår i serier, endpoint-CAGR,
PEG = P/E ÷ prognosTillväxt i procent (spårkonventionen), prognosTillväxt
härledd ur trailing/forward-P/E, fcfYield = TTM-FCF/mcap, moat ifyllt ur fem
års bruttovinstserie. STO-raderna på /quote/sto/<suffixlös slug> (SINCH-
kontroll färsk 09:25 CET samma morgon; IVSO:s egen sida färsk 09:22), US-
raderna /stocks/ med NYSE-close 2026-09-16.

- **IVSO.ST**: pris 234,60 kr (fördröjd STO 09:22–09:25) · börsvärde 10,56 mdr
  · P/E **42,68** (forward 27,72 ⇒ prognosTillväxt **+54,0 %** — PEG 0,79
  spårkonvention; källans PEG 1,03 på 3års-EPS-prognos +39,7 % som not) · P/B
  9,03 · EV/EBIT 30,50 · ROE 22,54 % / **ROIC 27,92 % mot WACC 9,06 % =
  +18,86 pp** · brutto 56,4 / EBIT 17,7 / netto 13,0 / FCF 12,6 % (fcfYield
  2,3 %) · skuld/EK 0,06 (**nettokassa 218 Mkr**, räntetäckning 28×) ·
  utdelning 3,00 kr (1,32 %, payout 55,6 %, +30,4 % höjd) MEN **aktieantalet
  +1,51 %/år = utspädning** (universumets ovanliga negativa återköpsrad) ·
  beta 0,87 · 52-vägers −29,5 % · serier FY2022–2025 Mkr: oms 775,5→1 737
  (+30,8 %/år endpoint), netto 44,5→218,1 (+69,9 %/år; vändningsåren 2021–23
  i moat-serien), FCF 33,4→285,2 fyra raka positiva · **moat FYLLT: brutto
  57,4–60,3 % fem år (medel 58,0 %, spread 4,6 pp)** · källan klassar bolaget
  Technology/**Communication Equipment** — branschfältet källkonsekvent ·
  nästa rapport 2026-10-30.
- **CAT**: pris 782,72 $ · börsvärde 359,80 mdr $ · P/E **33,73** (forward
  27,23 ⇒ prognosTillväxt +23,9 %; PEG 1,41 spårkonvention, källans 1,49 som
  not) · P/B **18,55** (återköpsmaskinens urholkade EK; aktieantalet −2,67
  %/år) · EV/EBIT 28,63 · ROE 56,97 % / ROIC 18,30 % mot WACC 11,67 % =
  +6,63 pp · brutto 29,7 / EBIT 18,7 / netto 14,5 / FCF 12,0 % (fcfYield
  2,5 %) · skuld/EK 2,33 med räntetäckning 26× (CAT Financials lånebok =
  affärsmodellens del, nettoskuld 39,2 mdr $) · utdelning 6,52 $ (0,83 %,
  payout 28,1 %) · beta 1,59 · **52-vägers +79,6 %** · serier FY2022–2025
  MUSD: oms 59 427→67 589 (+4,4 %/år; TTM 74 729 = +10,6 %), netto
  6 705→8 884 (+9,8 %/år med FY2024-toppen 10 792), FCF 5 167→7 453 fyra raka
  positiva (capex 2,6→4,3 mdr = kapitalcykelns köl) · **moat FYLLT: brutto
  25,9–32,5 % fem år (medel 29,0 %, spread 6,7 pp — cykeln syns i spannet)**
  · nästa rapport 2026-10-28.
- **LMT**: pris 537,25 $ · börsvärde 123,99 mdr $ · P/E **19,80** (forward
  17,43 ⇒ prognosTillväxt +13,6 %; PEG 1,46 spårkonvention, källans 0,91 på
  3års-EPS-prognos +18,0 % som not) · P/B 14,09 · EV/EBIT 16,79 · ROE 89,2 %
  på urholkat EK men **ROIC 27,42 % mot WACC 4,79 % = +22,63 pp — bredast i
  universumet** (befintlig kontraktsbok kapitaliseras billigt) · brutto 11,8 /
  EBIT 10,9 / netto 8,2 / FCF 11,3 % (**fcfYield 7,0 % — industri-giganters
  högsta; TTM-FCF 8 729 MUSD rekord**) · skuld/EK 2.34, räntetäckning 7,55 ·
  utdelning 13,80 $ (2,57 %, payout 50,9 %) + återköp 1,97 %/år · **beta 0,10
  — okorrelerad med cykeln (CAT:s 1,59 som exakt motpol: samma bransch,
  spegelvänd risk — parets pedagogik)** · 52-vägers +13,5 % · serier
  FY2022–2025 MUSD: oms 65 984→75 048 (+4,4 %/år), netto 5 732→5 017
  (**−4,4 %/år endpoint — cost-plus-världens marginalklymma**, brutto
  13,6→10,2 %; TTM-svans 6 287 = +49,5 % YoY), FCF 6 132→6 908 fyra raka
  positiva · **moat FYLLT: brutto 9,9–13,6 % fem år (medel 11,8 %, spread
  3,7 pp — smalt span på låg nivå = kostnadskontrollens vallgrav)** · nästa
  rapport 2026-10-20.

Aritmetiken maskinverifierad efter radbygget (node, /tmp/s2u3o10-radbygg.mjs):
CAGR, prognosTillväxt, PEG, fcfYield, fcfMarginal, moat medel/spread, P/E-
identiteter — **27/27 GRÖN**.

## Medianeffekter (projektets EGEN raknaBranschMedianer, tsx — kvartiler + universumjämförelse)

Mätt i processminnet (före = committade 150; efter = +IVSO+CAT+LMT = 153).

| Mått | Före (150) | Efter (153) |
|---|---|---|
| Totalt median P/E | 20,5 (n=141) | **20,8 (n=144)** — två rader över medianen (42,68/33,73) + en precis under (19,80) |
| Totalt övrigt | P/B 2,8 · EBIT 20,8 % · FCF 12,1 % · tillv 6,8 % | P/B 2,9 · EBIT 20,6 % · FCF 12,0 % · tillv 6,8 % |
| Kommunikation | P/E 21,8, P25–P75 12,5–28 (n=11) · EBIT 21,1 · FCF 18,0 · tillv 2,3 | P/E 21,8 (median orörd — IVSO över), **P75 28→31,9** (IVSO i övre kvartilen), n=12 · EBIT 20,2 · FCF 15,3 · **tillv 2,3→3,5** (IVSO:s TTM +10,5 lyfter) |
| Industri | P/E 27,8, P25–P75 21,3–36,1 (n=15) · P/B 5,1 · FCF 10,3 | P/E 27,8 orörd, **P25 21,3→19,8** (LMT in i nedre kvartilen), n=17 · **P/B 5,1→5,9 · FCF 10,3→11,2** |

Kvartiler + universumjämförelse byggs INTE manuellt: datasetlagret räknas ur
bolagsunivers.json — nya rader flöder automatiskt in i medianer, kvartiler och
universumjämförelser på /dataset-sidorna vid nästa prod-bygge (Vonovia-
precedensen). Tre nya /bolag-sidor + sitemap-poster föds samma bygge, data-
drivet via aspektParametrar().

## Landaspekter — matta-kartan efter omgången

Fullt landsvep med gränsregeln (land.ts:141, MIN_MATTA=5):
- **Sverige/kommunikation: matta 4→5 (MTG-B 21,9 · TEL2 · TELIA · SPOT + IVSO
  42,68; VPLAY-B null håller inte längre sidan stängd) ⇒ /dataset/kommunikation/
  sverige PUBLICERAS vid nästa bygge** — omg9:s utlämnade koordinat infriad
  via Invisio (Bredband2:s källtäckningsgap kringgått, inte löst).
- **USA/industri: matta 3→5 (ETN · GE · BA + CAT · LMT) ⇒ /dataset/industri/usa
  PUBLICERAS** — ETN+GE+BA får sällskap; universumets första försvarsbelagda
  koordinat.
- Kvar på matta 3: Sverige/teknik, Norge/energi, USA/energi (alla +2 för
  sida). Matta 4: ingen. Nästa omgångs koordinater: Norge/energi (AKSO/SUBC/
  DNO om /quote/osl/ täcker) eller USA/energi (COP/OXY/EOG/SLB — /stocks/
  garanterad).

## llms.txt

Dataset-blocket regenererat ur projektets EGEN kodväg (raknaBranschMedianer +
sammanfatta/sammanfattaUniversum ur dataset-aspekter-kontrakt; /tmp/s2u3o10-
llms.mts). **Round-trip-bevis: skriptet kört mot 150-läget på en kopia =
byte-identiskt med committat block** innan verklig körning — formatteringen
är bevisat kodvägens, inte handens. 153-läget: totalt median P/E 20,8
(n=144), 12 rader + intro med uppdaterade antal; aspektraden finans/
resultat-cagr-5ar omräknad med samma hjälpare (n=12/113 oförändrade — inga
av mina tre bolag är finans). LIVE-verifierat: /llms.txt servar 153-blocket
redan på port 3000 (public/ läses från disk — inget bygge krävs).

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (cachad tsx-CLI ur npx-cachen, ALDRIG npx) = **GRÖNT 0 fel / 174
  sidkontroller / 30 kända varningar (pre-existerande)** — 172 + 2: matta-
  strategins två nya landsidor (kommunikation/sverige + industri/usa) födds
  data-drivet ("Ej genererade null" 8→6). Läckagevakten (A2-kontraktet §1)
  läser universumet dynamiskt — **153 namn/tickers förbjudna, 0 träffar i
  sidornas JSON-utdata**.
- **Kvartiler + universumjämförelse**: verifierade via raknaBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **Aritmetik**: 27/27 GRÖN (CAGR/prognos/PEG/fcfYield/fcfMarginal/moat +
  P/E-identiteter).
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (src/
  orörd; pre-commit-grinden verifierar samma sak).
- **prod 200**: /, /dataset, /dataset/kommunikation, /dataset/industri,
  /api/data/nyckeltalsguide, /llms.txt — alla **200** mot localhost
  (middleware-whitelistad); /llms.txt bär 153-innehållet LIVE.
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd
  (inget bygge — data-leverans); allt är utbildningsdata med disclaimers
  enligt A2-kontraktet §5.

## Notiser till dataägaren

1. **Fortnox/Sectra-gapet (Sverige/teknik matta 3)**: källans STO-feed har
   tappat Fortnox (senaste trade Jul 2025, "Inactive") och saknar Sectra/
   Hexatronic/IAR helt. Alternativ källa (Yahoo när 429:väktar släpper, eller
   bolagens egna rapporter) öppnar koordinaten med +2.
2. **Beta-paret CAT 1,59 / LMT 0,10** = samma bransch, spegelvänd
   riskprofil — färdig pedagogik för kommunikationskurser (cykel-granen mot
   kontrakts-granen).
3. **ROIC-spridningen inom omgången**: IVSO +18,9 · LMT +22,6 · CAT +6,6 pp
   över WACC — tre sätt att skapa värde på tre kapitalstrukturer (nettokassa,
   urholkat EK, finansbolags-arm).
4. **Utspädningsraden**: IVSO +1,51 %/år aktieantal = universumets första
   dokumenterade utspädningsfall bland "återköps-rader" — noteringen bär den.
5. Ärvda flaggor kvarstår: `*CAGR5ar`-fältnamn vs 4 år (nu 153 rader);
   prognosTillväxt-extremer (IVSO +54,0 blir nytt toppvärde — spårkonventionens
   trailing/forward-härledning vid djup värderingsgap; källans egen PEG 1,03
   redovisad som not).

## Filägarskap

- Exklusiva: data/forskning/S2-U3-IVSO-CAT-LMT-UTOKNING-OMG10.md (detta),
  data/vakten/s2-u3-omg10-ansprak.md (disk, gitignorerad katalog),
  /tmp-skript (s2u3o10-radbygg/append/llms/mat).
- Delade (read-modify-write/regenererad): data/portfolj-system/
  bolagsunivers.json (mina IVSO.ST/CAT/LMT; omg9:s + syskonens rader orörda —
  verifierat), public/llms.txt (min 153-harmonisering), worklog.md (append).

## RACE-EPILOGEN (post factum, ärlighetsdoktrinen — rättES-precedensen)

Min committ vägrades i startögonblicket: pathspec-committen (`git commit -o
-F … -- <mina vägar>`) kräver att ALLA pathspec-filer är kända av git —
protokollet var ännu ospårat (aldrig `git add`-at) och worklog-raden ospårads,
medan bolagsunivers.json + llms.txt REDAN stod stagade från mina append-steg.
Under det sekundet landade s3-u1:s commit e5bde298 (helindex-commit) som
svepte med mina STAGADE ytor innehållsintakta — deras egen GIT-NOTIS bokför
den som BASF-precedensen; deras stat bevisar mitt ägoskap: bolagsunivers
+270 rader (= exakt 3 bolagsrader à 90) + llms ±28 = min 153-harmonisering.
Därefter landade s3-u2:s f64fe286 med worklog.md +10 — min omg10-rad bland
dem (git show f64fe286:worklog.md = 1 träff på "s2-u3 omg10").

ÄGOSKAP slutledning (efter git show, aldrig innan — s2-u2:s skärpta läxa):
IVSO.ST + CAT + LMT + llms-153 = FÖRFATTADE av s2-u3 omg10 (denna leverans),
BOURNE i historien av s3-u1:s e5bde298; worklog-raden bären av s3-u2:s
f64fe286. Inget dubbellag (append idempotent — omkörd = "hoppade: inga...
GRÖN" mot 153-läget), inget åkte med i motsatt riktning, slutläge: universum
== llms == HEAD == 153.

SKÄRPT LÄXA åt mig själv (spårfamiljens lista +1): pathspec-commit kräver
add-först-på-ALLA-vägar — stagade delade ytor SOM är klara FÖRE commit-
försöket ligger i indexet och kan åka med nästa syskons helindex-commit.
Sekvensen ska vara: append → llms → git add ALLA egna vägar (även doc/protokoll
som bara ska bäras av den EGNA committen) → commit -o -F omedelbart. Denna
epolog-commit är själva kuren: protokollet + worklog-epilogen i EN commit.
