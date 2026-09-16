# S2-U2 — SAMPO.HE + SPG: dataset-utökning omgång 7 (2026-09-16)

**Uppdrag:** manifestets "+2 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200" (spår 2 DATASET-DJUP; omgång 7 — tidigare omgångar: se worklogs s2-u1/u2/u3 omg 1–6). **Agent:** s2-u2 (byggare).

## Objektval med omdöme

Startläge: universum 132 (10 branscher; tunnaste fastighet/tillväxt 12 var). Val:

1. **Sampo Oyj (SAMPO.HE, finans, Finland)** — dataägarens explicita not i s2-u1 omg5-protokollet följd: "nästa kandidat Sampo/Tryg som tredje float-ankaret" (finans = banker + investmentbolag + float-bärare BRK/Allianz — Sampo fullbordar triaden). Bonus: Finland/finans = branschens första Finland-rad; beta 0,24 = universumets lugnaste.
2. **Simon Property Group (SPG, fastighet, USA)** — tunnaste branschens (12) mest citerade lucka: USA:s största köpcentrum-REIT, USA-motståndet till URW:s europeiska köpcentrum (samma delsektor två kontinenter). REIT-pedagogik saknad i universumet: distributioskrympt EK (ROE 120,5 % — universumets högsta) mot LTV-belåning (skuld/EK 5,04).

Båda fria vid kollisionskontroll (0 träffar i 132-listan; bolagsunivers.json rent i git vid start — inga pågående syskon-rader).

## Leverans — 2 bolagsrader (allt live-hämtat 2026-09-16, stockanalysis översikt+statistics+financials+income-statement+cash-flow-statement, S&P-underlag)

### SAMPO.HE — finans — kurs 9,43 € (fördröjd slutnotering 18:29 finsk tid)
24,81 mdr €. P/E 14,70 mot fwd 16,24 ⇒ **prognosTillväxt −9,5 % — universumets första rad där forward-P/E ligger ÖVER trailing** (FY2025 rekordår +73 % normaliseras nedåt enligt konsensus, medan källans 3-års EPS-prognos samtidigt är +9,51 %/år — toppårsdynamik; peg null, källans PEG n/a konsekvent). P/B 3,38, EV/EBIT 11,56. ROE 24,1 % / ROIC 17,4 %, skuld/EK 0,35, räntetäckning 28,7 (not). **Float-ankaret: kassa 18,16 mdr € mot traditionell skuld 2,55 mdr €** — försäkringstekniska åtaganden utanför måtten (Allianz-notens reservation). Marginaler: brutto 41,0 % (S&P-beräkning; moat null — ingen årlig bruttovinstserie), EBIT 20,6 %, netto 15,7 %, FCF 13,5 %. Serier 2022–2025: omsättning 8 586→10 860 M€ (+8,2 %/år), resultat 2 107→1 998 M€ (**−1,8 %/år endpoint — basårtalsstyrt: 2022 bär Nordea-exittens realisationsvinster**, TTM vänder +42,1 %), FCF 33→970→1 185→1 594 M€ = floatens återuppbyggnad. Beta 0,24 (universumets lugnaste rad). Utdelning 0,36 € (3,69 %, payout 55,9 %) i not.

### SPG — fastighet — kurs 201,30 $ (realtid 15:36 EDT, börsen öppen — AIR.PA-precedenten; föregående close 204,10)
76,37 mdr $. **Trailing-P/E 14,38 bär engångsvinster — Allianz-notens mekanism igen**: FY2025-netto 4 624 M$ (+95 %) innehåller avyttringsvinster; fwd-P/E 30,79 ⇒ normaliserad EPS ≈ 6,5 $; prognosTillväxt −53,3 % implicit (universumets mest negativa — normaliseringsgap, ej värdedom), peg null (källans n/a). P/B 15,03 med **ROE 120,5 % — universumets högsta** (Visa 61,2 % slagen dubbelt; distributioskrympt EK 13,58 $/aktie mot ROA 5,63 %/ROIC 9,3 % på tillgångsbasen). Skuld/EK 5,04 (fastighetsskuld 29,44 mdr $, räntetäckning 3,07 i not — LTV-konventionen gör talet ej jämförbart med industrirader). Marginaler: brutto 81,4 % (hyresintäkter; moat null — REIT redovisar ingen årlig bruttovinstserie), EBIT 47,4 %, netto 66,6 % (engångsbelastad), FCF 37,4 % (källans levererade FCF-rad 2 595 M$ TTM; källans statistiksida räknar 46,4 % på OCF−fastighetsförvärv — definitionsnot). Serier 2022–2025: omsättning 5 291→6 365 M$ (+6,4 %/år), resultat 2 136→4 624 M$ (+29,4 %/år endpoint — engångsbelastad), FCF 2 007→2 339 M$ stadigt. Utdelning 9,00 $ (4,49 %, payout 62,7 %) i not.

