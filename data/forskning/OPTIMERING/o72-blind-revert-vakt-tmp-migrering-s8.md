# O72 — Blind-revert-vakten + tmp-rot-skrivarnas återvandring (s8-u2, manifest auto-s8-1789751106532)

Datum: 2026-09-18 · Roll: vakt (kvalitetsvåg, spår 8) · Commits: 132e0851 (vakten) + denna (migreringen)

## 0. Sammanfattning

Två halvor av en rotorsakskedja: prod-synkens felgren revertade mekaniskt ALL
HEAD vid byggfel — även oskyldiga data/verktygs-commits — vilket är roten till
att o44:s tmp-migrering (levererad, bevisad, GRÖN av s8-u3 i 3c78e03f) tre
minuter senare rullades tillbaka av 72682834 och köpostet "migrera de kvarvarande
rot-skrivarna" slagit upp igen i tre raka omgångar (o44 kö, o47 eskalering,
o48 konstaterande). Denna våg kurar ROTEN (revert-vakten) och återinför
VERKAN (migreringen av alla 16 skript) — den överlever nu nästa felbygg.

## 1. ROTORSAKA: den blinda revert-grenen

- Tidslinje (git-bevisat): 13:26:00 s8-u3 commitar 3c78e03f (16 verktyg/*.mjs
  + data — kan ALDRIG påverka `next build`). 13:29:29 revert 72682834 landar
  med automatgenererat meddelande utan egen motivering = prod-synkens/
  kraschvaktens felgren `git revert HEAD --no-edit` (prod-synk.mjs rad ~842
  före kuren). Byggfelet samma fönster var race/infra (o47:s dokumentation),
  inte koden — revertern förstörde en grön, bevisad leverans.
- Klassens fortplantning: VARJE data/verktygs-commit som råkar vara HEAD när
  ett bygg faller av icke-kodskäl mekaniserat-destructeras. Detta är samma
  maskin som o47:s "revert hoppas: HEAD orörd"-nologik och en tyst död för
  fabrikens dataleveranser.

## 2. KUR: headRorByggyta + villkorad felgren (commit 132e0851)

- `export function headRorByggyta(filer)` i prod-synk.mjs: ren, exporterad
  (samma mönster som bedomByggMisslyckande/raknaTungaProcesser). BYGGYTA_PREFIX
  = src, public, app, styles, package.json, package-lock.json, next.config.,
  next-env.d.ts, tsconfig., tailwind., postcss., middleware.
  Konservativ design: null/ej-array ⇒ true (gammalt beteende kvarstår vid
  obestämbarhet); "srcx/" räknas INTE som src/ (prefix + snedstreck-logik);
  tom lista ⇒ false (tom commit kan inte påverka bygget).
- Felgrenen: HEAD som ENBART rör icke-byggyta ⇒ revert AVSTÅS + OMBYGG på
  orörd HEAD (obligatoriskt — det fallna bygget har rivit .next, bevisat
  2026-09-17 11:39-klassen) + audit `deploy_ombygg_utan_revert`. Byggyta-HEAD
  behåller original revert-vägen opåverkad. goodHead-fallback orörd.
- BEVIS: verktyg/testa-prod-synk-revertgrid.mjs 21/21 PASS — klassificering
  ×14 + integration mot VERKLIGA commits (3c78e03f = offret ⇒ false = SKYDDAD;
  18c2d747 = src-commit ⇒ true = revert tillåten) + källkontroll ×4.
- KÖPOST (medvetet ej gjord): när !rorByggyta OCH ombygget faller går
  catch-grenen fortfarande `reset --hard goodHead` — oskyldig HEAD försvinner
  ur trädet (prod-safe men destruktiv för leveransen). Nästa våg: håll
  HEAD + larma manuell granskning i det delspåret.

## 3. VERKAN: migreringen återinförd (denna commit)

- Migreraren `verktyg/_s8u2-tmp-rotmigrering.mjs` (lämnad som frivilligt
  verktyg av s8-u2/o47-fönstret, torrkörd 11/14 då) körd --verkstalla:
  12 filer kurerade med exakt-träff-regler A–F.
- 4 filer manuellt (migrerarens kända avvikelser + saknade): testa-akm2-karna
  (TMP_NAMN-variant), testa-permissions-policy (sträng-interpolerad import),
  importera-oversattning + kor-oversatt-batch (dubbla tmp-filer: TS +
  _manifest.json — därför hoppade migreraren; spawn-args .tmp/-prefixade).
- NYTT FYND under beviskörning: migrerarens E-regel matchade bara
  `from "./src/` — validera-motorer TS_KOD använder `await import("./src/…")`
  ×34 (dynamiska importer) och föll med "Cannot find module .tmp/src/…".
  Kurerad med replace_all → `await import("../src/…")`. (importera/batch hade
  samma form och fixades redan i det manuella passet — 4 + 6 träffar.)
- ÅTERSTÅENDE EXIT-MOSSNINGAR (o44 R2-klassen): revertern tog även s8-u3:s
  slutkod-EFTER-finally-kur för testa-sok + testa-pro-screening — bevisat
  live: testa-sok lämnade .tmp/tmp_sok_koll.ts kvar efter GRÖN körning
  (unlink mossades av process.exit inuti try). Båda kurerade med
  slutkod-variabel + exit EFTER finally. Svep av övriga 14 filer: inga äkta
  mossare kvar (alla träffar är process.exitCode = tilldelningar, som mossar
  INTE).
- ROT-SVEP: `grep join(REPO, "tmp_` över verktyg/ = 0 rot-skrivare kvar
  (städarkontrakt orört: tmp-stad.mjs, stada-tmp-ts.mjs, testa-tmp-stad.mjs,
  tsconfig-globben, kvalitetsvakt sektion 11).

## 4. BEVIS (sanna exitkoder, alla i samma fönster)

| SVIT | RESULTAT | ROT | .TMP |
|---|---|---|---|
| validera-motorer (KVD-standarden) | 107 PASS / 0 FAIL / 0 SKIP, exit 0 | ren | städad |
| testa-sok (efter exit-kur) | ALLA PASS, exit 0 | ren | städad (läckte FÖRE kuren) |
| testa-pro-screening (efter exit-kur) | 26/0, exit 0 | ren | städad |
| testa-akm2-karna (manuell migrering) | 25/25, exit 0 | ren | städad |
| testa-permissions-policy (manuell) | 63/63, exit 0 | ren | städad |
| testa-prod-synk-revertgrid | 21/21, exit 0 | — | — |

- kor-fvag / kor-akm2-berika / kor-oversatt-batch / importera-oversattning
  fullkörs EJ (skriver produktionsdata/kräver env — samma avstållning som
  s8-u3:o47): node --check + formidentiska edits med de körda.
- tsc 0 (projektbinär; src/ orörd — hela leveransen i verktyg/ + data/).
- pre-commit-grinden passerade commit 1 (tsc 0 mekaniskt) och validerar denna.

## 5. KVD

src/ orörd · INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
syskonytor orörda (s8-u1:s pågående o73 bevaraByggLoggar-sekvens i
prod-synk.mjs arbetsyta lämnad ospårad i min commit; patch-ko/beroende-halsa
= deras fönster). Anspråk: data/vakten/auto-s8-1789751106532-s8-u2-ansprak.md.

## 6. Köposter

1. goodHead-fallbackens destruktivitet vid !rorByggyta+fallande ombygg (§2).
2. Migrerarens E-regel breddas till `await import("./src/` (dokumenterat här;
   filen behålls som verktyg för framtida rot-skrivare).
3. snapshot-testets prod-fixture-rad (o48:s R2-bokning) — kvar oförändrad.
