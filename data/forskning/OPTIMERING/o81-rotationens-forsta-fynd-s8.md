# o81 — Rotationens första fynd: tre rotorsakskurer på sidor som var mätblinda före o68 (spår 8, s8-u2)

Datum: 2026-09-19 (lokal) / 2026-09-18 23:5x–2026-09-19 0x UTC · Agent: s8-u2 (vakt 2/3, fabriksmanifest)
Anspråk: data/vakten/auto-s8-1789783060000-u2-ansprak.md (disk-först, före ingrepp)

## §0 Sammanfattning

o68 öppnade 1 738 permanent mätblinda sidor för gränsnittsvakten. De två
första organiska svepen efter kuren (2026-09-18T1730 + T2330 UTC) besökte
sidor som ALDRIG mätts tidigare — och hittade genast tre äkta defektklasser
som legat osynliga sedan lanseringen. Denna våg verifierar o68:s bokning
(1), diagnostiserar rotorsakerna och kurerar samtliga tre i src/ med
tsc 0. Detta är rotationens bevisade kundvärde: blinda ytor var defekta
ytor.

## §1 O68 BOKNING (1) — ORGANISKT LIVE-BEVIS: INLÖST

- Mätjournalen data/vakten/vakt-sidjournal.json: **264 → 306 poster**
  (+42 på två organiska cron-svep; förväntan ≥ ~285 ✓).
- Nyaste journalförda: /transparens, /upphovsratt, /vagfundament —
  rotnivåsidor = "grunda sökvägar före djupa"-doktrinen lever i drift.
- Svep T2330 mätte 45 unika sidor varav ~20 aldrig-mätta (bl.a.
  /superanalys, /netnet, /portfoljbyggare, /prenumeration, /rapporter,
  /topplista, /nyheter, /laroplan, /manifest …) — rotationen väljer
  nya sidor varje svep exakt som simuleringen (o68 §5) förutsade.
- Del Observations: rapportfilen bär ingen synlig "N aldrig mätta"-rad
  (förväntanformuleringen i o68 gällde loggflödet); journalväxten är det
  hårdbevisade kriteriet.

## §2 FYNDEN (ur rapportdata, ociterade råvärden)

### 2.1 /portfolj-forskning — kontrast 2,25 i light-tema (svep T2330)

Light 390px + light 1280px, sammanlagt 7 fynd — tre element i rapporten:

| Element | Klass (förkortad) | Färg | Bakgrund | Kvot | Krav |
|---|---|---|---|---|---|
| "Steg 1 — Risknivå" | text-[10px] … text-gold | rgb(201,168,76) | rgb(255,253,247) | 2,25 | 4,5 |
| "76" (gula-badge) | border-gold/40 bg-gold/15 … text-gold | rgb(201,168,76) | rgb(255,253,247) | 2,25 | 4,5 |
| "Teknik" (branskrubrik) | font-serif … text-gold | rgb(201,168,76) | rgb(255,253,247) | 2,25 | 4,5 |

Dark-kombinationerna (390/1280): 0 fynd — defekten är light-specifik.

### 2.2 /cookiepolicy — kontrast 2,96 i dark-tema (svep T1730)

Dark 390+1280, vardera 1 fynd: badge "Analys (samtycke)" med klass
`rounded-full bg-gold/20 px-2 py-0.5 text-[#785c13]` — färg
rgb(120,92,19) mot dark-bakgrund rgb(11,19,33), kvot 2,96. Spegelvänt
fel mot 2.1: en LIGHT-tema-färg hårdkodad utan dark-gren.

### 2.3 /ansvar — React #418 ×4 kombinationer (svep T1730)

Alla fyra teman/skärmar: "Minified React error #418" i konsolen
(hydratisering: server-HTML ≠ klient-DOM). Layoutmätvärdena själva rena
(0 överflöd, 0 utanför, 0 klippt, 0 kontrast).

### 2.4 Timeout-klassen (svep T2330) — driftartefakt, EJ defekt

/min-sida, /netnet, /nyheter, /om-oss (light 1280) + /logga-in
(dark 1280): "TimeoutError: Navigation timeout of 25000 ms exceeded",
matning null. Fem av 152 kombinationer i ett fönster med fabriksagenter
aktiva — driftklass (jfr o47 §2-artefaktdoktrinen). Sidorna journalfördes
ej (korrekt: "endast ok-mätning") ⇒ rotationen mäter dem igen vid nästa
svep = självläkande på 6 h. BOKNING till vaktfamiljen: en begränsad
navigationstimeout-ommätning (idag finns ommätning endast för
deploy-kollisioner, granssnittsvakt.mjs ~rad 524).

## §3 ROTORSAKER

**(a) text-gold på temaberoende ljus yta i light-temat** —
`--gold`-palettens textläge rgb(201,168,76) är designat för mörk
bakgrund; hela portfolj-forskning-familjen (korstabell, bygg-flöde,
riskval, djupvy + delade stilfabriker i vag-stil.tsx) använder det på
bg-card/bg-paper-ytor som i light-temat är nästan vita. 46 förekomster i
5 filer + 3 hover-varianter + 2 Record-poster — samma defektklass, kurad
i klass (s8-u3-precedensen: kura klassen, inte elementet).

