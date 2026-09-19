# O79 — goodHead-fallbackens destruktivitet + patch-lägrets genomfallning (Spår 8, s8-u1)

Datum: 2026-09-19 · Agent: s8-u1 (manifest auto-s8-1789775715600, vakt 1/3) · Status: LEVERERAD

## 1. Objekt och duplikatkontroll

o72:s namngivna köpost (worklog, våg 132e0851): "goodHead-fallback orörd
(köpost: destruktiv vid !rorByggyta+fallande ombygg)". Under rotanalysen
hittades dessutom en genomfallningsbugg i samma felgren (patch-lägets
lyckade ombygg når o72-blocket). Ingen tidigare våg har levererat något av
dem (worklog-genomsökning s8-familjen + OPTIMERING-listan; o79 ledigt).

## 2. Rotorsak

FELGRENSKEDJAN i verktyg/prod-synk.mjs (steg 5-6):

1. Bygg faller (äkta fel-klassen) → o72: HEAD:s filer mäts; !rorByggyta ⇒
   revert AVSTÅS + ombygg på orörd HEAD.
2. Ombygget faller → catch: `git reset --hard goodHead` — UTAN guard.
   - FALL A (kedjan goodHead..HEAD ren): goodHead-bygget möter EXAKT samma
     kod (skillnaden HEAD↔goodHead är enbart data/verktyg/docs) ⇒ det
     andra bygget faller av samma skäl (infra) ⇒ KRITISKT + HEAD flyttad
     BAKÅT: oskyldiga leveranser kastade ur trädtoppen utan vinst =
     10X-klassens destruktivitet, nu i fallback-steget.
   - FALL B (kedjan smutsig — äldre byggyta-commit bakom oskyldig HEAD):
     reset är RÄTT (läker prod till bevisat deploybar kod; oskyldiga
     commits återkommer från origin/develop nästa poll).

GENOMFALLNINGEN: patchMode utan ny kod (`!nya.trim()`) med LYCKAT ombygg på
god lock sätter ok=true men exekveringen FORTSÄTTER in i o72-blocket:
"bygg MISSLYCKADES" loggas om läkt prod, och om HEAD (senaste deployade,
kan röra src/) ⇒ `git revert HEAD` på LÄKT prod + ett tredje bygg. Latent
revert av duglig kod.

## 3. Kur

- Exporterad ren funktion `bordeAvstaGoodHeadReset({ rorByggyta,
  kedjaRorByggyta })` ⇒ true endast när HEAD OCH hela kedjan goodHead..HEAD
  rör enbart icke-byggyta.
- Catch-grenen: guard FÖRE reset — kedjediff (`git diff --name-only
  goodHead..HEAD`) genom samma headRorByggyta; guard träffar ⇒ logg +
  audit `deploy_avstar_goodhead_reset` + return (HEAD orört, nästa poll
  försöker igen; samma vänta-semantik som OOM/startade-aldrig; obestämbar
  diff ⇒ true = gammalt beteende kvarstår).
- Patch-grenen vs o72-blocket görs disjunkta (`} else {`): lyckat
  patch-ombygg går DIREKT till steg 7 (restart mot återställt .next) och
  kan aldrig nå revert/ombygg-logiken.

## 4. Bevis (LEVERERAD 2026-09-19 ~00:1x lokal)

- **Svit**: verktyg/testa-prod-synk-revertgrid.mjs 21 → 34 kontroller,
  **34 PASS / 0 FAIL** (13 nya O79-kontroller, se §5).
- **Regression — hela prod-synk-svitsfamiljen** (alla importerar
  prod-synk.mjs): arbetsytasynk 34/34 · patchko 52/0 · pm2vakt 35/0 ·
  ramvakt 17/17 · tidsstampel exit 0 · node --check ×2 (källfil + svit).
- **tsc 0** (projektbinär `node node_modules/typescript/bin/tsc --noEmit`).
- **Gränsnittsvakten GRÖN**: 0 fynd / 176 kombinationer mot
  http://localhost:3000 (RAM-fönstret öppet, 1,3 GB) — rapport
  data/vakten/granssnitt-2026-09-19T0014.json.
- **Diff**: prod-synk.mjs +114/−41 rader totalt med sviten
  (prod-synk.mjs 120 rader ändrade, sviten +35).

## 5. Testfall (svitens nya kontroller 21-33)

- 21-24 klassificering bordeAvstaGoodHeadReset: {ren,ren}⇒avstå;
  {ren,smutsig}⇒reset läker; {smutsig,*}⇒oförändrat.
- 25 VERKLIG ren kedja `3c78e03f..72682834` (19 filer, enbart
  verktyg/data) ⇒ avstå-beslut styrks — exakt det scenario där gammal
  kod förstörde leveranser.
- 26 VERKLIG smutsig kedja `72682834..18c2d747` (40 src/-filer) ⇒
  reset behålls (äldre gärningsman bakom oskyldig HEAD möjlig).
- 27 oskyldig HEAD (3c78e03f) på smutsig kedja ⇒ reset kvar — bevisar
  att HEAD-checken ensam är ett svagt oskuldsmått; kedjan är det sanna.
- 28-33 källkontroller: kedjediff i catch, audit-åtgärd
  deploy_avstar_goodhead_reset, reset-kommando kvar, patch/o72-disjunktion
  (`} else {`), O79-markörkommentaren, obestämbar-kommentaren.

## 6. Gränser

src/ orörs · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
patch-kön orörd (ägarskap o46) · syskonytor orörda (git diff --cached
tomt vid commit — o81-läxans regel följd).

## 7. Kö efter denna våg

- UPPSKJUTEN-loggklass (o72) — oförändrat öppen.
- migrerar-E-regel breddas (o72) — oförändrad öppen.
- goodHead-fallback vid KEDJE-obestämbarhet väljer konservativt gammalt
  beteende (reset) — medveten avvägning, ej köpost.
