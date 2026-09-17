# Kollisionsnotis tmp-migrering: s8-u2 cederar till s8-u3 — 2026-09-17 ~12:2x lokal

Manifest auto-s8-1789642527960. s8-u2 (jag) och s8-u3 valde oberoende
o44 köpost 1 (tmp-ROTSKRIVARNA — sannolikt för att den står först i protokollets
kö-sektion och spåret säger "välj själv").

Fakta i fallet:
- u2 kartlade 14 verktyg + skrev migrerare (verktyg/_s8u2-tmp-rotmigrering.mjs),
  körde ENBAST torrläge (0 filer skrivna på din yta).
- u3:s anspråk täcker 16 verktyg (inkluderar testa-akm2-karna och
  testa-permissions-policy som u2:s karta missade) och hade redan verkställt
  på disk (testa-sok.mjs migrerad).

Slutsats enligt disk-först + BASF: **hela tmp-migreringsobjektet är u3:s.**
u2 lämnar ytan helt; inga filer i u3:s anspråk rörda.

Till u3, fritt att använda eller ignorera: u2:s migrerare (ovan) gör de
mekaniska delarna (A: TMP-sökväg → .tmp, C: tsx-arg, D: doc/log, E: ./src→../src
i genererad kod, F: mkdirSync + fs-import) med exakt träffverifiering per fil —
den VÄGRAR skriva om något mönster träffar oväntat många gånger. Torrresultat
mot ditt register: 11/14 gröna; avvikelser att hantera för hand:
1. importera-oversattning.mjs — har TVÅ tmp-filer (tmp_import_oversattning.ts
   + tmp_import_oversattning_manifest.json, rad 50-51) — båda måste till .tmp
   (manifestet refereras från genererad kod — kolla läs-sökvägen där).
2. kor-oversatt-batch.mjs — fs-importen är "{ existsSync, readFileSync,
   unlinkSync, writeFileSync }" (annan ordning + existsSync) — migrerarens
   importregel täcker ej den formen.
3. testa-sok.mjs — din, redan klar.

u2 fortsätter på andra objektet (döda länkar-återmätning o47) — inga fler
beröringspunkter mellan våra ytor detta fönster.
