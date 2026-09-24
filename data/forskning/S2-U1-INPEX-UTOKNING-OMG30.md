# S2-U1 — INPEX 1605.T: Japan/energi 0→1 (Japans åttonde gren) — OMG30

**Manifest:** auto-s2-1790237704889 · **Agent:** s2-u1 (byggare 1/3, omgång 30 i spår 2-serien)
**Datum:** 2026-09-24 · **Universum:** 256→257 vid append (diskens slutläge 259 med syskonets ride-along, se §6)

## 1. Val (anspråk disk-först FÖRE datahämtning)

`data/vakten/auto-s2-1790237704889-s2-u1-ansprak-omg30.md`. INPEX 1605.T — Japan/energi
0→1 = JAPANS ÅTTONDE gren: Japan-serien i spåret (Nippon Steel femte · Takeda sjätte ·
Komatsu sjunde) fick sin nästa tomma gren. Japan efter denna leverans: 20 bolag i 8 grenar
(konsument 5 · kommunikation 5 · finans 5 · material 1 · teknik 1 · hälsa 1 · industri 1 ·
energi 1). Signaturvärde: universumets första rad för ett IMPORT-lands energiproducent —
grenens övriga 24 bärare är export-suveräner; INPEX producerar åt ett land som importerar
85–90 % av sin energi (USD-intäkter mot JPY-kostnader).

Duplikatkontroll: 0 träffar INPEX i universumfilen ("1605" ger endast falsk positiv
`160500000,` — ett tal i annat bols paranoid-text) och 0 i worklog.

## 2. Källhämtning (ALLT live 2026-09-24)

StockAnalysis tyo/1605 (TYO-primärnoting JPY, S&P GMI-underlag; Takeda/Nippon
Steel/Komatsu-precedenserna): översikt + statistics + financials + balance-sheet +
cash-flow-statement (års- och TTM-kolumner, finansvyer Last updated 2026-08-10, TTM till
Jun 30 2026) + Yahoo chart-API: meta regularMarketPrice 3 834,0 = SA-close 3 834 (0,00 %
band EXAKT), chartPreviousClose 3 913 = SA previousClose.

**Kurskoherent publikationskedja** (Komatsu/Takeda-precedensens prisvintagespridning
~2 %, båda baserna dokumenterade i paranoid): P/E 10,39 = 3 834/369,20 (källans fält 10,60
= prev-close 3 913/EPS) · P/B 0,87 = 3 834/4 390,36 · mcap 4 456 mdr = 3 834 × 1 162,28 M
(common-EK/BVPS; källans 4,55 T = prev-close-bas) · EV/EBIT 5,57 = (4 456+1 102,133)/998,113
· fcfYield 9,44 % · prognosTillväxt +16,4 % (fwd P/E 8,92-vägen) · PEG 0,63.

## 3. Signaturtal (noteringens innehåll — utbildning, aldrig råd)

1. **Upstream-renheten:** EBIT-marginal 50,85 % TTM (brutto 56,16 %) utan raffinaderi- och
   detaljled — grenens median-EBIT 18 %: INPEX bär nästan tre gånger grenens lönsamhet per
   intäktsyen; marginalen är kemisk (fat-priset), inte moat — femårsspreaden 6,5 pp är
   oljeprisets vågor (moat-fältet levereras i FRACTION 0–1 enligt omg29-u1:s
   konventionsfynd; de 16 äldre procent-raderna orörda = dataägarkö).
2. **Handeln under bokfört värde:** P/B 0,87 medan BVPS-trappan gått 2 253→4 073 ¥
   (+16,0 %/år): marknaden betalar 87 öre per bokförd yen i ett bolag som byggt EK vartenda
   år — reservernas bokförda värde är en skattning: balansräkningens golv är golvt hos
   bedömaren av reserverna.
3. **Altmaans paradox:** Z-score 2,01 i GRÅZONEN medan D/E 0,25 · Debt/EBITDA 0,96
   (replik EXAKT: 1 318 323/1 377 061) · räntetäckning 17,34× är gröna — Z-formeln
   straffar E&P-normalanatomin (tillgångar 8,4 T ¥ mot omsättning 2,0 T ¥); samma
   gråzons-fenomen som fastighetscellen: formeln känner fabriker, inte reservoarer.
4. **Beta −0,14:** negativ femårige-beta — energibäraren som motvikt; bakåtblickande
   vind, inte egenskap.
5. **Kassaflödeshären:** FCF 5/5 positiva (305,0→564,2→536,0→353,7→399,9 mdr ¥);
   utdelningar 46,7→111,4 + återköp 70–130 mdr varje år ⇒ FY2025 återbäring 201,8 mdr =
   4,5 % shareholder yield = 50,5 % av årets FCF — E&P-kassan delas ut för att mogna
   reservprojekt inte kan återinvesteras i egen takt.
6. **3 720 anställda:** 527,7 M ¥ omsättning per anställd — värdet sitter i hålet i
   marken, inte på lönelistan (EQNR:s ~24 000 anställdes integrerade kedja som spegel).
7. **Basårets falla:** FY2021 = bokslutsbytesåret mars→december (+86,8 % mot 2020 enligt
   källan) — 5-års-CAGR +12,7 % blåses upp av övergångsåret; trenden från första rena
   decemberåret: omsättning −3,5 %/år (2 324,7→2 011,4) MEDAN netto håller ~394 mdr.
8. **ROIC 6,32 % mot WACC 3,11 % = +3,21 pp** — Japan-familjens trånga spreadar
   (Komatsu +0,74 · Takeda +1,12): kapitalet tjänar sin kostnad med marginalen.

## 4. Kvartiler + universumjämförelse (MINA tal: före 22 → min append 23)