**(b) cookiepolicy-badgen** — kategorifärgen #785c13 (mörk
läder-guldton) sattes utan dark-gren; i dark hamnar den på bg-gold/20
över nästan svart kort.

**(c) /ansvar: ogiltig HTML-nestling** — sidans sektion()-hjälpare
renderade VARJE stycke som `<p>`, men sektion 9 skickar en `<ul>`:
server-HTML (curl-bevis mot prod 2026-09-18: exakt 1 träff av
`text-muted-foreground"><ul`) innehåller `<p …><ul …>`. Browsern
auto-stänger `<p>` före `<ul>` vid parsning ⇒ klient-DOM skiljer sig från
vDOM ⇒ React #418 och helträds-omrendering på klienten (synlig blink +
fel i konsolen på kundens ansvarsfriskrivningssida).

## §4 KURER

**(a+1) Ny delad konstant** src/components/ak1a/portfolj-forskning/vag-stil.tsx:
`export const GULD_TEXT = "text-[#7a5f18] dark:text-gold"` — följer
akm1-calculator.tsx:123:s etablerade konvention. Badge-fabriker
tatKlass() + STATUS_STIL.gul + DYNAMIK.stabilt omkopplade.

**(a+2)** riskval-panel.tsx (7), bygg-portfolj-kort.tsx (14),
korstabell.tsx (8), portfolj-djupvy.tsx (13): samtliga text-gold →
${GULD_TEXT}; hover-varianter → hover:text-[#7a5f18] dark:hover:text-gold.
Marin-panelernas hardkodade ljusa guld (#E8C766 på alltid-mörk marin)
orörda — korrekt kontrast där.

**(b)** cookiepolicy/page.tsx:127: + `dark:text-gold`.

**(c)** ansvar/page.tsx sektion(): sträng-stycken → `<p>`, element-stycken
→ `<div>` med samma typografi (fragmentet i sektion 1 med inline-länkar
hamnar i div — giltig HTML, oförändrad visning; sektion 9:s ul … Detta
kurerar klassen: ALL framtida element-styckesinmatning är säker).

**Kontrastaritmetik (WCAG-relativ luminans):**
- #7a5f18 mot rgb(255,253,247): L 0,124 vs 0,979 ⇒ kvot **5,91** ✓ (krav 4,5)
- #7a5f18 mot bg-gold/15-komposit (~rgb(247,240,221)): kvot **~5,3** ✓
- dark:text-gold rgb(201,168,76) mot dark-kort rgb(11,19,33): kvot **~7,9** ✓
- cookiepolicy dark: text-gold på bg-gold/20-över-mörk ⇒ ljus text på mörkt, väsentligt > 4,5 ✓

## §5 BEVIS OCH KVD

- FÖRE-mätvärden: data/vakten/granssnitt-2026-09-18T1730.json +
  granssnitt-2026-09-18T2330.json (rådata, orörda).
- `node node_modules/typescript/bin/tsc --noEmit` = **0 fel** (exit 0).
- src/ ENDAST via Edit; INGET bygge (prod-synken äger) — EFTER-mätning
  bokas nedan.
- R2 orörd (inga priser/tier/publicering); data/blogg/ orörd;
  .env/nycklar orörda; syskonens ytor orörda.
- ALDRIG `--no-verify` (pre-commit-grinden passerad med tsc 0).

## §6 EFTER-KRITERIER (bokade, pending nästa deploy)

1. **Riktad EFTER-mätning** när prod-synken byggt om (BUILD_ID bytt):
   `node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000
   --sidor=/portfolj-forskning,/cookiepolicy,/ansvar` ⇒ förväntan:
   0 kontrastfynd, 0 konsolfel (#418 borta), status ok ×12 kombinationer.
2. **Organiskt**: nästa cron-svep mäter /ansvar + /cookiepolicy igen ur
   rotationen (journalen tog dem 1730; äldst-först kommer de åter).
3. Server-HTML-sond: `curl -s localhost:3000/ansvar | grep -c
   'text-muted-foreground"><ul'` ⇒ förväntan 0 (div-wrapper emelliteras).

## §7 KÖPOSTER TILL ÄGARNA

- Vaktfamiljen: navigationstimeout-ommätning (se §2.4) — låg prioritet,
  självläkande genom journalen.
- Observations (omättd, bokförs utan åtgärd): cookie-consent.tsx
  accent-[#785c13] på disabled-checkboxar i dark — accent-färg, ej text;
  mätbart först om vakten börjar mäta bannerns komponentgränser.
- Rapportformatet: "N aldrig mätta"-räkningen finns enbart i
  stdout-loggen, ej i rapport-JSON (o68 §förväntan skrevs mot loggen;
  JSON-fält vore framtida förbättring).
