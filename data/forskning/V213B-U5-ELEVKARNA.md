# V213B-U5 — Kontraktssvit: elevkärnan

**Datum:** 2026-09-20 · **Fabriksvåg:** v213b (10 otestade motorer, motorregister 2026-09-19)
**Motor:** `src/lib/elevkarna.ts` · **Svit:** `verktyg/testa-motor-elevkarna.mjs`
**Ägarskap:** endast dessa två filer — src/ orörd (testvåg; rättning är egen våg)

## Metod

Sviten skrevs mot motorfilens FAKTISKA exporterade kontrakt — inga påhittade
beteenden. Nio testfamiljer, alla deterministiska (ingen server, inget nätverk,
ingen prod, inga miljöberoenden). localStorage mockas i processen (motorn rör
`globalThis.localStorage` endast inuti funktionerna) — ingen disk, inga
data/-filer rörs, inga personuppgifter förekommer (motorns egen design: allt
lokalt, alltid frivilligt).

- **A Konstanter** — `MAX_INTRESSEN`/`MAX_VALFARD` (3/2) samt de tre fasta
  alternativlistorna: exakta längder (5/6/5), unika icke-tomma strängar.
- **B lasElevKarna grundform** — null vid tom butik, trasig JSON, JSON-null
  och kastande getItem (catch-grenen); full giltig kärna levereras som exakt
  kopia; extrafält i rådata läcker INTE in i resultatet (exakt nyckelmängd);
  huvudmål utanför listan saneras till `""`.
- **C horisontAr-sanering** — clamp 1–15, avrundning nedåt/uppåt, 0 och NaN
  faller tillbaka på 1, numerisk sträng koerceras ("7" → 7).
- **D tidPerVecka-sanering** — clamp 0–3000, avrundning, NaN → 0; noll är
  TILLÅTEN (medveten skillnad mot horisontens 0→1 — dokumenterad i sviten).