| Mått | före → efter | kvartiler före → efter | n |
|---|---|---|---|
| P/E | 17,6 → 17,3 | 12,7–22,2 → 11,9–22,1 | 21→22 |
| P/B | 2,3 → 2,2 | 1,5–2,8 → 1,5–2,7 | 22→23 |
| EBIT-marginal | 17,3 % → 18,0 % | 12,1–25,4 % → 12,6–30,9 % | 22→23 |
| FCF-marginal | 9,0 % → 9,7 % | 6,6–19,4 % → 6,7–20,9 % | 21→22 |
| omsTillväxt | 11,6 % → 11,2 % | 7,3–40,8 % → 6,5–39,7 % | 22→23 |
| resCAGR | −15,1 % → −13,8 % | −33,3–5,5 % → −29,7–7,4 % | 20→21 |

INPEX = energigrenens nya P25-gräns (P/E 10,39 under gamla P25 12,7) och lyfter
EBIT-P75 med 5,5 pp. Totalt median P/E 20,4 stabilt (n 245 av 257 vid mitt läge).
Universumrang: P/E 29/245 · P/B 24/254 (under-book-kvartilen) · fcfYield 190/225 (övre
delen) · EBIT-marginal 27/255 HÖGSTA (topp-3 = fastighetsrader 99,9/95,5/92,5 %).

## 5. KVD (allt GRÖNT)

- **Aritmetikgrind 41/0** (`_s2u1o30-grind.mjs`; källtal oberoende inskrivna, raden
  importeras): EN ÄRLIG ABORT-cykel — tre fel i egna kontrolluttryck kurerade FÖRE grönt
  (onödig dokumentationsrad med handavrundat tal · enhetsförväxling ¥×M/MDR i payout-
  repliken · BVPS-trappans tillväxt rättad 16,6→16,0 % i noteringen) samt rådordsvakten
  gjord frasspecifik ("återKÖPen"/"SÄLJer olja" = svenska verb, inte råd). Språkgrind:
  0 CJK/typografiska citat/hårda mellanslag. Moat-FRACTION-konventionen testad.
- **Append 256→257** (`_s2u1o30-append.mjs`): mutex via mkdir (omg29-u3:s clobber-läxa),
  prefix-bit-identisk stringify-round-trip (indent 2), idempotens bevisad (andra körningen
  IDENTISK rad, exit 0).
- **llms.txt HELREGEN** (`_s2u1o30-llms-regen.mjs`, o26-kropp oförändrad fabrik): GRÖN på
  diskens faktiska 259-läge, energi-raden omräknad (P/E 17,2, kv 12,4–22,0, n 24),
  aspektrader data-driven enligt omg24-kursen, round-trip kontrollerad.
- **Läckagevakt v3 0 träffar** (466 sökningar; dataset-html + llms Dataset-sektionen).
- **Kontraktstest 189/0/30 GRÖNT** oförändrat (cellen Japan/energi n=1 < mattan 5, ingen
  ny landsida).
- **tsc 0** via projektbinär (INGEN src-ändring — data-vägen; ALDRIG npx, ALDRIG bygge).
- **Prod 200 ×3** (/ · /llms.txt · /dataset) och llms LIVE "på 259 bolag" — data-vägen
  levererar utan ombygge; R2 orörd; data/blogg/ (live) orörd; juridikgrinden 2007:528
  (utbildning, aldrig råd).

## 6. Race-bokföring (omgång 30)

Syskonet s2-u2:s +2 (ENI.MI + TRN.MI, Italien/energi 0→2, hamtat 2026-09-24) landade på
disken EFTER min append (INPEX kvar, 0 duplikattickers, konvergent 259). Disjunkta
koordinater (Italien/energi mot Japan/energi); llms-regen kördes matt-driven på det
gemensamma slutläget. Energi-grenen på diskens slutläge: 25 bolag.

## 7. OMG29-RESET-FYNDET (öppet bokförd — dataägarärende, ej denna leverans)

Omgång 29 (manifest auto-s2-1790042105079, 2026-09-22) levererade enligt status-filen
"klar" (kod 0 ×3): Keyence 6861.T · PDD+JD · LG Electronics+Samsung Electro-Mechanics+Hanmi
Semiconductor — u1:s logg citrar "/llms.txt LIVE på 259 bolag", u3:s "konvergens 262".
ÄNDÅ: git log för bolagsunivers.json slutar vid Komatsu (d7eae3bc, omg28); diskens läge
före denna omgång = 256; protokoll/verktyg borta (endast _s2u1o29-commitmsg.txt kvar);
`git log --all --source` ger 0 träffar på omg29-nyckelord; `git fsck` visar 250 dangling
objekt utan identifierbara omg29-commits. Deras sex bolag är FÖRLORADE ur huvudträdet —
återställning enligt v161-reset-precedensen (klonsökning/hashjakt) är DATAÄGARENS ärende.
Deras koordinater har respekterats av denna agent (INPEX disjunkt); dataägaren bör söka i
fabriksklonarnas .git efter deras commits ELLER köra om koordinaterna som nya leveranser.

## 8. FIFO

INPEX Q3 2026 (januari–september, december-bokslutets tredje kvartal) rapporteras i
november 2026 — INPEX har lämnat de japanska marsbolagens oktober-november-kalender.

## Verktyg (levererade)

`_s2u1o30-inpex-rad.mjs` (radens enda källa) · `_s2u1o30-grind.mjs` ·
`_s2u1o30-append.mjs` · `_s2u1o30-medianer.mjs` · `_s2u1o30-llms-regen.mjs` ·
`_s2u1o30-lackagevakt.mjs`
