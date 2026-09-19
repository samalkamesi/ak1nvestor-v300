# KONTROLL 2026-09-19 — sa-laser-du-abb-q3-2026.json (ABB Q3 2026-läspaket)

Granskare: agentfabrik s1-u1, omgång "Spår 1 (granskare) 1/3" — auto-s1-1789804748544.
Anspråk: data/vakten/auto-s1-1789804748544-u1-ansprak.md (skrivet FÖRE arbetet).

## Val av objekt (pivot, duplikatregeln)

Uppdragets ordagranda objekt "m9-utkast #1" är sedan 2026-09-14/16 fullgranskat: alla
sex unika m9-slugar (sju rader — branschmedianer-akm2 i v1+v2) bär `.md` + `-diff.json`
+ `-KONTROLL` i `granskning/`. Arbetsytan följer worklog-presedensen (s1-u1 09-17,
Nordea-pivoten): nästa tidigaste återstående ogranskade objekt i spåret väljs i stället.

**Valt objekt:** `kvartal/2026-q3/sa-laser-du-abb-q3-2026.json` (skapat 2026-09-15).
Motivering: mtime-tidigaste ogranskade objektet i hela spåret (jämsides sandvik-paketet,
09-15; före branschguidevågen 09-16+ och övriga kvartalspaket 09-16+). Ingen gransknings-
artifact under någon av könens två namnkonventioner (`kvartal-2026-q3-abb*` /
`sa-laser-du-abb-q3*`). Utkast-JSON:en orörd av granskaren — leveransen är nya filer.

## Metod och underlag

- **Vintage-disiplinen:** textens medianer är daterade "beräknad ur samma insamling den
  2026-09-15, tolv industriaktier" och "universummedian (P/E, n=106)". Dagens
  `bolagsunivers.json` är 195 bolag (industri n=18) efter dataset-djup-spårets expansion
  09-16→09-19 — därför verifierades medianerna mot **byggtidens vintage 0e399f13**
  (sista commit av filen före 2026-09-16; 115 bolag, industri n=12, universum P/E n=106 —
  samma vintage-hash som Nordea-granskningen redovisade). Mediankonvention: projektets
  egen `median()` i `src/lib/dataset-nyckeltal.ts` (jämnt antal → medel av de två
  mittersta) — replikerad i granskningen.
- Alla övriga tal mot källfilernas råvärden: `data/analyses/ABB.ST.json`,
  `data/portfolj-system/bolagsunivers.json`, `data/blogg-utkast/kvartal/2026-q3/kalender-industri.json`
  (+ kalender-konsument/finans för paketlistan), `data/rapporter/vagvalidering-SENASTE.json`.

## Kontrollresultat — 71 maskinella kontroller, 67 GRÖNA, 4 fynd (F1–F4)

**Kalender och urval (8/8 gröna).** Rappdag 2026-10-20 = tisdag ✓ (kalender-industri,
officiell källa global.abb, hämtad 09-15; sidan svarar HTTP 200 vid granskningen);
"ett dygn före SKF (21 oktober) och två före Sandvik och Atlas Copco (båda 22 oktober)" ✓
exakt mot kalendern; paketlistans H&M 24/9 ✓ (kalender-konsument), Industrivärden 7/10 ✓
(kalender-industri), Ericsson 15/10 ✓, Volvo Cars 23/10 ✓. Urvalspåståendet "bland de
återstående bolagen i analysbiblioteket är ABB det som rapporterar tidigast" ✓ EXAKT —
biblioteket (11 analyser) minus de sju paketbolagen lämnar ABB 20/10 och AstraZeneca
30/10 som enda kvarvarande; även descriptionens "säsongens tidigaste återstående rappdag
i analysbiblioteket" håller. "ABB står utanför vågvalideringens tolvbolagsuniversum" ✓
(0 ABB-träffar i vagvalidering-SENASTE.json; texten redovisar ärligt "inget dom-kvitto").

