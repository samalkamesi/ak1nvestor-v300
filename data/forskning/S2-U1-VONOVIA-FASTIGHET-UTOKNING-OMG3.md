# S2-U1 omgång 3 — Dataset-djup: Vonovia (fastighet +1) + kvartiler/universumjämförelse omräknade (2026-09-15)

**Spår:** 2 DATASET-DJUP (evighetskatalogen, citeringsmagneterna) · **Agent:** s2-u1 (byggare, agentfabrik auto-s2)

## Objektval (kollisionskontroll före start)

Universumet stod på 109 bolag efter syskonens leveranser (u1 HSBC → finans 11,
u2 TEL.OL+DTE.DE → kommunikation 13, u3 omg2 SPOT/SKA-B/EVO, u3 energi
TTE.PA/NESTE/ORSTED → energi 13). **Fastighet stod på minimum 10 bolag med
nästan enbart svensk exponering (9 SE + Prologis)** — spårets tunnaste bransch.
Val: **Vonovia SE (VNA.DE, Xetra)** — Europas största bostadsfastighetsbolag,
DAX-tung citeringsmagnet som ger fastighetsdatasettet sin första tyska/
centraleuropeiska ankare. VNA/Vonovia fria i universumet och i spårets alla
protokoll (0 träffar före start).

## Leverans 1 — universumet 109 → 110 (fastighet 10 → 11)

En ny bolagsrad i `data/portfolj-system/bolagsunivers.json`, alla tal hämtade
2026-09-15 från stockanalysis.com (översikt + statistics + financials; underlag
S&P Global Market Intelligence, sid-as-of 2026-09-15):

| Fält | Värde | Fält | Värde |
|---|---|---|---|
| Kurs | 17,98 EUR | Börsvärde | 15,25 mdr EUR |
| P/E (TTM) | 4,21 | Forward-P/E | 9,74 |
| P/B | 0,48 | EV/EBIT | 26,70 |
| ROE | 14,56 % | ROIC | 3,07 % |
| Bruttomarginal | 60,85 % | EBIT-marginal | 38,41 % |
| Nettomarginal | 64,84 % (TTM) | FCF-marginal | 0,97 % |
| Skuld/EK | 1,35 | FCF-yield | 0,38 % |
| Golv | 32,12 EUR/aktje (bokfört EK) | Rabatt | 44 % under bokfört |

Serier 2022–2025 (EUR mdr): omsättning 8 289 / 6 021 / 7 027 / 6 686;
resultat −643,8 / −6 285 / −896 / +3 723.

Metodnoteringar (radens `notering`-fält, spårets konventioner):
- `prognosTillvaxt` härledd ur trailing/forward-P/E (4,21/9,74 ⇒ −56,8 %
  implicit EPS-förändring) — 2025-resultatet bär stora engångsvinster från
  fastighetsvärderingar, vilket forward-P/E värderar bort.
- `peg` osatt vid negativ implicit tillväxt (ORSTED-konventionen; källans egen
  3-årsprognos är +0,41 % EPS).
- `resultatCAGR5ar` osatt: negativt startvärde 2022 gör endpoint-metoden
  meningslös — 2022–2024 negativa resultat på nedskrivningar/räntor, 2025
  vändning. Ärlighet hellre än påhittad CAGR.
- `omsattningCAGR5ar` = endpoint över 4 räkenskapsår: **−6,9 %**.
- Utdelningsfält null (plattformskonventionen; källan visar 1,25 EUR/6,51 %).

## Leverans 2 — llms.txt dataset-block omräknat (12 rader)

Omräknat med projektets EGEN `lasBranschMedianer` (jiti + färsk process —
node_modules/.bin/jiti; varken npx eller bygge):

- **Universumtotal:** median P/E 19,9 → **19,7** (n=101 av 110) — Vonovias
  låga trailing-P/E drar ned totalmedianen en tick. Indexraden + intron
  uppdaterade (109 → 110).
- **Fastighet (11 bolag):** P/E 11,4 (oförändrad median!) men kvartilerna
  breddas nedåt: P25–P75 10,5–23 → **10,1–22,1** (n=11) · P/B 0,9 → **0,8** ·
  EBIT-marginal 64,7 → **63,1 %** · FCF-marginal 31,4 → **30,9 %** ·
  omsättningstillväxt 5,8 → **4,8 %**.
- Alla tio branschraders universumjämförelseklausul uppdaterad ("median P/E
  19,7 för samtliga 110 bolag"). Finans resultattillväxt-rad berörs ej
  (VNA:s resultat-CAGR null ⇒ n=78 oförändrat).
- llms-full.txt saknar dataset-sektion (verifierat) — ingen ändring där.

Kvartiler + universumjämförelse flödar automatiskt i alla dataset-sidor och
aspektsidor via `lasBranschMedianer`; den nya `/bolag/vna-de`-sidan och de
omräknade fastighets-/aspektsidorna föds vid nästa prod-bygge (SSG/ISR läser
datafilerna vid byggtillfället).

## KVD-bevis

- **Kontraktstest** `verktyg/testa-dataset-aspekter.mjs` = **GRÖNT, 0 fel**
  (161 sidkontroller, 18 aspekter — bolagsläckage 0, juridikgrinden hel;
  30 varningar = kända 'billig'-ord, failar ej enligt testets egen spec).
  Kört via cachad tsx-CLI (`node ~/.npm/_npx/…/tsx/dist/cli.mjs`) — rak node
  och jiti dör på testets dynamiska extensionless-importer (SYSTEMKARTAN
  C17 känner sjukdomen); npx använtes EJ.
- **Prod 200:** `/` = 200 · `/dataset` = 200 · `/dataset/fastighet` = 200.
- v98-dataset-vakt (läckagevakt mot BYGGDA sidor) kräver `next build` —
  byggen ägs av prod-synken under flock; vit-testet + kontraktets
  strukturella gränsvakter täcker modulutdata; v98 körs vid nästa
  byggande slag.
- Endast data/ + public/llms.txt ändrade — **src/ orörd = inget bygge**,
  tsc-baslinjen orörd (pre-commit-hooken kör den mekaniskt ändå).
- **R2 orörd**: inga priser/tier/publicering; llms.txt är SEO-yta som
  speglar publika dataset — inte kundpublicering i data/blogg/.

## Skuld till nästa våg (dokumenterad, ej blockerande)

1. VNA:s `fcfMarginal` 0,97 % syns i fastighetens FCF-kvartiler — korrekt
   men drar ned P25; om dataägaren senare mäter fastighets-FCF konsekvent
   ("rörelsemarginal exkl. förvärv/utbyggnad") bör hela branschen göras om.
2. SYSTEMKARTAN C17: testa-dataset-aspekter.mjs förbler trasigt i rak node —
   permanent kur vore tsx som projektberoende (kräver package.json = kod,
   huvudagentens bord).
3. Static "100-bolags"-formuleringar i src (s2-u3-energis dokumenterade
   ~33 träffar) gäller nu "110" i llms-värdet — global sweep fortfarande öppen.

## Koordinering

Inga syskon skrev i data/portfolj-system eller llms.txt vid mitt fönster
(git status ren före start; senaste commits var spår 1-granskningar).
Commit med `git commit -o <egna filer>` — kuren mot dagens tre dokumenterade
add-kollisioner (640daa80, 6d7b299d, 37c1f25b).
