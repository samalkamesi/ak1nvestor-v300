# NYTTOVALT EUROPA-UTÖKNING U3 — ELE.MC + ENG.MC + VER.VI (fabriksagent s2-u3, spår 2 DATASET-DJUP, omgång 32)

**Uppgift:** "Utöka dataset nästa i spåret: +3 bolag, kvartiler +
universumjämförelse, läckagevakt 0, prod 200." · **Leverans:** 2026-09-29 ·
**Protokollförfattare:** s2-u3-byggaren (denna agent).

## SAMMANFATTNING

Universumet 319→322 (disk-läget efter syskonen u1:s Veolia-industri + u2:s
BIDU/NTES samma manifestomgång): **nyttovalt-grenen 5→8 bolag** med tre
européer på tre OLIKA affärsmodeller — Endesa (reglerat el, Spanien),
Enagás (gas-TSO, Spanien), Verbund (förnyelse-vattenkraft, Österrike —
universumets 24:e land). Samtliga med full panel (quote + statistics +
financials + balance-sheet + cash-flow, StockAnalysis/S&P Global Market
Intelligence, sidor pålästa 2026-09-29, kurs close 2026-09-28 CET).

**NYTTOVALT efter omgången: median P/E 17,0 (P25–P75 16,2–18,9, n=8) · P/B
2,1 · EBIT-marginal 23,6 % · FCF-marginal −9,2 % · omsättningstillväxt
6,4 %.** Universumet: 322 bolag, median P/E 19,7 (n=309; FÖRE 319/19,8/306).
Resultat-CAGR-aspekten: nyttovalt median 12,1 %/år (P25–P75 8,8–14,7, n=8)
mot universumets 6,5 % (n=272).

Sidorna föds DATA-DRIVET: /dataset/nyttovalt finns i KÖRANDE bygge (släppt av
u1:s omgång — bygggrinden rapporterar "samtliga branscher byggda") och räknar
medianer ur filen vid ISR/pm2-processens läsning; llms.txt HELREGEN på
322-läget (huvudrad + nyttovalt-rad + aspektrad + alla syskonbranscher
omräknade); sitemap data-driven — ingen manuell åtgärd behövdes.

## VAL-ANALYS (två pivots, båda ärligt bokförda)

