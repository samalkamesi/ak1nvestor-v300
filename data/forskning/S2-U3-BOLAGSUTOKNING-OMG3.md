# S2-U3 (auto-s2 omgång 3) — +3 svenska citeringsmagneter: AB Volvo, EQT, Axfood

Fabriksagent s2-u3 (manifest auto-s2, omgång 3), 2026-09-15.
Spår 2 — DATASET-DJUP. Uppgift: "+3 bolag, kvartiler + universumjämförelse,
läckagevakt 0, prod 200".

## Objektval (inga duplikat)

Kollisionskontroll före start mot worklog + data/ + tickerlistan:
omgång 1 tog energi +3 (103), omgång 2 tog Spotify/Skanska/Evolution (106),
syskonen (omgång 3 av samma manifest) tog Vonovia (fastighet, s2-u1) och
Roche + Nestlé (halso/konsument, s2-u2). Mitt val — TRE svenska
citeringsmagneter som saknades, i tre branscher utan syskonkollision:

| Bolag | Ticker | Bransch | Motivering |
|---|---|---|---|
| AB Volvo (publ) | VOLV-B.ST | industri | Sveriges största bolag, lastbils-/maskinkoncern — universumet bar bil­tillverkaren Volvo Car men INTE lastbilsjätten; glupande citathål |
| EQT AB (publ) | EQT.ST | finans | Nordens största kapitalförvaltare, ~360 mdr SEK — kompletterar förvaltningsbolagen Latour/Investor med ren PE-profil |
| Axfood AB (publ) | AXFO.ST | konsument | Dagligvaruhandel, defensiv basal konsumtion — ingen livsmedelsbas i konsument-medianen sedan start (närmast McDonald's/Nike/PG) |

Universum vid min append: 110 → 113 (mine, i git via s2-u1:s b51bb714).
Syskonet s2-u2:s Roche + Nestlé landade tillfälligt i trädet under mitt
fönster (115) men revs ocommittade av trädåterställningen — min commit
speglar 113 (se Koordinering).

## Data (reell, källhärledd — StockAnalysis/S&P Global, sid-as-of 2026-09-15)

Alla tre raderna följer universumets konventioner exakt (omgång 2:s mönster):
serier 2022–2025 (4 räkenskapsår), endpoint-CAGR, PEG-null/regel vid negativ
tillväxt ej aktuell (alla tre positiva prognoser), härledningar dokumenterade
per rad i `notering`-fältet. Allt live-hämtat denna session
(stockanalysis.com översikt + statistics + financials per bolag).

- **AB Volvo**: pris 330,20 SEK · börsvärde 671,71 mdr · P/E 18,74 (forward
  13,32 ⇒ prognostillväxt +40,7 % — vinstnormalisering efter svaga 2025) ·
  P/B 3,80 · EV/EBIT 18,53 · ROE 20,9 % · ROIC 9,4 % · skuld/EK 1,47 med
  not om kundfinansieringsbolaget (Volvo Financial Services) · serier i SEK
  (omsättning 473→552→527→479 mdr; resultat 32,7→49,8→50,4→34,5 mdr) ·
  notering avgränsar mot Volvo Car (VOLCAR-B.ST, konsument) — olika bolag,
  olika bransch, ingen dubletträkning.
- **EQT**: pris 302,60 SEK · börsvärde 360,15 mdr · P/E 31,23 (forward 18,53
  ⇒ +68,5 % implicit EPS-tillväxt — exit-timing ger svängig vinstserie) ·
  P/B 4,21 · EV/EBIT 21,41 · ROE 13,9 % · ROIC 30,0 % · netto-/FCF-marginal
  35,2/40,9 % med utfallsnot (orealiserade realisationsvinster) · serier i
  EUR (rapportvaluta; notering i SEK) · universumets PEG-konvention ger 0,46
  (trailing ÷ 1-årsprognos); källans egen PEG 0,77 (3-års) noterad som
  avvikelse.
- **Axfood**: pris 249,90 SEK · börsvärde 53,13 mdr · P/E 21,93 (forward
  20,24 ⇒ +8,4 %) · P/B 7,51 · EV/EBIT 18,75 · ROE 36,3 % (liten EK-bas) ·
  tunna marginaler (brutto 14,8 %, EBIT 4,1 %, netto 2,7 %) = branschnormala
  · skuld/EK 2,24 med IFRS 16-lease­not · serier i SEK (73→81→84→89 mdr).

Aritmetiken maskinverifierad efter append (CAGR:n, prognos och PEG
omräknade i node — EQT prognosTillvaxt korrigerad 0,6859→0,6854 vid
egenkontroll innan commit).

## Medianeffekter (mätta med projektets EGEN lasBranschMedianer, tsx)

Före = 110-läget (efter s2-u1:s Vonovia). Mitt = 113-läget (endast mina tre
tillagda). Final = 115-läget på disk (s2-u2:s Roche/Nestlé tillkommit).

| Mått | Före (110) | Mitt (113 = commit-läget) | Transient 115 (revs) |
|---|---|---|---|
| Totalt median P/E | 19,7 (n=101) | **19,9 (n=104)** | 20,2 (n=106) |
| Industri P/E | 28,3 (20,2–36,1, n=11) | **28,0 (18,2–35,8, n=12)** — Volvo drar ned, P25 vidgas | oförändrat |
| Finans P/E | 13,8 (12,5–15,4, n=11) | **14,1 (12,6–15,8, n=12)** — EQT lyfter median + P75 | oförändrat |
| Konsument P/E | 18,9 (16,2–22, n=10) | **19,7 (16,9–22,1, n=11)** — Axfood drar upp | 20,4 (17,5–22,4, n=12) efter syskonets Nestlé |

Kvartiler + universumjämförelse behövs INTE byggas manuellt: hela
datasetlagret (18 aspektmoduler × branscher, /dataset-sidorna, JSON-LD,
/api/data/nyckeltalsguide, /api/llms-txt) räknas ur bolagsunivers.json vid
bygget — nya rader flödar automatiskt in i medianer, kvartiler och
universumjämförelser. Tre nya /bolag-sidor (volv-b-st, eqt-st, axfo-st) föds
vid nästa prod-bygge; sitemap följer registret automatiskt.

## llms.txt

`public/llms.txt` dataset-block regenererat ur projektets EGEN kod
(lasBranschMedianer + exakt mall ur seo.tsx, u2:s bevisade mönster, omgång
2:s skript återanvänt med ny slug-utskrift). Blocket speglar 115-läget på
disk (konvergent: syskonets eventuella omregenerering ur samma fil ger
identiskt innehåll). llms-full.txt bär inga dataset-tal — orörd.

## Koordinering (delat träd — fabrikens kända lek)

- **Mina tre rader kom in i git via SYSKONETS commit**: s2-u1 (Vonovia)
  committade b51bb714 med `commit -o` — som tar ARBETSKOPIAN av delade
  filer, varav mina samma kvart tillagda VOLV-B/EQT/AXFO-rader följde med
  (hela, orörda; HEAD = giltig JSON, 113 bolag). Ägarskapet VOLV-B/EQT/AXFO
  = s2-u3 dokumenterat i DERAS worklog (commit-race nr 4) och härmed i mitt
  protokoll — inget arbete förlorat, ingen revert. Deras interim: llms.txt
  speglade 110 mot universumets 113 — "harmoniseras av syskonets egen
  llms-omräkning (deras leveranskriterium)" = denna leverans.
- s2-u2 (Roche + Nestlé): skrev ROG.SW + NESN.SW i bolagsunivers.json strax
  före min llms-regenerering; min FÖRSTA regeneration speglade deras
  115-läge — men trädåterställningen (prod-synkens rent-träd-regel,
  verktyg/prod-synk.mjs:153 — omkörningens bevisade mönster) rev deras
  OCOMMITTADE rader innan de committat: disk = HEAD = 113 igen. Jag
  regenererade llms på 113-läget = helt konsekvent commit (llms = universum
  = HEAD); deras omkörning re-appendar idempotent och deras egen
  llms-omräkning tar blocket till 115 när deras rader landar — kedjan
  själv-läker (s2-u2 omkörningens mönster, deras forskningsfil bär talen).
- Min append var idempotent (skip befintlig ticker) och trampade ingen;
  eqt-noteringens 68,6→68,5 %-rättning gjordes före första commit-fönstret.

## KVD-bevis

- **Kontraktstest + läckagevakt 0**: `tsx verktyg/testa-dataset-aspekter.mjs`
  (via projekt-nära tsx-binär ur npx-cachen, ALDRIG npx tsc) = GRÖNT 0 fel,
  162 sidkontroller, kört på BÅDE 113- och 115-läget — bolagsvakten läser
  bolagsunivers.json dynamiskt (mina 3 namn/tickers förbjudna) och hittar 0
  träffar; kontrakt + juridikgrind gröna (30 fördefinierade varningar,
  samtliga pre-existerande i nyckeltal-pe-pb, failar ej).
- **Kvartiler + universumjämförelse**: verifierade via lasBranschMedianer
  (tabell ovan) — samma räknesätt som sidorna.
- **tsc**: `node node_modules/typescript/bin/tsc --noEmit` = 0 fel.
- **prod 200**: `/`, `/dataset`, `/api/data/nyckeltalsguide` = 200.
- **R2**: priser/tier/publicering orörda; data/blogg/ orörd; allt är
  utbildningsdata med disclaimers enligt A2-kontraktet §5; inga
  rådsformuleringar (vit-testet vaktar).

## Filägarskap

- Exklusiva: data/forskning/S2-U3-BOLAGSUTOKNING-OMG3.md (denna), /tmp-skript
  (/tmp/s2u3omg3-lagg-till.mjs, /tmp/s2u3omg3-llms.mjs, /tmp/s2u3omg3-mat.ts).
- Delade (read-modify-write/regenererad): data/portfolj-system/bolagsunivers.json
  (mina rader i git via s2-u1:s b51bb714 enligt Koordinering), public/llms.txt
  (min harmonisering), worklog.md (append).
