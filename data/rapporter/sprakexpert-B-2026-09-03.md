# Språkexpert-granskning batch B — deep-courses.json (pass 1 av 2)

**Datum:** 2026-09-03
**Fil:** `public/deep-courses.json`
**Omfång:** 84 kurser (sorted keys index 84–168): km-037–km-070, konfluens–misbehaving (10 bokkurser), mk-01–mk-11, of-permanent-value/one-up-on-wall-street/origins-of-the-crash, pc-01–pc-20, pf-01–pf-06
**Metod:** per kurs: title/summary/why/learn/history/lynch/graham/ak1 + 3 hash-valda kapitel fulltext (blocks+quiz), samt mönsterskanningar över hela batchen (fristående ar/pa/gor/nar/dar, degenererade åäö-ord, dubbelord, engelska läckor, kinesiska tecken, tomma tips).
**Verktyg:** kirurgiska exakta replacements per kurs med förekomstverifiering (engine vägrar vid antalavvikelse). Efter varje fil: JSON-parse + kursantal 333 kontrollerat.

---

## Resultat i siffror

- **~940 enskilda förekomster rättade** i 100+ verifierade rättningsoperationer över samtliga 84 kurser.
- Största systematiska fixar (förekomstantal):
  - `1. Grunderna — varför detta matters` → `…spelar roll` — **110 förekomster** (55 kurser × chapters_list + chapters)
  - `4. AKM1 1.1 integration` → `4. AKM1 1.1-integration` (särskrivning) — **84**
  - `definitionen av roe./roa./ebitda.` → versaler i quiz-tips — **150+**
  - `vågör` → `vågor` i konfluens-kursen — **26** (inkl. KURSTITELN)
  - `founded/spun off YYYY` i pc-mallkursernas historia+kapiteltext — **60+**
  - `En systematisk approach` → `ansats` (10 pc-kurser × 6) — **60**
- **0 strukturfel** efteråt: 333 kurser, 1 648 quizfrågor i batch B, alla quiz har q/alternativ/ratt intakta.
- Kvarvarande mjuka bindestreck (U+00AD, 8 st) finns ENDAST utanför batch B — ej mitt omfång.

## Felandekategorier (typexempel)

1. **Maskinspår enligt regelverk**
   - Verb på `-är`: `När lönär det?` (km-052 summary+learn), `det som lönär sig` (liars-poker), `modet … lönär sig` (margin-of-safety), `nya designar lanserades` (km-044), `kommande ekonomiska förändrar` (km-040), `utlöser uppskjutandekonsumtion` (mk-09)
   - `-ör`→`-or`: `vågör`→`vågor` (konfluens, market-wizards, martin-pring, mina-basta, origins — 34 totalt), `konsolideringsvågör` (km-040), `skuldbörder` (km-043), `ränter`→`räntor` (km-060), `VD:är`→`VD:ar` (km-068)
   - Norsk/danska spår: `branssen`, `sektoren`, `strategien`, `letta/lette/lettit`, `akvisitioner`, `pensionärar`, `industripoduksjon`, `risknivär`, `flerdimensional`
   - Kinesiska tecken i svensk mening: `'鲸鱼'-order` (km-069), `faller沃尔沃` = Volvo (mk-01)
   - Skenande ord: `skalarar` (skapar, km-046), `snarba` (snarare än, km-038), `förluter` (förluster, km-037), `nyckeltalanger` (km-038), `kompowereffekt` (pf-06), `pokertäfling` (pokerbord, pf-02), `vinstabilitet` (pc-08), `mining`