1. **EDF-avvisningen:** könotisens kandidat EDF (EDF.PA) är **AVNOTERAD** —
   källvägen /quote/epa/EDF/ svarar 404; webbverifiering: franska statens
   utköp till €12,00/aktie fullbordades med retrait obligatoire + delisting
   från Euronext Paris 2023-06-08 (Reuters/Barron's: staten 100 %). Könotisens
   parentes "statlig, börsnoterad dock" var FEL — avnoterat bolag kan inte in
   i ett börsuniversum. Sonde även: Redeia REE (bme) 404, EDP Lissabon (els)
   404, EDP NYSE-ADR (/stocks/edp/) 404.
2. **Veolia-kollisionen:** syskonet u1 skrev (uncommittat vid min genomgång,
   commit ccf43fe7 strax efter) Veolia som VIE.PA bransch=**industri** efter
   källans sektoretikett "Industrials/Waste Management" — två försvarliga
   klassificeringar (källa vs GICS-tradition), deras rad deras ägo, redan
   skriven: Veolia lämnades åt u1 (edit-krig är fel kur; mitt anspråks
   mtime föregick men diskens faktiska läge avgör). Snam (BIT:SRG) lever på
   bit-vägen men dubblerar Enagás gas-TSO-profil.
3. **Verbund-vald:** källans egna sektoretikett "Utilities – Renewable",
   Europas största vattenkraftproducent, land Österrike NYTT (24:e landet),
   mcap 22,46 mdr EUR — tredje AFFÄRSMODELL i cellen (reglerat el / gas-TSO /
   förnyelse) som trögar amerikansk el-tyngd.

## KÄLLOR

StockAnalysis BME-vägen (/quote/bme/{ele,eng}/) + Vienna-vägen
(/quote/vie/ver/) × fem sidor vardera (15 lyckade hämtningar, 2026-09-29;
S&P Global Market Intelligence-underlag; close 2026-09-28 CET). BME-vägen
kanalbevisad sedan ELE-sonden; vie-vägen ny (fungerar — notera Veolias
EPA-ticker VIE vs Wiens vägkod "vie": olika saker, dokumenterat för
eftervärlden). LSE förblir olöst ( NG/SSE 404, u1:s restpost kvarstår).

## RÅDATA (källans fält, ordagrant ur hämtningarna)

### ELE.MC — Endesa, S.A. (BME, EUR)
- **Översikt:** pris 42,04 · mcap 43,03 mdr · aktier 1,02 mdr · P/E 16,58 ·
  forward 17,78 · EPS 2,54 (+26,2 %) · TTM oms 21,13 mdr (−1,3 %) · netto
  2,63 mdr (+23,4 %) · DPS 1,58 (3,77 %) · beta 0,56 · 52-v 26,65–43,80 ·
  8 924 anst. · Sell 35,71 (23 st) · rapp 2026-10-28 · Utilities/Regulated
  Electric.
- **Statistik:** PEG 2,08 · PS 2,04 · PB 4,67 · PTBV 7,11 · EV 54,85 mdr ·
  EV/sales 2,60 · EV/EBIT 13,83 · EV/EBITDA 9,28 · ROE 29,05 % · ROA 6,50 % ·
  ROIC 12,33 % · ROCE 15,18 % · WACC 6,32 % · brutto 42,69 % · EBIT 18,63 % ·
  pretax 16,52 % · netto 12,43 % · EBITDA 27,32 % · rev-prognos 3Y +0,97 % ·
  EPS-prognos 3Y +4,86 % · kassa 277 M · skuld 11,03 mdr · nettolån −10,75 ·
  EK 9,21 mdr · BV/aktie 7,96 · skuld/EK 1,20 · räntetäckning 11,68 · payout
  52,49 % · FCF-yield 4,67 % · earnings yield 6,10 % · Piotroski 4.
- **RI (M€):** oms [2021–2025]: 20 527 · 32 545 · 25 070 · 20 935 · 21 031
  (TTM 21 126, −1,29 %) · netto: 1 435 · 2 541 · 742 · 1 888 · 2 198 (TTM
  2 627) · EPS: 1,35 · 2,40 · 0,70 · 1,78 · 2,10 (TTM 2,54) · pretax: 9,37 ·
  10,71 · 4,25 · 12,37 · 13,86 (TTM 16,52) · profit: 6,99 · 7,81 · 2,96 ·
  9,02 · 10,45 (TTM 12,44) · FCF-marginal: 2,63 · −1,41 · 9,63 · 8,22 ·
  10,49 (TTM 9,51).
- **BR (M€):** kassa 703 · 871 · 2 106 · 840 · 195 (TTM 277) · skuld 10 392 ·
  18 575 · 13 788 · 10 530 · 10 444 (TTM 11 031) · EK 5 544 · 5 758 · 7 204 ·
  9 053 · 9 611 (TTM 9 213, minoritet 1 070) · tillgångar 39 968 → 37 482.
- **KF (M€):** OCF 2 621 · 1 672 · 4 697 · 3 567 · 4 051 (TTM 3 967) · capex
  −2 082 · −2 132 · −2 284 · −1 846 · −1 844 (TTM −1 957) · FCF 539 · −460 ·
  2 413 · 1 721 · 2 207 (TTM 2 010) · utdelning −2 132 → −1 389 (TTM −1 379)
  · återköp −1 → −525 (TTM −876), emissioner saknas.

### ENG.MC — Enagás, S.A. (BME, EUR)
- **Översikt:** pris 16,69 · mcap 4,34 mdr · aktier 260,30 M · P/E 15,11 ·
  forward 16,54 · EPS 1,10 (−20,0 %) · TTM oms 952,15 M (+3,4 %) · netto
  289,98 M (+115,5 %) · DPS 1,00 (5,99 %) · beta 0,26 · 52-v 13,02–17,94 ·
  1 408 anst. · Hold 17,05 (4 st) · rapp 2026-10-20 (est) · Utilities/
  Regulated Gas.
- **Statistik:** PEG 3,23 · PS 4,56 · PB 1,87 · EV 6,66 mdr · EV/sales 7,00 ·
  EV/EBIT 18,64 · EV/EBITDA 11,03 · ROE 12,69 % · ROA 1,99 % · ROIC 2,51 % ·
  ROCE 4,16 % · WACC 4,11 % · brutto 93,65 % · EBIT 23,03 % · pretax 35,23 % ·
  netto 30,46 % · EBITDA 45,88 % · rev-prognos 3Y −2,33 % · EPS-prognos 3Y
  +3,39 % · kassa 719,61 M · skuld 3,02 mdr · nettolån −2,30 · EK 2,32 mdr ·
  BV/aktie 8,86 · skuld/EK 1,30 · räntetäckning 3,40 · payout 89,73 % ·
  FCF-payout 673,60 % · FCF-yield 0,72 % · earnings yield 6,67 % · Piotroski 4.
- **RI (M€):** oms 975,69 · 957,1 · 907,57 · 905,55 · 960,4 (TTM 952,15,
  +3,44 %) · netto: 403,83 · 375,77 · 342,53 · **−299,31** · 339,11 (TTM
  289,98) · EPS: 1,55 · 1,44 · 1,31 · −1,15 · 1,30 (TTM 1,10) · pretax: — ·
  profit: 41,42 · 39,26 · 37,73 · −33,02 · 35,31 (TTM 30,46) · FCF-marginal:
  52,27 · 66,37 · 45,40 · 39,44 · 9,83 (TTM 3,29) · EBITDA 56,0 · 54,0 ·
  49,1 · 47,3 · 47,0 (TTM 45,88 som marginal).
- **BR (M€):** kassa 1 444 · 1 359 · 838,48 · 1 296 · 727,07 (TTM 718,13) ·
  skuld 5 721 · 4 829 · 4 186 · 3 700 · 3 202 (TTM 3 023) · EK 3 102 · 3 218 ·
  3 000 · 2 392 · 2 317 (TTM 2 322, minoritet 15,76) · tillgångar 9 874 →
  6 823 · BV/aktie 11,80 · 12,26 · 11,42 · 9,10 · 8,85 (TTM 8,86).
- **KF (M€):** OCF 579,93 · 726,03 · 568,84 · 454,99 · 212,54 (TTM 164,55) ·
  capex −69,85 · −90,79 · −156,97 · −97,89 · −118,12 (TTM −133,25) · FCF
  510,08 · 635,25 · 411,87 · 357,1 · 94,42 (TTM 31,3) · utdelning −444,04 →
  −261,36 (TTM −260,19) · emissioner/återköp de minimis (0,76+1,25 M€ /
  18,35+6,21 M€).

### VER.VI — VERBUND AG (Vienna, EUR)
- **Översikt:** pris 64,65 · mcap 22,46 mdr · aktier 347,42 M · P/E 18,64 ·
  forward 18,41 · EPS 3,47 (−20,0 %) · TTM oms 7,59 mdr (−9,7 %) · netto 1,20
  mdr (−31,9 %) · DPS 2,00 (3,09 %) · beta 0,19 · 52-v 54,25–70,20 · 4 537
  anst. · Sell 60,39 (14 st) · rapp 2026-11-05 · Utilities/Renewable
  (vattenkraft).
- **Statistik:** PEG 28,83 · PS 2,96 · PB 2,13 · PTBV 2,59 · EV 26,52 mdr ·
  EV/sales 3,49 · EV/EBIT 14,35 · EV/EBITDA 10,74 · ROE 12,75 % · ROA 6,00 % ·
  ROIC 8,23 % · ROCE 10,57 % · WACC 4,95 % · brutto 45,80 % · EBIT 23,19 % ·
  pretax 22,08 % · netto 15,87 % · EBITDA 31,11 % · rev-prognos 3Y −2,43 % ·
  EPS-prognos 3Y −7,38 % · kassa 89,40 M · skuld 3,28 mdr · nettolån −3,19 ·
  EK 10,54 mdr · BV/aktie 27,83 · skuld/EK 0,31 · räntetäckning 16,48 · payout
  107,55 % · FCF-yield −0,02 % · earnings yield 5,36 % · Piotroski 4.
- **RI (M€):** oms 4 787 · 10 357 · 10 471 · 8 258 · 8 033 (TTM 7 590,
  −9,66 %) · netto: 873,56 · 1 717 · 2 266 · 1 875 · 1 489 (TTM 1 205) · EPS:
  2,51 · 4,94 · 6,52 · 5,40 · 4,29 (TTM 3,47) · pretax: 26,41 · 24,45 ·
  33,97 · 33,64 · 26,34 (TTM 22,08) · profit: 18,25 · 16,58 · 21,64 · 22,71 ·
  18,54 (TTM 15,87) · FCF-marginal: −15,79 · 8,97 · 35,19 · 25,56 · 6,85
  (TTM −0,06).
- **BR (M€):** kassa 318,56 · 409,25 · 964,04 · 795,14 · 72,79 (TTM 88,3) ·
  skuld 3 397 · 4 091 · 2 618 · 2 454 · 2 460 (TTM 3 279) · EK totalt 6 363 ·
  8 323 · 11 221 · 11 065 · 11 331 (TTM 10 535, minoritet 865,79; common
  5 462→10 341) · tillgångar 17 281 → 18 610 · BV/aktie 15,72 → 29,77 (TTM
  27,83).
- **KF (M€):** OCF 98,16 · 2 020 · 5 083 · 3 249 · 1 919 (TTM 1 455) · capex
  −854,04 · −1 091 · −1 399 · −1 138 · −1 368 (TTM −1 460) · FCF −755,88 ·
  928,63 · 3 684 · 2 111 · 550,23 (TTM −4,17) · utdelning −260,56 → −1 329
  (TTM −1 296) · emissioner/återköp ej separat rad (i "Other Financing").

## TAL-PARITET (aritmetikgrind — 48 identiteter GRÖN FÖRE skrivning)

Verktyg/_s2u3o32-grind.mjs: 48 PASS · 0 RÖD (första körningen 45/3 — tre
röda ärligt bokförda: TVÅ enhetsbuggar i min egen EPS-replik (×1000-fel,
M€/M-aktier ger € direkt — rättade), en avrundningsdifferens (Verbunds
källfält −0,06 mot replik −0,055 — källfält bärs enligt NEE-precedensen) och
en aktieantalsrundning (Endesa mcap 0,35 % — EXC/NEE-precedensklassen,
källans mcap-fält bärs).

**Nyckelidentiteten omgången upptäckte: EV = mcap + skuld − kassa +
MINORITET** — belagt EXAKT på alla tre (ELE 54 854≈54 850 · ENG 6 659≈6 660 ·
VER 26 516≈26 520). Källans EV inbegriper minoritetsintressena; repliker som
missar den posten landar 2–4 % fel.

Dokumentationsfönster (källfält bärs, avvikelsen protokollförd): Endesa
P/B-aktiebas 5,28 mot ekvivalensbasen 4,67 (källans BV/aktie-rad divergerar
mot EK-raderna — mcap/EK är den interna konsistensen); Enagás EV/EBIT-replik
30,4 mot källans 18,64 (källans EBIT-nämnare inkluderar andelsintäkter från
latinamerikanska gas-andelar — sales-equity-modellen); Verbund EV/EBIT 5,0 %
internt fönster; BIDU-klassens nettomarginal-fönster finns EJ här (alla tre
nettomarginaler replikerar EXAKT).

## KONVENTIONER

BUD-konventionen (negativt prognosgap ⇒ prognosTillvaxt null): ELE −6,75 %
och ENG −8,65 % ⇒ null (källornas 3-års EPS-prognoser +4,86/+3,39 %/år i
paranoid-raderna). Verbund gap +1,25 % positivt ⇒ fältet släpps och bär
källans 3-års EPS-prognos **−7,38 %/år** — negativt värde, ärligt bärt (elpris-
normaliseringen efter energikrisens toppår; första nyttovalt-rad med negativ
prognosTillvaxt). Moat-fält null ×3 (källan ger bruttomarginal enbart TTM).
Aterkop null ×3 (NEE-precedensen). egenKapitalMultipl = P/B. fcfPositivaSenaste5
SATT (ELE 4 · ENG 5 · VER 4 — derivbart ur serierna; utökar de 85 befintliga
raderna med fältet). Seriernas EK-kolumn = balansräkningens totala-EK-rad
(inkl. minoritet där källan så redovisar — VIE-/VER-formen; NEE/ENG:s
D/E-repliker följder källans egen ekvivalensbas, dokumenterat i paranoid).

## MEDIANER (EXAKT raknaBranschMedianer-replik)

| Mått | FÖRE (319) | NYTTOVALT (8 efter) | UNIVERSUM EFTER (322) |
|---|---|---|---|
| Totalt P/E | 19,8 (n 306) | **17,0 (kv 16,2–18,9, n 8)** | **19,7 (n 309)** |
| P/B | — | 2,1 | — |
| EBIT-marginal | — | 23,6 % | — |
| FCF-marginal | — | −9,2 % | — |
| Omsättningstillväxt | — | 6,4 % | — |
| Resultat-CAGR (aspekt) | 6,5 % (n 269) | 12,1 % (kv 8,8–14,7, n 8) | 6,5 % (n 272) |

Universum-CAGR:ns n växer 269→272 (mina tre: +11,25/−4,27/+14,26 %/år),
medianen 6,5 % oförändrad — tre nya värden rör inte mittläget.

llms-formatrad (LIVE i llms.txt nu): "Medianerna för Nyttovalt i AK1A:s
universum (8 bolag i branschen, rådata 2026-09-29): P/E 17 med
kvartilspridning P25–P75 16,2–18,9 (n=8) · P/B 2,1 · EBIT-marginal 23,6 % ·
FCF-marginal −9,2 % · omsättningstillväxt 6,4 %."

## KVD

- **Paritetsgrind:** 48/48 GRÖN FÖRE skrivning (två omgångar — se ovan).
- **Append:** mutex-lås, idempotent, läs-tillbaka ×2, samtliga 319 gamla
  rader värde-identiska efter skrivning (syskonintegritet); diff 298
  insertions/2 deletions (sista radens }→}, + tre rader) — kirurgisk.