- **E intressen-sanering** — exakt listmatchning (mekanismfel som "Svenska
  bolag " med extra blanksteg räknas ej), ogiltiga element filtreras, max 3
  med ordningen bevarad, icke-array/tom array → [].
- **F valfard-sanering** — exakt listmatchning, max 2, icke-array → [],
  ett giltigt välfärdsmål bevaras oskadat.
- **G sparad-sanering** — giltig timestamp bevaras, ogiltig ("abc") → 0.
- **H spara/rensa** — spara skriver exakt EN nyckel (`ak1a-elevkarna-v1`);
  råvärdet parsar till samma objekt; spara→las roundtrip bevarar giltig
  kärna oskadad; rensa tömmer butiken; kvot-/åtkomstfel sväljs utan kast
  (P8-graceful) för både spara och rensa.
- **I valfardsGrad** — gradtrappan 0–3: null/tom kärna → 0, ETT välfärdsmål
  → 1 (längd styr FÖRE kompletthet), två mål + ofullständig resten
  (mal ""/intressen []/tid 0) → 2, komplett → 3; direkt anrop med tre
  välfärdsmål (ej möjligt via las, som kapar vid 2) hamnar i 3-grenen;
  fyra distinkta icke-tomma uppmuntrande texter; determinism.

Körning: **kör under tsx** (`npx --yes tsx verktyg/testa-motor-elevkarna.mjs`)
— och noteras bör: serverns ren node v22.23.2 tolkar .ts-importen direkt
(inbyggd typavskalning), så sviten är dubbelverifierad: **både ren node OCH
tsx ger 53/53 PASS, exit 0**. tsx förblir den kanoniska kanalen (R107-mönstret
gäller för syskonmotorer med ändelselösa interna importer; elevkärnan har inga
såna).

## Resultat

`node --check` = OK. Full utdata från tsx-körningen:

```
PASS  A1 MAX_INTRESSEN = 3 (dokumenterat tak för intressen)  — fick 3
PASS  A2 MAX_VALFARD = 2 (dokumenterat tak för välfärdsmål)  — fick 2
PASS  A3 MAL_ALTERNATIV: 5 unika icke-tomma strängar  — 5 alternativ
PASS  A4 INTRESSEN_ALTERNATIV: 6 unika icke-tomma strängar  — 6 alternativ
PASS  A5 VALFARD_ALTERNATIV: 5 unika icke-tomma strängar  — 5 alternativ
PASS  B1 tom butik ⇒ null (ingen kärna sparad)
PASS  B2 trasig JSON ⇒ null (catch-grenen)
PASS  B3 JSON-null ('null') ⇒ null (egenskapsläsning kastar → catch)
PASS  B4 kastande getItem ⇒ null (graceful, aldrig kast)
PASS  B5 fullt giltig kärna ⇒ exakt kopia (alla sex fält)  — {"mal":"Bli oberoende analytiker","horisontAr":7,"intressen":["Svenska bolag","Värdeinvestering"],"tidPerVecka":180,"valfard":["Sömn utan ekonomisk oro","Frihet att välja liv"],"sparad":1234567890}
PASS  B6 extrafält läcker INTE in i resultatet (exakt nyckelmängd)  — mal,horisontAr,intressen,tidPerVecka,valfard,sparad
PASS  B7 mal utanför listan ⇒ '' (saneras vid läsning)
PASS  B8 saknat mal (undefined) ⇒ ''
PASS  C1 saknad horisontAr ⇒ 1 (NaN-återfall)
PASS  C2 0 ⇒ 1 (noll är inte ett giltigt perspektiv)
PASS  C3 -5 ⇒ 1 (clamp nedåt)
PASS  C4 100 ⇒ 15 (clamp uppåt)
PASS  C5 2.4 ⇒ 2 (avrundning nedåt)
PASS  C6 2.6 ⇒ 3 (avrundning uppåt)
PASS  C7 '7' som sträng ⇒ 7 (numerisk koercion)
PASS  C8 'abc' ⇒ 1 (NaN → standardperspektiv)
PASS  D1 saknad tidPerVecka ⇒ 0
PASS  D2 -50 ⇒ 0 (clamp nedåt)
PASS  D3 5000 ⇒ 3000 (clamp uppåt)
PASS  D4 45.6 ⇒ 46 (avrundning till närmsta heltal)
PASS  D5 'abc' ⇒ 0 (NaN-återfall)
PASS  D6 0 ⇒ 0 (noll är giltig tid — skillnad från horisontens 0→1)
PASS  E1 ogiltiga intressen filtreras bort, giltiga behålls
PASS  E2 fyra giltiga ⇒ exakt de tre första (MAX_INTRESSEN, ordning bevaras)
PASS  E3 icke-array (null) ⇒ []
PASS  E4 exakt listmatchning: 'Svenska bolag ' (mekanismfel) räknas EJ
PASS  E5 tom array ⇒ []
PASS  F1 ogiltiga filtreras + tre giltiga ⇒ två första (MAX_VALFARD)
PASS  F2 icke-array (sträng) ⇒ []
PASS  F3 ett giltigt välfärdsmål bevaras oskadat
PASS  G1 giltig timestamp bevaras
PASS  G2 ogiltig timestamp ('abc') ⇒ 0
PASS  H1 spara skriver EXAKT en nyckel: ak1a-elevkarna-v1  — ak1a-elevkarna-v1
PASS  H2 råvärdet parsar till samma objekt (JSON-serialisering)
PASS  H3 spara→las roundtrip: giltig kärna överlever oskadad
PASS  H4 rensa ⇒ butiken tom + las ⇒ null
PASS  H5 spara sväljer kvot-/åtkomstfel utan kast (P8-graceful)
PASS  H6 rensa sväljer butiksfel utan kast (P8-graceful)
PASS  I1 null ⇒ grad 0 + icke-tom uppmuntrande text
PASS  I2 valfard [] ⇒ grad 0 (kärnan ännu oskriven)
PASS  I3 ETT välfärdsmål ⇒ grad 1 även med fullt ifylld resten (längd styr FÖRE kompletthet)
PASS  I4 två mål + mal saknas ('') ⇒ grad 2
PASS  I5 två mål + intressen [] ⇒ grad 2
PASS  I6 två mål + tidPerVecka 0 ⇒ grad 2
PASS  I7 två mål + komplett kärna ⇒ grad 3 (fullt formad)
PASS  I8 direkt anrop med TRE välfärdsmål (ej möjligt via las, som kapar vid 2) ⇒ grad 3 när komplett
PASS  I9 fyra grader ⇒ fyra distinkta icke-tomma texter (en röst per steg)
PASS  I10 determinism: samma input två gånger ⇒ identiskt resultat
Tid: 0.0 s (53 kontroller)
RESULTAT: 53/53 PASS
```

**53/53 PASS, exit 0, 0,0 s** (tak <60 s med god marginal). Samma resultat
i ren node och under tsx.

## Ärlighetsnoteringar

- **Inga äkta motorfel påträffades** — elevkärnans rena kontrakt håller hela
  vägen: sanering vid läsning, clamps, listvalidering, butiksprotokoll och
  gradtrappa. Inget test har sänkts för grönt.
- **Ett arrangemangsfel i SVITEN rättades före leverans** (redovisas här för
  transparensen): första körningen gav 52/53 eftersom kontroll H3:s helper
  `läsMedRå` bytte ut `globalThis.localStorage` mot en ny butik, varpå H4:s
  `rensaElevKarna()` tömde den nya butiken i stället för den kontrollen
  mätte. Motorns rensa-kontrakt var korrekt hela tiden (key-borttagning i
  den globala butiken + las ⇒ null höll). Rättningen gjorde H4 självständig
  med egen butik — assertion oförändrad, ingen nivåsänkning.
- Metodnotis: sviten testar motorns renodlade kontrakt i process — localStorage
  mockas. Webbläsarspecifika beteenden (riktiga kvotfel, andra flikar) är
  utanför en deterministisk kontraktssvit och täcks av motorns try/catch-
  kontrakt (H5/H6 testar att felen sväljs).
- `valfardsGrad`-texterna är fasta pedagogiska strängar; sviten verifierar
  form (icke-tomma, distinkta per grad), inte exakt ordalydelse — det gör
  sviten robust mot framtida textputs utan att tumma på kontraktet.
- Juridik: allt ovan är utbildningskvalitet — elevkärnan samlar INGA
  personuppgifter (motorns egen design) och gradtexterna är alltid
  uppmuntrande formuleringar i utbildningssyfte, aldrig råd (2007:528).

## Syskonvy

Våg v213b ger tio otestade motorer minimala kontraktssviter; denna svit
täcker gap 5 (elevkärnan). Syskonformat: U1 nyhets-motorn (46 kontroller),
U3 signal-bus (62) — samma harness (kontroll-mönster, RESULTAT-sista-rad,
exitkod). Motorregistret (V212) kan bokföra elevkärnan som testad.
