# S2-U1 — MA: dataset-utökning omgång 8 (2026-09-17)

**Uppdrag:** manifestets "+1 bolag, kvartiler + universumjämförelse, läckagevakt 0, prod 200" (spår 2 DATASET-DJUP; omgång 8 — tidigare omgångar: se worklogs s2-u1/u2/u3 omg 1–7). **Agent:** s2-u1 (byggare, uppgift 1/3 i omgångens trio; syskon u2 "+2 bolag" och u3 "+3 bolag" kör parallellt).

## Objektval med omdöme

Duplikatkontroll före start: trädet 138 bolag (HEAD d85d4717), MA fri; omgång 7:s protokoll efterlämnade exakta koordinater: "kvar på 4: Sverige/hälsa + USA/finans (nästa omgångs koordinater)". VAL: **Mastercard (MA, finans, USA)** — finansbranschens mest citerade lucka och spårets pedagogiskt starkaste tillskott:

1. **V:s duopolpartner** — Visa-raden (V) redan i universumet: KO/PEP-precedenten upprepas i finansgrenen. Före-simuleringen bevisade paret i rådata: P/E 32,0 mot 31,5 och FCF-marginal 47,2 mot 47,6 % nästan identiska — marknaden prissätter kortduopolet som ETT kassflödessystem — medan ALLA skillnader lever i balansräkningsartefakterna (P/B 19,9 mot 89,6 · ROE 61,2 mot 241,2 % · skuld/EK 0,68 mot 4,40: återköpsmönstret i olika grad).
2. **Öppnar USA/finans-mattan 4→5** (BRK-B, GS, JPM, V → +MA) = NY aspektsida /dataset/finans/usa (ORCL-precedensen) — kontraktstestets sidkontroller 167→168, förutsagt i simuleringen FÖRE append.
3. **Universumets mest extrema substansartefakt** — P/B 89,6 (näst högsta är V:s 19,9) på book value 6,40 $/aktie mot kurs 567,75 $: kapitalstrukturpedagogiken i en enda rad (substansmått meningslösa när återköpen ätit balansräkningen — KO/ABNB-notens slutled, nu med siffror som sticker ut i kvartilplotten).

## Leverans — 1 bolagsrad (allt live-hämtat; stockanalysis översikt + statistics + financials + cash-flow-statement, S&P-underlag; stängningskurs 2026-09-16 16:00 EDT, sidor pålästa 2026-09-17)

**MA — finans — 567,75 USD / 497,35 mdr.** P/E 31,53 (fwd 26,96 ⇒ prognosTillväxt +17,0 % spårkonvention; källans 3-års EPS-prognos +16,30 %/år), PEG 1,86 spårkonvention (källans 1,63 som not — båda över 1: duopolens tillväxt är prissatt), P/B 89,62, EV/EBIT 24,29. ROE 241,2 % mot ROIC 93,8 % (WACC 8,0 % — spreaden nätverksmoraten lever av). Marginaler: brutto 100,0 % (källan redovisar ingen varukostnad — gross profit == revenue alla fyra åren; moat-medel 1,0 med spridning 0,0 pp: nätverksmodellens signatur, kostnadslaget är drift+marknadsföring inte COGS), EBIT 59,9 %, netto 46,3 %, FCF 47,6 %. Stabilitet: skuld/EK 4,40 MEN skuld/EBITDA 1,11 med räntetäckning 28× — samma skuld mätt mot bokfört kapital kontra rörelsen ger två olika världar (radens kapitalstruktur-läxa; skuld 24,6 mot kassa 11,6 mdr $). Serier kalenderår 2022–2025: omsättning 22,2→32,8 mdr $ (+13,8 %/år endpoint), resultat 9,9→15,0 mdr $ (+14,7 %/år), FCF 10,8→11,6→14,3→17,2 mdr $ (+17,0 %/år — kapitallös skalning: capex 0,4–0,5 mdr $/år, mindre än marknadsföringen; TTM 16,7 mdr $, fcfYield 3,4 %). Utdelning 3,48 $ (yield 0,61 %, payout 19,1 %) + återköp 8,9→12,0 mdr $/år i not: 80 % av ägarflödet går via aktiekursen inte kupongen; EPS 10,22→16,52 $ (+17,4 %/år) delvis återköpsköpt (skillnaden mot omsättningstillväxten = aktieantalets minskning). Beta 0,74; 52-vägers spann 464,52–601,62 $; nästa rapport 2026-10-29.

## Aritmetik — maskinverifierad

Före-skriptet (/tmp/s2u1omg8-fore.mjs, replikerar median/percentil/runda1 ur dataset-nyckeltal EXAKT) + append-skriptets kontroller: prognos 0,1695 · peg 1,86 · omsCAGR 0,1382 · resCAGR 0,1466 · fcfYield 0,0336 · fcfMarginal 0,4761 · moat 1,0/0,0 — GRÖN (första körningen RÖT på Två handräknade referensvärden med 5e-5-avvikelse — referenserna rättade till maskinvärden, inte tvärtom; maskinen är sanningsägaren).