- **Kontrakt:** nyckelfält + 5×4-serier verifierade per rad vid skrivning;
  JSON-parse GRÖN ×2.
- **Läckagevakt v98:** GRÖN — 322 tickers + 322 namn, 0 träffar i 1 755
  utdatafiler (dataset-ytan ×3 språk + llms Dataset-block + sitemap/robots).
- **llms.txt:** HELREGEN på 322-läget; bygggrinden rapporterar "samtliga
  branscher byggda — alla rader publicerade" (nyttovalt-sidan i körande
  bygge sedan u1:s omgång).
- **Sitemap:** data-driven — /dataset/nyttovalt redan posterad; inga nya
  sidor från mina rader (Spanien×nyttovalt = 2, Österrike×nyttovalt = 1 —
  matta ≥ 5 för landaspekter ej nådd; spanien-landmodul saknas, behöver ej
  skapas förrän cellen växer).
- **tsc:** node node_modules/typescript/bin/tsc --noEmit = 0 fel (src orörd —
  ren dataleverans; INGET bygge).
- **prod 200:** / + /dataset + /dataset/nyttovalt alla HTTP 200.
- **R2 orörd** · data/blogg orörd · inga priser/tier/publicering ·
  juridikgrind: allt är n-redovisna aggregat + pedagogiska formuleringar,
  ALDRIG råd (Sell/Sell/Hold-konsensus redovisade som värderingsnoter med
  uttrycklig "ej rekommendation"-formulering i paranoid-raderna).