**Motordata (13/14 gröna).** Vågklasser 5/5 ✓ (mikro basbygge, kort korrigering,
medellång/lång/mega impulsvåg — ABB.ST.json, verified 2026-08-24 = textens "verifierad
2026-08-24" ✓). 25-cellersmatrisen "15 bullish-, 5 bearish- och 5 neutrala" ✓ EXAKT —
cell-för-cell uråterbetald ur matris25. Prisnivåer 4/4 ✓ (52v-låg 442,20 · MA200 840,79 ·
MA50 981,62 · 52v-högst 1 058,50). 52-veckorsposition 82 % ✓. Volatilitet: se fynd F2.

**Nyckeltal (15/15 gröna).** Kurs 917,80 (insamling 09-03) ✓ · börsvärde ≈1 663 mdr ✓
(1 662,948) · ROE 32,6 ✓ (0,3257) · ROIC 24,2 ✓ (0,2416) · bruttomarginal 40,3 ✓ (0,4025)
· EBIT-marginal 16,9 ✓ (0,1691) · nettomarginal 14,1 ✓ (0,1409) · FCF-marginal 4,4 ✓
(0,0439) · TTM +14,2 ✓ (0,142) · femår +4,1/+24,1 ✓ (0,041/0,2413) · prognos +12,7 ✓
(0,127) · P/E 35,4 ✓ (35,423) · skuld/EK 0,56 ✓ (0,5575). Ärlighetsraderna håller mot
källraden exakt: räntetäckning osatt (null) ✓, serierna EK/FCF tomma ✓, "fyra redovisade
år (2022–2025)" ✓, ROIC-proxy-formeln ✓ (källans not ordagrant), MarketStack utan färsk
data ✓.

**Medianer (10/10 gröna — EXAKTA mot vintage 0e399f13 med projektets konvention).**
Industrimedian n=12: ROE 20,28→20,3 ✓ · ROIC 17,14→17,1 ✓ · brutto 38,28→38,3 ✓ ·
EBIT 16,89→16,9 ✓ · netto 12,19→12,2 ✓ · FCF-marginal 10,79→10,8 ✓ · TTM 8,40→8,4 ✓ ·
skuld/EK 0,4632→0,46 ✓ · P/E 28,005→28,0 ✓. Universummedian P/E 20,249 på n=106 →
textens "20,2 (106 bolag med data)" ✓. Not: med fel mediankonvention (nedre mittersta)
ser flera tal ut att avvika — konventionen är avgörande; texten följer koden.

**Datavakten (4/4 gröna).** P/B 104,8 ÷ ROE 32,6 % = 321,7 → textens "ungefär 322" ✓;
det rapporterade P/E 35,4 ✓; EV/EBIT 275,5 ✓ (275,537); FCF-avkastning 0,1 % ✓ (0,0009).
Implicit EPS 917,80 ÷ 35,4 = 25,91 → "cirka 25,9 kronor" ✓ (båda förekomsterna).

**Övningar (19/20 gröna).** Övning A: serien 2,47→4,73 mdr resultat och 29,4→33,2 mdr
omsättning ✓ (2 475→4 734 M; 29 446→33 220 M); "hela resultatökningen från marginaler
och mix" ✓ i aritmetiken (CAGR-kontroll: oms +4,1 %/år ✓, resultat +24,2 %/år ≈ källans
24,1 ✓; "sex gånger fortare" = 24,1/4,1 = 5,9 ✓). Övning B: rutnätet 9/9 celler
omräknade ✓ (spann 5,1–6,1 mdr); "en procentenhet marginal ≈ 0,33 mdr" ✓ (0,332);
"tre procent omsättningsrörelse 0,17 mdr" ✓ (5,61−5,44=0,17); "omkring dubbelt" ✓
(0,33/0,17=1,96). Övning C: 35,4 ÷ 1,127 = 31,4 ✓; "knappt hälften" — se fynd F3.

**Superlativtest (serie-systemläxan).** "Börsens tyngsta industriposter" ✓ mot byggtidens
vintage (ABB 1 663 mdr är industrigrenens tyngsta; tvåa Atlas Copco 984). Notis utan
diff: dagens fil (195 bolag) bär Embraer med 13 200 mdr i industrigrenen (09-18-tillskott,
BRL/ADR-redovisning) — textens tidsanknytning till insamlingen 09-03 gör påståendet
korrekt i sitt sammanhang. "Sverigebörsens högsta resultattakt" — se fynd F1.

## Juridik — REN enligt 2007:528