2. **Engelska läckor i svensk mening** (citerade titlar/termer lämnade orörda): `matters` (110 i titlar + 2 löptext), `beyond ren compliance` (km-050), `svenska bolag like Qlik` (km-038), `en companies` (km-048), `approach` (7+ kurser), `underestimera` (2), `wife` (pc-09), `registered arbetslöshet` (mk-02 ×2), `founded/spun off` (pc-mall ×60), `fiscal politik`→`finanspolitik` (mk-07, 32 förekomster), `Kina-USAs`→`Kina-USA:s` (mk-05/11), `asymmetric` (origins), `sludge-ar` lämnad (citerad term)
3. **Grammatik**: genus (`en nyckeltal`, `en ramverk`, `ett robust portfölj`, `en minefält`, `det fattiga`-typ ~60 fall), kongruens (`driven av framtida förväntningar`, `för höga inflationstakt`), ordföljd (`direkt påverkar`→`påverkar direkt` km-049/051, `att ibland kan de`→km-065, `minimerar risken`→`minimeras` km-065), särskrivning (`snabb mode`, `satellit-systemet`, `Kollektivavtalens om tvåårs-cyklar`, `läg`, `säkerhets marginaler`), reflexiva/genitiv (`företagets`→`företagens`, `tillgångs`→`tillgångens`, `sitt potential`→`sin`)
4. **Avkapade/garberade meningar**: `spårar sina rötter tillb till 1973` (km-061), `löpå ut` (mk-04/06 ×4), `Om en akties po sjunker` (km-064), `aktiellinje` (pf-02), `ägelsektor` (pf-01), `sammanslutning`→`sammansättning` (pf-04), `Fr ett institutellt` (pf-04), `optionsernäringarna` (km-060), `Bnp-påverkande`, `utanförHong Kong-börsen` (mk-11), `medBudgetsaneringskommittén` (mk-07), `förvärvte` (pc-07), `utlöser u→`
   - Trunkerad mall i konfluens: `Quantitative Value-kursens läg gäller` → `lära`
5. **Dubbelord**: `att att köpa` (km-065), `en en procentig` (km-059, omskriven till korrekt delta-definition), `fallet medICA` (km-044), `mäklare eller en mäklare` (km-051), `skrattade och arg` (liars-poker), `skatteskatt` (km-049). (`med med`, `var var` var korrekta och lämnades.)
6. **Inverterad/blandad mening med finansiell betydelse**: km-045 G: `handlades till en premie under deras substansvärde` → `ett pris under`; km-050 G: `återköp … till en premie` → `rabatt`; km-038 `Rule of 40-talet` → `Rule of 40`; pc-10 `Ericsson och Siemens … Ericsson Siemens` → `Sony Ericsson`; km-062 `fair värde` → `verkliga värde`; pc-09 `GLP-1-antagonister` → `agonister`.
7. **Versaler/förkortningar**: roe/roa/ebitda → ROE/ROA/EBITDA i tips (150+), `AK1M/AK1M1/AK1M` → `AKM1` (6 kurser), `B2b`→`B2B`, `SpecialEkonomiska Zoner`→`speciella ekonomiska zoner`, `Mats Rahmstrand`→`Rahmström`.

## Osäkra — markerade, ej gissade (lämnade orörda)