## FYND (cellens pedagogik efter omgången)

1. **FCF-kontrasten Amerika↔Europa:** de fem USA-systernas signatur är
   negativ FCF (−7,6 till −25,8 % TTM) mot positiv netto — transmissionens
   capex-cykel. Europa-treorna: ELE **+9,51 %** (cellens första kraftigt
   positiva), VER −0,06 % (nollpunkten), ENG +3,29 % men TTM-tunn (31,3 M€
   mot utdelning 260 M€ — FCF-payout 673 %, källans egen not). Grenens
   FCF-median stiger −13,0 → −9,2 %.
2. **Enagás FY2024-förluståret (−299,31 M€):** universumets första nyttovalt-
   rad med förlustår MITTEN i serien — resultat-CAGR fortfarande definierad
   (start 403,83/slut 339,11 positiva) men pedagogiken: TILLVÄXTTALEN DÖLJER
   KRISEN (TTM-netto "+115,5 %" är förluståret som bas). Bruttomarginalen
   93,65 % överlever förluståret — TSO-modellens avgiftstak konstant,
   nedskrivningarna äter bokfört värde inte marginalintäkten.
3. **Verbunds skuldfrihet:** D/E 0,31 + räntetäckning 16,48× mot systernas
   1,6–1,8/2,3–2,5× — vattenkraftens betalda anläggningar kräver inte
   balansräkningshävstången. Cellens första "lågbelåtna" archetyp.
