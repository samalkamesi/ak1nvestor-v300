# S2-U1 omgång 4 — Dataset-djup: BASF (material +1) — universumets första kemi-ankare; rad + omräkningar levererade genom spårfamiljens race-kedja (2026-09-16)

**Spår:** 2 DATASET-DJUP (evighetskatalogen, citeringsmagneterna) · **Agent:** s2-u1 (byggare, agentfabrik auto-s2)

## Objektval (kollisionskontroll före start)

Universumet stod på 115 bolag efter omgång 3 (u1 Vonovia, u2 Roche+Nestlé,
u3 Volvo/EQT/Axfood + omgångarnas energi/HSBC/kommunikation/SPOT-SKA-EVO).
Branschläget: teknik/material/tillväxt delade sistaplatsen på 10 bolag.
Genomgång av materialets tio bolag visade en STRUKTURELL LUCKA: fem skogsbolag
(Billerud, Holmen, SCA, Stora Enso, UPM), gruvor/metaller (Boliden, Newmont,
Norsk Hydro, SSAB) och gödsel (Yara) — **noll kemikaliekoncerner** i en
materialsida som annars säger sig spegla råvaror och material i bredare mening.
Val: **BASF SE (BAS.DE, Xetra)** — världens största kemikaliekoncern,
DAX-tung citeringsmagnet och materialdatasettets första kemi-ankare; tredje
tyska bolaget i universumet (SAP, Vonovia — .DE-konventionen etablerad).
BAS/BASF fria i universumet och i spårets alla protokoll (0 träffar före
start; enda worklog-träffen var ordet "basfel" i en tsc-logg).

## Leverans 1 — bolagsraden BASF SE (material 10 → 11 i mitt skrivläge)

Ny bolagsrad i `data/portfolj-system/bolagsunivers.json`, alla tal hämtade
2026-09-15 från stockanalysis.com (översikt + statistics + financials; underlag
S&P Global Market Intelligence, sid-as-of 2026-09-15):

| Fält | Värde | Fält | Värde |
|---|---|---|---|
| Kurs | 51,84 EUR | Börsvärde | 45,10 mdr EUR |
| P/E (TTM) | 22,13 | Forward-P/E | 18,33 |
| P/B | 1,21 | EV/EBIT | 14,37 |
| ROE | 6,12 % | ROIC | 3,76 % |
| Bruttomarginal | 23,55 % | EBIT-marginal | 4,89 % |
| Nettomarginal | 9,42 % (TTM, med engångspost — se not) | FCF-marginal | 1,70 % |
| Skuld/EK | 0,71 | FCF-yield | 2,32 % |
| Nettoskuld | 18,80 mdr EUR | Räntetäckning | 3,18 (noteras, fältet null) |

Serier 2022–2025 (EUR mdr): omsättning 87 327 / 68 902 / 61 444 / 59 657;
resultat −627 M / +225 M / +1 298 M / +1 619 M; FCF 3 334 M / 2 716 M /
748 M / 1 343 M.

Metodnoteringar (radens `notering`-fält, spårets konventioner):
- **P/E 22,13 är källans normaliserade TTM-värde**: rå TTM-EPS 6,57 €
  inkluderar engångsvinsten från coatings-avyttringen (Carlyle) som ger
  P/E 7,8 på rapporterat resultat — källans P/E värderar bort engångsposten.
  Skillnaden dokumenterad i noteringen, inte något vi själva gissat fram.
- `prognosTillvaxt` härledd ur trailing/forward-P/E (22,13/18,33 ⇒ +20,7 %
  implicit EPS-förändring; källans 3-årsprognos +3,58 % som not).
- `peg` = 1,07 enligt spårkonventionen P/E ÷ prognosTillväxt i procent.
- `resultatCAGR5ar` osatt: negativt startvärde 2022 (−627 M€) gör
  endpoint-metoden meningslös (Vonovia-konventionen). Omsättningens
  endpoint-CAGR över 4 räkenskapsår: **−11,9 %** (energikrisens gaspris-topp
  2022, därefter tre fallande år).
- Utdelningsfält null (plattformskonventionen; källan visar 2,25 €/4,22 %
  med payout 35 % — noterat).
- Räntetäckning 3,18 i notering (fältet systematiskt null i universumet —
  Nestlé-precedenten).
- **Moat-fälten FYLDA första gången i spåret**: källans bruttovinstserie
  2022–2025 ger bruttomarginal-medel 23,8 % med spread 0,7 pp — kemins
  vallgrav är smal men anmärkningsvärt stabil genom en djup cykelbotten.
  (Yara-noteringen etablerade principen: null FÖRST när källan saknar
  bruttovinsthistorik.)
- **FCF-serien ifylld — första raden i universumet**: källan ger OCF−capex
  per år (3 334 / 2 716 / 748 / 1 343 M€; botten 2024 vid topp-capex 6,2 mdr).
- Golv osatt: P/B 1,21 = handlas till premium mot bokfört (BVPS 41,88 €).

## Leverans 2 — medianer, kvartiler, universumjämförelse (omräkning ×2)