1. **km-039 kap 1**: `en unik investeringsthorning` — otydig garbling; avsikten kan inte säkert rekonstrueras ("terräng"? "turning"?).
2. **mk-01 history**: `etablerade BNP som centralbudgetens styrverktyg` — "centralbudgetens" troligen fel, korrekt term osäker (konjunkturpolitikens?).
3. **mk-02/mk-04**: `räntesvans/räntesvansar` (4 förekomster) — ej etablerad svensk term, sannolikt avser ränteswappar/styrränteförväntningar; konsekvent använd i båda kurserna.
4. **pf-04 why**: `för sent sälja vinnare och för tidigt sälja förlorare` — möjligt medvetet (rebalanseringsperspektiv) men kan vara omkastat avseende disposition effect.
5. **misbehaving kap 11**: quiz `Shefrin-Statman 1984` vs löptext `Shefrin och Thaler … 1984` — kvarvarande sakfel (utdelningsartikeln är Shefrin–Statman).
6. **km-050 B2**: definitionen hävdar att utdelning är `avdragsgill kostnad för det utdelande bolaget` — sakfel kvar (språket rättat).
7. **pc-06 (H&M)**: `V14` används som både AKM1-variabel och "vecka 14" — semantisk kollision i summary/löptext, kan ej lösas kirurgiskt.
8. **km-061 LYNCH**: `'kyssa aktien'` och km-060 `'beta ut'` — citerad jargon/idiom, lämnade.
9. **of-permanent-value**: `cigarrbrott` (Grahams cigar butt) — konsekvent myntad översättning i kursen, lämnad.
10. **km-038**: `'nächste große Ding'` (tysk citat), `'flyktighetsindikatorer'` (citerad term) — lämnade.
11. **pc-11–pc-20 (mallkurser)**: meningar av typen `Grunderna i X är centralt för att förstå X` och `Bolagets tidiga historia präglades av [beskrivning utan artikeln]` är semantiskt tomma mallkonstruktioner — språkfelen (founded, approach, artiklar) är rättade, men innehållslösheten kräver omgenerering, ej språkrättning.
12. **km-053**: `schablonmässig avdragsgill ålder tilläggsavgift` rekonstruerad till `ett schablonmässigt avdragsgillt årligt tilläggsbelopp` — REKONSTRUKTION, bör faktagranskas.
13. **km-056 kap 1**: `En 'dov' hawkish ton (vilseledande stram)` rekonstruerad till `En oväntat 'hawkish' ton (strammare än väntat)` — REKONSTRUKTION.
14. **km-042** `räntelägenhet`→`ränteläge` och **km-044** `värdeförslag`→`värdeerbjudande` — medelhög konfidens (sannolik avsikt), verifiera gärna.
15. **km-047** `utdelningskningar`→`nedskärningar av utdelningen` och **mk-10** `lagerbrist`→`fulla lager` — rekonstruerad avsikt.

## De tre värsta fynden

1. **Kinesiska tecken mitt i svenska meningar** — km-069: `En '鲸鱼'-order (en enorm köp- eller säljorder)` och mk-01: `När BNP kontraherar faller沃尔沃 och Atlas Copco` (沃尔沃 = Volvo). Rå maskinöversättningsläcka; rättade till `'val'-order` respektive `Volvo`.
2. **`vågör` i flaggskeppskursens TITEL** — konfluens-kursen hette `Konfluens — Där Värde Möter Vågör: DEN SAMMANSATTA METODEN` (plus 25 förekomster i summary/learn/löptext, och ytterligare 8 i fyra bokkurser). Klassiskt `-ör`→`-or`-spår i det mest synliga fältet på plattformen.
3. **Systematiska titelläckor + inverterad finansiell mening**: (a) `1. Grunderna — varför detta matters` på 55 kurser (110 fält) och `AKM1 1.1 integration`-särskrivning på 70 kurser — genereringsspår som passerat alla tidigare granskningar; (b) km-045 Graham-citatet `handlades till en premie under deras substansvärde` gav motsatt mening (premie↔rabatt) — värdefel som språkgranskningen fångade.

## Verifieringsnotis (egen felkälla, åtgärdad)

Ett mellanled i den systematiska batchrättningen hade en bug (regel N skrev tillbaka gamla strängvärden och återställde regel N−1). Upptäcktes i slutverifieringen, motor skrevs om till engångspass med regex, kördes om och resultatet verifierades: 0 kvarvarande matters/lowercase-förkortningar/vågör/lönär/CJK/founded i batch B; parse OK; 333 kurser; quizstruktur intakt (1 648 frågor).

## Rekommendationer till pass 2

- Batch A/C innehåller med största sannolikhet samma systematiska fel (`matters`-titel, `AKM1 1.1 integration`, `vågör`, `founded`-mallar, 8 mjuka bindestreck) — kör samma mönsterbank där.
- Mallkurserna pc-11–20 behöver innehålls­omgenerering, inte språkrättning (se osäker #11).
- Faktagranska rekonstruktionerna i osäker #12–15 samt kvarvarande sakfelen #6 (avdragsgill utdelning) och #5 (Shefrin–Statman).