Verbträffar i title+description+body+tags (8 mönster): samtliga nekande/neutrala —
"det är inte en rekommendation att köpa, sälja eller behålla några värdepapper",
"inga köp-, sälj- eller hållningsrekommendationer förekommer", "aldrig en handssignal",
konsensusbegreppet "inte en prognos från oss" + "en räkneövning … inte en prognos" +
"aldrig en måttstock". Lagrum: endast lagen (2007:528) 2 kap 5 § ✓ (utbildnings-
formuleringen "pedagogisk finansutbildning … inte investeringsrådgivning"); inga
främmande lagrum (2022:260 / 2022:261 / 1985:716 / 2005:59: 0 träffar — ingen
lagrumsblandning). Kurs- och scenarieformuleringar håller utbildningsramen genomgående.

## 911-referenser

0 träffar / 6 mönster ("911", "9/11", "9-11", "11 september", "september 11", "nine")
× 4 fält (title, description, body, tags). RENT.

## Interna länkar — 12/12 HTTP 200 (loopback)

/dataset/industri/{roe, roic, netto-marginal, fcf-avkastning, omsattningstillvaxt-ttm,
prognos-tillvaxt, pe, vardering, skuldsattning, universumjamforelse} + /bolag/abb-st +
/kurser — samtliga 200 mot localhost:3000. Extern källa global.abb
(/group/en/investors/financial-calendar): HTTP 200.

## Fynd (flyttkrav F1–F4 — diff i sa-laser-du-abb-q3-2026-diff.json)

- **F1 (högst; superlativfel — seriens systemläxa).** Bodyn: "ABB kombinerar
  **Sverigebörsens högsta resultattakt**". FALSKT mot universumet: fem svenska bolag
  ligger över ABB:s +24,1 %/år i vintage 0e399f13 (EQT 60,4 · H&M 50,5 · AstraZeneca 46,0
  · Wallenstam 32,5 · Essity 31,5). Däremot är ABB HÖGST i **industrigrenen** (alla
  länder: Alfa Laval 22,5 tvåa) — korrigeringen är kirurgisk, superlativen behålls inom
  rätt population: "industrigrenens högsta resultattakt i universumet".
- **F2 (låg; källspårbarhet).** "Volatiliteten mättes till **25,9 procent per år**" —
  källan (ABB.ST.json) redovisar "σ 26 %/år" i såväl bullets som motiverings-text; 25,9
  finns inte i det interna trädet (0 träffar i ABB.ST.json). Byt till 26 %.
- **F3 (låg; aritmetisk formulering).** Övning C: "2022 års resultatbas (2,47 miljarder)
  var knappt hälften av 2025 års (4,73)" — 2,47/4,73 = 52,3 %, alltså strax ÖVER hälften.
  Byt "knappt hälften" → "strax över hälften".
- **F4 (låg; metadata-kontrakt).** readingMinutes 6 mot N5-systematiken (ord/600,
  avrundat): bodyn 2 023 ord ⇒ 3 min. Samma fyndklass som Nordea-granskningens B1
  (2 455 ord ⇒ 4). Byt 6 → 3.

Notiser utan diff (C-poster i diff-filen): publishedAt 2026-10-16 (rappdag −4 dagar) —
seriekonventionen varierar (Volvo-paketet 09-15 vid skapandet), kundens publiceringsval
(R2); universumets tillväxt 115→195 sedan byggtiden berör inte texten (dateringen + n
låser basen korrekt) men nästa datainsamling bör omräkna medianerna vid eventuell
uppdatering; "52-veckorsspann"-procenten och samtliga motorvärden är bundna till
mätningen 2026-08-24 vilket texten redovisar.

## Bedömning

**FLYTTKLAR EFTER RÄTTNINGAR** — 67/71 kontroller gröna; fyra kirurgiska byten (F1–F4,
samtliga strängar maskinellt verifierade UNIKA i filen) gör paketet publikt-mogent.
Styrkorna är värda att lyfta: datavaktens valutablandnings-pedagogik är seriens bäst
formulerade identifieringsövning, vintage-dateringen av medianerna (n + datum) är exakt
den metod granskningen kräver, och ärlighetsraderna omvreder varje osatt fält korrekt.
Publicering förblir kundens beslut (R2). Utkastet ändras av paketets ägare (s4-spåret)
eller nästa våg — inte av granskaren.

KVD: endast nya filer i data/blogg-utkast/granskning/ + anspråksfil; src/ orörd =
INGET bygge; tsc oberörd (ingen kod); R2 orört (priser/tier/publicering); data/blogg/
orörd; syskonytor orörda; commit med pathspec.
