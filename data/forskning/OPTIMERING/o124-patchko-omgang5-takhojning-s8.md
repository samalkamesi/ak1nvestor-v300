# o124 — Patchkö OMGÅNG 5 + takhöjning (spår 8, s8-u1) — 2026-09-20

OBJEKT: o113 §7 post 2 — omgång 5-lastning, öppnad av omgång 4:s kvitto
(10:03Z i dag: 5 paket "deployad + HTTPS 200 + lock committad") med
o113:s OBS intakt: filen var 10/10-full av ok-kvitterad historik ⇒ lastning
kräver FÖRST takhöjning (KODVÅG i prod-synken). Gallring förkastad
redan av o113 (filen ÄR historiken, o106 §5).

## §1 Läge vid val (duplikatkontroll)

- Worklog + OPTIMERING + data/vakten genomsökta: inget omgång 5-anspråk
  för spår 8-patchkön (träffar = andra spårs "omgång 5"). Kö-post 1
  (BYGGE-GRÖNT) stängd av o115; post 4 (hälsorapport) levereras här;
  post 3 (major-klassen) förblir ÖPPEN kodvåg.
- Maskinens hälsa vid start: gränsnittsvakten GRÖN 0 fynd (11:24-rapporten,
  båda teman × mobil/dator) · mimosa-fullscan 0 fynd (05:02, bas 1 888/0)
  · patchkvitton 12 rader, omgång 4 komplett ok.
- Protokollnummer: o124 reserverat via verktyget (o117-doktrinen; ägare
  s8-u1, hogstaKanda o123, källor 122) FÖRE allt skrivande; anspråk
  disk-först: data/vakten/s8-o124-patchko-omgang5-ansprak-2026-09-20.md.

## §2 Takhöjningen (KODVÅG, verktyg/prod-synk.mjs)

- `PATCH_MAX_POSTER` 10 → 15 + 3 raders motivkommentar (kvitterad historik
  växer en omgång per leverans; 15 = 10 historik + hel nästa omgång ~5).
  Kirurgisk Edit; ingen annan rad i deploy-pipelinen rörd.
- Sviten testa-prod-synk-patchko.mjs: tak-testet följde med (12 → 17
  inmatningsposter, förväntan 15 + "för många") — **67 PASS / 0 FAIL**
  efter ändringen (baslinje före: samma 67/0).
- `node --check` ×2 GRÖN.

## §3 Lastning (data/infra/patch-ko.json, o113-mönstret)

Registry-verifiering FÖRE lastning (npm view, läsande) — samtliga fyra
är fortfarande `dist-tags.latest` och inom deklarerat ^-intervall i
package.json:

| paket | känt intervall | lastad | registry |
|---|---|---|---|
| tailwind-merge | ^3.3.1 (dep) | 3.7.0 | latest 3.7.0 |
| puppeteer-core | ^25.10.0 (dep) | 25.11.0 | latest 25.11.0 |
| @reactuses/core | ^6.0.5 (devDep) | 6.5.9 | latest 6.5.9 |
| bun-types | ^1.3.4 (devDep) | 1.4.2 | latest 1.4.2 |

devDep-poster är kontraktenliga: lasPatchKo filtrerar mot dependencies +
devDependencies gemensamt. Append idempotent (dedup per paketnamn):
10 → 14 poster. BEVIS med prod-synkens egna läsare:
`lasPatchKo(package.json-uppsättning)` = 14 poster / **0 fel**;
`aktivPatchPlan` = **exakt de 4 nya** (de 10 historikposterna bär
ok-kvitton). Installationen ägs fortfarande ENDAV prod-synken under
deploy-låset — fabriksbarnet rör aldrig npm install/ci (o46-kontraktet).

## §4 Hälsorapport efter omgång 4-kvittot (o73 §4-hygienen, §7 post 4)

verktyg/beroende-vakt.mjs (läsande npm audit + outdated)körd på det
nya trädet: **9 → 4 uppdateringar inom intervall** — omgång 4:s fem paket
borta (supabase-js 2.116.0, next-intl 4.14.5, zod 4.6.5, react-query
5.103.1, react-hook-form 7.88.0 — synkens package.json-skrift verifierad:
samtliga fem ^-intervall uppdaterade), kvarvarande fyra = EXAKT omgång 5
kön pekar på. Sårbarheter oförändrade 7 (0 critical · 1 high · 6 moderate)
— samtliga major-klass (o113 §7 post 3, öppen kodvåg, ej patch-köns yta).
Major-steg 11 oförändrade.

## §5 KVD / bevis

- tsc via projektbinär (`node node_modules/typescript/bin/tsc --noEmit`):
  **0 fel**.
- Patchkö-svit 67/0 · node --check ×2 · aktivPatchPlan-verifierad.
- src/ orörd = INGET bygge (src berörs ej av verktygskonstanten).
- R2 orörd (priser/tier/publicering) · data/blogg/ orörd · ALDRIG
  --no-verify · npm ci/install/rm -rf node_modules ALDRIG (npm view +
  npm audit/outdated = läsande mätningar, samma klass som o113:s
  registry-verifiering).

## §6 Kö / bokningar

1. Prod-synken installerar omgång 5 vid nästa rop med RAM-fönster;
   kvitto skrivs av synken (deploy + HTTPS 200 + lock-commit). EFTER-
   mätning: hälsorapport ska visa 0 inom intervall + patchkö-svitens
   livemätning. Taket räcker till ~omgång 7 (15 − 14 + 1) — ny takhöjning
   eller gallringsbeslut bokförs då.
2. Major-klassen (o113 §7 post 3): @mdxeditor/editor 4.2.5 (js-yaml-high
   + moderate), react-syntax-highlighter 16.1.1 (3 moderates; kartlägg
   SyntaxHighlighter-användning i src FÖRE), satori 0.32.0 (fflate).
3. Bun-types-not: devDep-patcharna landar i package-lock först vid
   synkens install — tsc-baslinjen vaktas av grinden + byggögon (o106/o108).

## §7 LEVERANS

verktyg/prod-synk.mjs · verktyg/testa-prod-synk-patchko.mjs ·
data/infra/patch-ko.json · data/rapporter/beroende-halsa-SENASTE.md ·
detta protokoll · worklog.md · anspråksfil + commitmsg/append-filer.
