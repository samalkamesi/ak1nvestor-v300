# o114 — TS-IMPORT-KONSOLIDIERING: en brygga, ett hook-träd (spår 8, s8-u2)

**Datum:** 2026-09-20 · **Agent:** fabriksagent s8-u2 (vakt 2/3) · **Status:** LEVERERAD
**Anspråk:** `data/vakten/s8-o114-ts-import-konsolidering-u2-ansprak-2026-09-20.md` (disk-först)

## 1. Nummerläget (öppen kollisionsredovisning)

Valde först **o112** (ledigt mot OPTIMERING/-katalogen vid valet). Samtidigt tog
s8-u1 o112 för ett ANNAT objekt (react-kvitto/hälsorapport/omgång 4 — deras anspråk
11:40 lokal, mitt 11:41: deras nummer först på disk). s8-u3:s servicenotis
`auto-s8-1789896901533-s8-u3-o113-notis-till-u1.md` flaggade dubbleringen; jag
omnumrerar till **o114** enligt o107-mönstret (o113 togs av u3, o114 ledigt
verifierat). Objekten är disjunkta — pure nummerkollision, ingen arbetskollision.
u1:s återstående yta (BYGGE-GRÖNT-beviset vid nästa RAM-fönster) och u3:s o114-intilliggande
ytor lämnas orörda.

## 2. Rotorsaken

Efter vågorna o106 (u3) och o107 (u2) fanns TVÅ parallella resolver-hook-bryggor
för nodes type stripping i verktyg/:

| | `_o106-ts-import.mjs` (u3) | `ts-import.mjs` + `_ts-resolve-hooks.mjs` (u2) |
|---|---|---|
| Mekanism | `registerHooks` (in-process, synkron) | `module.register` (hooks-tråd) |
| `@/`-alias | → file-URL, delegaterad lösning | → src-sökväg, proaktiv, tydligt fel vid miss |
| Extensionless relativ | reaktiv (efter nextResolve-fel), suffix `.ts/.tsx//index.ts/.js` | proaktiv, suffix `.ts/.tsx//index.ts/.tsx` |
| API | `aktiveraTsImport()` | `importeraTs(relSokvag)` |

13 filer (12 körbara sviter + u3:s historiska paritetskript) hängde på
_o106-varianten; 20+ sviter (ai-mentor-familjen, dataset-aspekter, styrelse-v214,
r110/r112-bokföring, m9-fabrik) på den kanoniska. Dubbelgolvet är en
underhållsrisk av bevisad sort: kurerna har redan divergerat (skillnaderna i
tabellen ovan) och varje ny svitförfattare måste gissa vilken brygga som gäller.

## 3. Kuren

1. **Kompatibilitets-API:** `verktyg/ts-import.mjs` exporterar nu även
   `aktiveraTsImport()` — en tom funktion, ty registreringen redan sker
   idempotent (`globalThis.__ak1aTsResolveRegistrerad`) vid modulimport.
   Funktionens enda uppgift är att bevara _o106-anropsmönstret så att
   migreringen blev exakt EN rad per fil.
2. **Migrering:** samtliga 13 filer bytte import-specifier
   `join(HÄR, "_o106-ts-import.mjs")` → `join(HÄR, "ts-import.mjs")`.
   Berörda: testa-signal-bus · testa-motor-signal-bus · testa-datacache ·
   testa-elevkarna · testa-organ-bus · testa-motor-organ-bus · testa-eko-koppling ·
   testa-motor-eko-koppling · testa-nyhets-motor · testa-klientkontext ·
   testa-navigationsminne · testa-shortseller-bank · _s8u3o108-paritet
   (historiskt engångsbevis, dess ämne dynamic-catalog är gallrat — raden
   migrerad för grep-hygien).
3. **Gallring:** `verktyg/_o106-ts-import.mjs` bort ur trädet (git rm).
   Kvarvarande "_o106-ts-import"-träffar i källor: 0 (endast namn Omnämnts i
   ts-import.mjs:s kompatibilitetskommentar + historiska .txt-arkiv, som aldrig
   skrivas om).

## 4. Bevisen

- **FÖRE (baslinje på gamla bryggan):** 12/12 sviter exit 0.
- **EFTER (på kanoniska bryggan):** 12/12 exit 0 —
  SIGNAL-BUS 23 · MOTOR SIGNAL-BUS 62 · DATACACHE 24 · ELEVKÄRNA 17 ·
  ORGAN-BUS 21 · MOTOR ORGAN-BUS 63 · EKO-KOPPLING 18 · MOTOR EKO-KOPPLING 65 ·
  NYHETS-MOTOR 44 · KLIENTKONTEXT 29 · NAVIGATIONSMINNE 16 · SHORTSELLER-BANK 24
  = **406 PASS / 0 FAIL**.
- **Ingen regression av kanoniska vägen:** rök av testa-ai-mentor.mjs (exit 0,
  registret 464 kurser / 8223 quizfrågor / 20 AKM1-variabler) och
  testa-styrelse-v214.mjs. Den senare dör under REN node med
  ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX (studio-transport.ts parameter properties —
  känd sedan R110, aggregatorns tsx-återfall finns exakt för detta):
  - **Motbevisad som min regress:** filbyte mot HEAD-versionen av ts-import.mjs
    ⇒ IDENTISKT fel ⇒ felet är oberoende av min ändring (tillagd export påverkar
    ej load-beteende).
  - **Kanonisk grön körning:** `npx --yes tsx` ⇒ exit 0,
    "SAMMANFATTNING: PASS (v214-stängslets kontrakt bevisat deterministiskt)".
- **Syntax:** `node --check verktyg/ts-import.mjs` OK.
- **Typkvitto:** `node node_modules/typescript/bin/tsc --noEmit` = exit 0
  (src/ orörd av denna våg — verktyg/*.mjs står utanför tsconfigs scope;
  kvittot körs enligt leveranskriterierna).
- **Mimosa:** paritetssviten `testa-mimosa-paritet.mjs` ALLA PASS ·
  `mimosa-paritet.mjs '^verktyg/'` GRÖN — 0 fynd i verktyg-scope.

## 5. KVD

src/ orörd = INGET bygge (prod-synken äger) · R2 orörd · data/blogg/ orörd ·
syskonytor orörda (u1:s stageda patch-ko/beroende-halsa-filer samt
prod-synk-ytor lämnade i fred; commit med exakt pathspec) · commit-meddelande
via -F-fil · pre-commit-grinden passeras utan --no-verify.

## 6. Kö vidare i spåret

- u1:s o112-rest: BYGGE-GRÖNT-bevis vid nästa RAM-fönster (omgång 4 installeras
  + tsc-grindas + byggs) — deras yta.
- Mimosa full-scan återmätning efter nästa större fil-tillskjutande våg
  (denna våg = netto −1 fil + 14 rader; ny bas 1 772/0 står sig).
- Aggregatorns tsx-återfall kan i framtiden begränsas: med EN kanonisk brygga
  vore nästa steg att låta även parameter-properties-sviter (styrelse-familjen)
  lösas utan tsx — kräver kodväg i src (parameter properties → explicita fält),
  bokas som egen våg om värdet visas.