4. **Prognosens teckenvändning:** Verbund bär spårets första NEGATIVA
   prognosTillvaxt (−7,38 %/år, gap +1,25 % positivt) — energikrisens
   engångsvinster (2023: resultat 2 266 M€, FCF-marginal 35,19 %) tvättas
   ur mot 2025/TTM. EPS-serien 2,51→4,94→6,52→5,40→4,29 = histogrammet med
   krigstopp i mitten.

## KÖNOTIS (nästa omgångs koordinater)

1. **Universumtaket rör sig:** 322 bolag — om spårets mål är jämn celldjup
   är nästasvagaste grenar fortfarande tillväxt (19) och fastighet (19).
2. **LSE-vägen förblir olöst** (NG/SSE 404): UK-utilities kräver annan
   källväg — Yahoo quoteSummary-vägen (ENEL.MI-precedensen) är obevisad
   sonde för NG.L/SSE.L (yahoo quoteSummary bär dock NG.L redan i universumet
   som energi-rad — dvs YAHOO-vägen fungerar för LSE; det är STOCKANALYSIS
   som saknar dem. Nästa UK-jakt: Yahoo-vägen a priori).
3. **Strukturfrågan (styrelsen R1, kvarstående):** flytta GICS-utilities
   från energi (FORTUM.HE, RWE.DE, EOAN.DE, NG.L, IBE.MC, ENEL.MI, ENGI.PA,
   TRN.MI) till nyttovalt? + Veolia-industri-frågan (u1:s klassning) —
   ändrar ägda medianer, deras ägo.
4. **Landaspekt-Spanien:** Spanien når 10 bolag i universumet (8 äldre + ELE
   + ENG) men spridda över branscher — spanien-landmodulen (finns ej, jfr
   frankrike våg 21) blir aktuell när en enskild branschcell når matta ≥ 5;
   Spanien×nyttovalt = 2 idag. Österrike×nyttovalt = 1 (VER.VI ensam i sitt
   land — 24:e landet, aspektsida långt borta).