Min första omräkning (projektets EGEN `lasBranschMedianer`, jiti + färsk
process; varken npx eller bygge) på 116-läget gav: totalt P/E 20,2 → 20,4
(n=107/116); material P/E 18,5 → 18,7, kvartiler 14,1–19,4 → 14,5–20,3
(n=10/11), FCF 6,5 → 5,4 %, tillväxt 3,8 → 1,1 % — kemicykelbotten mot
gruv-/skogstopp = pedagogiskt äkta tvåklusterstruktur. llms.txt skrevs till
116-tal (13 rader).

**Slutläget är 120** (se race-sektionen): med syskonens TSMC+BHP+MELI+AMZN
ger samma modul: totalt **P/E 20,5 (n=111/120)** · material (12 bolag)
**P/E 18,8, kvartiler 14,9–21,2 (n=11), P/B 1,3, EBIT 9,7 %, FCF 6,5 %,
tillväxt 3,8 %** (BHP återför FCF/tillväxt mot BASF:s bottendrag) · teknik
12 bolag P/E 27,9 (AMZN+TSM sänker från 31,8) · tillväxt 11 bolag 72,2
(MELI) · finans-CAGR-aspekten: universum 1,6 % (n=86 av 120; BASF null).
Mina självständiga 120-tal är IDENTISKA med dem syskonet s2-u3 committade i
6be66180 — determinismen i lasBranschMedianer nu OBEROENDE tredubbelbevisad
(två av s2-u3, en av mig).

## Race-förloppet (spårfamiljens fallen 7–8, ur mitt perspektiv)

1. Jag append:ade BASF (115→116) med idempotensguard och skrev llms till
   116-tal; trädet var rent vid start.
2. Under mitt KVD-fönster committade syskonet s2-u2 (9839c530, AMZN+BHP) och
   s2-u3 (43d6a4f3, TSMC+BHP+MELI — universum 116→119); s2-u3:s commit
   **skyddade uttryckligt min ocommittade BAS.DE-rad och tog den i git**
   ("syskonet s2-u1:s ocommittade BAS.DE + llms-116 skyddas i denna commit"
   — deras commit-meddelande; ägarskapet BASF = s2-u1 även dokumenterat i
   deras protokoll + worklog). Slutläge HEAD: 120 bolag, min rad intakt och
   innehållsverifierad av mig mot HEAD (namn/ticker/alla nyckeltal).
3. s2-u3:s 6be66180 harmoniserade llms till 120-talen; mina egna Edits mot
   120 (14 rader färdigberäknade) stoppades korrekt av read-modified-detekten
   — filen var redan i måltillståndet. Ingen av mina llms-ändringar förlorad:
   116-talen var interim, 120-talen är målet, båda konvergerade via samma
   deterministiska modul.
4. BHP-dubletten (s2-u2:s val oberoende av s2-u3:s) löstes idempotent av
   s2-u3:s append — EN rad i HEAD (deras dokumentation).

## KVD-bevis (kört på BÅDE 116- och 120-läget)

- **Kontraktstest** `verktyg/testa-dataset-aspekter.mjs` = **GRÖNT, 0 fel**
  — 162 sidkontroller på 116-läget, **163 på 120-läget** (MELI öppnade ny
  aspektsida) — bolagsläckage 0, juridikgrinden hel; 30 varningar = kända
  'billig'-ord, failar ej enligt testets egen spec. Kört via cachad tsx-CLI
  (node ~/.npm/_npx/fd45a72a…/tsx/dist/cli.mjs); npx använtes EJ.
- **tsc** `node node_modules/typescript/bin/tsc --noEmit` = **0 fel**
  (src/ orörd; pre-commit-hooken kör den mekaniskt).
- **Prod 200:** `/` = 200 · `/dataset` = 200 · `/dataset/material` = 200 ·
  `/dataset/teknik` = 200 (120-läget).
- v98-dataset-vakt (läckagevakt mot BYGGDA sidor) kräver `next build` —
  byggen ägs av prod-synken under flock; kontraktstestet täcker
  modulutdata; v98 körs vid nästa byggande slag (Vonovia-precedensen:
  /bolag/vna-de = 200 bevisar att /bolag-sidor föds vid prod-bygge;
  /bolag/bas-de = 404 tills dess — samma dokumenterade läge som Vonovia
  och TSM/BHP/MELI/AMZN vid sina leveranser).
- Endast data/ + worklog i min commit (universum+llms kom in via syskonens
  commits) — **src/ orörd = inget bygge**, R2 orörd (inga priser/tier/
  publicering; data/blogg/ orörd; llms.txt speglar publika dataset = SEO-yta).

## Pedagogisk notering till dataägaren

Material-datasettet nu 12 bolag med tydlig tvåklusterstruktur: gruvor/skog
(hög FCF-marginal och cykeltillväxt) mot bulkkemi (BASF: FCF 1,7 %,
EBIT 4,9 % i cykelbotten). Nästa materialkandidat för den som vill jämna ut
klustren: ett specialkemiskt moat-bolag. Ingen åtgärd krävs — noteras för
spårets fortsättning.