## Medianer + kvartiler (projektets EGEN lasBranschMedianer; kvartiler + universumjämförelse = dataset-sidornas standing-funktion, omräknade automatiskt)

Före/Efter på 138→139-trädet (simulering EXAKT mot final):
- **finans 15→16: P/E-median 14,6 OFÖRÄNDRAD men kvartiler 12,8–16 → 12,9–17,6 (n 15→16)** — MA hamnar ÖVERPÅ P75: raden vidgar övre kvartilen utan att röra mitten (kvartilspridningens pedagogik: medianen säger inte allt). P/B 2,5→2,6 (P75 3,3→3,6), EBIT 50,2→50,4 %, FCF 32,1→40,9 % (n 8→9! finans har universumets tunnaste FCF-täckning — MA:s 47,6 % lyfter medianen 8,8 enheter: ensam rad förändrar branschens FCF-bild), tillväxt 9,1→9,6 %.
- **totalt: P/E 21,2 oförändrad (n 129→130 av 139 på mitt isolerade läge; final 141-träd: n=132/141)** — totalmedianen stabil; P75 30→30,3, P/B P75 7,5→7,6, EBIT 21,2→21,5 %.
- **finans/resultat-cagr-5ar-aspektraden omräknad** (llms): median 10,7 → 12,2 % (MA:s 14,66 % lyfter — kvartiler 4,8–13,9 → 6,2–14,3 %, n 9→10), universum n 102→103 (final 105).
- **USA/finans 4→5 ⇒ NY ASPEKTSIDA /dataset/finans/usa** (sidkontroller 167→168; URL + sitemap-post tillkommer data-drivet vid prod-synkens bygge — Vonovia-precedensen).
- **hamtat-max 2026-09-16 → 2026-09-17** (MA-raden är färskast) — llms "rådata"-stämpel följer lager-1-dateringen.

## KVD — komplett

| Kontroll | Resultat |
|---|---|
| Kontraktstest (testa-dataset-aspekter.mjs via cachad tsx-CLI — ALDRIG npx) | baslinje FÖRE: **167/0/30** · EFTER (141-trädet): **170/0/30** — TRE nya landaspektsidor en omgång: finans/usa (MA, min) + konsument/japan (TM, syskon) + material/schweiz (HOLN.SW, syskon) |
| Läckagevakt (v98-dataset-vakt.mjs, dynamiskt universum) | **GRÖN — 0 träffar** (141 tickers + 141 namn i 1 461 utdatafiler; llms Dataset-block + .next-utdata + sitemap/robots) |
| tsc (node node_modules/typescript/bin/tsc --noEmit) | **0 fel** (även via pre-commit-grinden) |
| prod HTTPS (lab.ak1nvestor.com) | **200 ×5: / · /dataset · /dataset/finans · /api/data/nyckeltalsguide · /llms.txt** |
| Bygge | INGET (endast data/ + public/llms.txt = dataleverans; servade dataset-sidor visar gamla tal tills prod-synkens bygge — Vonovia-precedensen) |
| R2 | Orörd — priser/tier/publicering orörda; data/blogg/ orörd; src/ orörd |

## Race-bokföring (fallet 13 i spårfamiljen)

Syskonens appends landade MITT i mitt fönster: efter min MA-append (139) kom TM (konsument/Japan) + HOLN.SW (material/Schweiz) i samma arbetsfil — läckagevakten (dynamiskt universum) var FÖRST som såg 141. Hanterat enligt BASF-precedenten + omg7-läxan: llms REGENERERAD på 141-trädet (MINA finans-tal oförändrade — syskonens rader rör inte finansvektorerna; konsument 16/material 14-rader uppdaterade i samma regen = syskonens interim självläkt); min commit tar deras två rader (innehåll intakt, deras protokoll/worklog förblir deras — deras blivande doc-commit blir förlustlös). Slutläge: **llms == universum == 141** vid commit. KVD körd PÅ 141-trädet (alla kontroller ovan). Finans-medianerna i mitt valuesektion gäller opåverkade: syskonens rader ligger i konsument/material-grenarna.

## Ärvda flaggor / notiser till dataägaren

- CAGR5ar-fältnamnet vs 4 räkenskapsår (ärvd s1-u3-flagga, gäller nu 139 rader).
- P/B 89,62 är universumets klart högsta — kvartilsplottar på aspektsidorna får en ny yttre punkt (P75-påverkan bevisat +0,3 på finans).
- finans-FCF-medianen 32,1→40,9 % är den största enskildrads-medianskiftet i spårets historia (tunn datatäckning n=9 — varje ny rad rör kraftigt).

**Commits:** data-commit (bolagsunivers.json + llms.txt) + dokumentationscommit (protokoll + worklog, denna fil).
**Skript:** /tmp/s2u1omg8-fore.mjs · /tmp/s2u1omg8-append.mjs · /tmp/s2u1omg8-llms.mjs (idempotenta, återanvändbara).