## Aritmetik — maskinverifierad

Append-skriptet (/tmp/s2u2omg7-append.mjs, mönster 1:1 från omg5/6) beräknar ALLA derivat ur råtal: CAGR endpoint 4 år, prognosTillväxt = pe/fwdPe−1, PEG = pe/prognos(%) spårkonvention (null vid prognos ≤ 0), fcfMarginal ur TTM-FCF/oms, fcfYield ur TTM-FCF/mcap. Utdata: SAMPO prognos −0,0948 · peg null · omsCAGR 0,0815 · resCAGR −0,0175 · fcfMarg 0,1352 · fcfYield 0,0594; SPG prognos −0,533 · peg null · omsCAGR 0,0636 · resCAGR 0,2936 · fcfMarg 0,3739 · fcfYield 0,034.

## Medianer + kvartiler (projektets EGEN lasBranschMedianer; kvartiler + universumjämförelse = dataset-sidornas standing-funktion, omräknade automatiskt)

- **finans 14→15: P/E 14,5→14,6, kvartiler 12,7–16,3 → 12,8–16,0 (n 14→15), FCF-marginal 40,9→32,1 %** (Sampos 13,5 % float-FCF drar medianen kraftigt ned — banker/float-bärare-klyftan syns nu i medianen)
- **fastighet 12→13: P/E 11,3→11,4, kvartiler 9,7–21,1 → 10,0–20,1 (n 12→13), FCF 31,4→31,9 %** (SPG 14,4 mitt i spannet)
- **totalt: 21,2 (n=125 av 134)** — oförändrad median
- **INGEN ny aspektsida** (förhandsmätning /tmp/s2u2omg7-fore.mts på 132-trädet + full landsvep: ingen matta på 4; finans/usa null → SPG gör fastighet/USA 1→2, fortfarande under tröskeln; sidkontroller förväntas kvar 165)

## KVD — komplett

| Kontroll | Resultat |
|---|---|
| Kontraktstest (testa-dataset-aspekter.mjs, cachad tsx-CLI) | **GRÖNT — 165 sidkontroller, 0 fel, 30 kända varningar** (exakt som förutsagt: ingen ny aspektsida) |
| Läckagevakt (v98-dataset-vakt.mjs, dynamiskt universum) | **GRÖN — 0 träffar, 134 tickers + 134 namn i 1 447 utdatafiler** |
| tsc (node node_modules/typescript/bin/tsc --noEmit) | **0 fel** (även via pre-commit-grinden) |
| prod HTTPS (lab.ak1nvestor.com) | **200 ×6: / · /dataset · /dataset/finans · /dataset/fastighet · /api/data/nyckeltalsguide · /llms.txt** |
| Bygge | INGET (endast data/ + public/ = dataleverans; Vonovia-precedensen — servade sidor visar 132-tal tills prod-synkens bygge) |
| R2 | Orörd — priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd |

## Ärvda flaggor / notiser till dataägaren

- **Två nya negativa prognosTillväxt-rader** (SAMPO −9,5 %, SPG −53,3 % — universumets första): aspektmodulernas prognos-tillväxt-sidor hanterar negativa värden (kontraktstest grönt) men median/kvartiler för prognos-tillväxt i berörda branscher bör bevakas när fler normaliseringsrader tillkommer — PEG-konventionen (null vid prognos ≤ 0) följer källans egen n/a-praxis.
- SAMPO.HE-kursen är fördröjd slutnotering (börsen stängd vid hämtningen); SPG-kursen är realtid med börsen öppen (AIR.PA-precedenten, ärligt dokumenterad i källa+notering).
- CAGR5ar-fältnamnet vs 4 räkenskapsår (ärvd s1-u3-flagga, gäller nu 134 rader).

**Skript:** /tmp/s2u2omg7-fore.mts · /tmp/s2u2omg7-append.mjs · /tmp/s2u2omg7-llms.mjs (idempotenta; llms-skriptet är omg6:s ordagranna återanvändning — helt dynamiskt).
