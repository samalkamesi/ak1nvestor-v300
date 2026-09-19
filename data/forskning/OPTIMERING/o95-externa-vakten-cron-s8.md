# o95 — EXTERNA VAKTEN I CRON-SCHEMA (spår 8: kvalitet & säkerhet, o87-externa §Kö post 2)

**Datum:** 2026-09-19 · **Agent:** s8-u1 (manifest auto-s8-1789821900404, vakt 1/3) · **Roll:** vakt
**Nummer:** o95 efter kollision — syskon s8-u3:s o94-mimosa-vaktsektion var
STAGED (15:03:38) när detta protokoll föddes (15:04:19); deras nummar, detta
omdöpt mekaniskt (o80-precedensen).

## Uppdrag och valgång (ärligt bokförd)

o87-externa levererade instrumentet `verktyg/doda-lankar-externa.mjs` med full
skyddsdoktrin (mätfönster-grind FÖRE allt, drift-tak EFTER, filskydd med
klockslagssuffix, exit 0/1/2) och skarp bevisning — men bokade öppet: *"externa
vakten i cron-schema (manuell today — internal vakt har cron, externa saknar
det)"*. Internt mönster: crontab-rad `17 1,7,13,19 * * * … granssnittsvakt-cron.sh`.

Valspåret denna session (full redogörelse i
data/vakten/auto-s8-1789821900404-s8-u1-ansprak.md, disk):
1. **AVSTÅTT** "Mimosa full-scan återmätning + skuldlistan": syskon s8-u3:s
   anspråk (~12:5x lokal) föregick mitt (~14:4x) och deras leverans pågår
   (o92-protokoll + kurer i trädet). D24-pivot-precedens: avstå, lämna gåva —
   min FÖRE-verktygdomän-JSON (769 filer/10 råfynd med domar) + komplett
   v1.5-instrumentdiff lämnad på disk
   (auto-s8-1789821900404-s8-u1-gava-u3.md); min enda intrångsyta
   (mimosa-paritet.mjs) revertad och verifierad före lämnandet.
2. **FÖRKASTAT** o85-köposten "OVÄNTAD EXIT 0": den var VILLKORAD ("OM den
   återkommer") — cron.log visar att klassen inte återkommit sedan o85; de nya
   ärliga radformerna (SKIPPAD-RAM, GRÖN fullt svep) lever och inget larm
   inkommit sedan drift-taket deployad 07:12Z. Villkoret ej uppfyllt.
3. **VALT** detta objekt — namngiven öppen post, u2:o87:s instrument
   driftsklart, kollisionsfritt mot u2:s backup-kur (o93) och u3:s fullscan.

## Rotorsaka

Instrumentet fanns men var **manualt**: utan cron-schema mäts externa länkar
endast när en agent råkar komma ihåg det (o87 §Kö: "manuell today"). Internt
har haft cron sedan våg 105 — externa glömdes i driftsättningen. Klassen:
levererat-skydd-utan-automatisk-förmåga = vakthet som beror av agentminne,
inte av systemet (evighetsmotor-doktrinens spegelbild).

## Kur — TUNN wrapper, allt skydd bor kvar i verktyget

**Ny fil `data/infra/contabo/doda-lankar-externa-cron.sh`** (körbar, 775):
- Kör verktyget, fångar utdata → `data/vakten/doda-lankar-externa-senaste.txt`.
- **Klassläsning ur verktygets EGEN utdata** (o85-doktrinen — aldrig gissade
  tidsfönster; verktyget levererar mätvärde med exit 0 ÄVEN vid fynd, därför
  läses `DÖDA (4xx): N` / `OUPPNÅBARA (domän/anslutning): N` med sed):
  | Verktygets läge | Wrapper-loggrad | Larm |
  |---|---|---|
  | exit 0, DÖDA=0 OUPP=0 | `GRÖN — 0 döda externa (full crawl)` | nej |
  | exit 0, DÖDA/OUPP>0 | `FYND-larm till molnagenten` | **ja** |
  | exit 0 + [DIAGNOSTIK-märke | `DIAGNOSTIK — manuell --tvinga…` | nej |
  | exit 0 utan klassrader | `OVÄNTAD EXIT 0 utan sammanfattning` | nej |
  | exit 2 | `DRIFTFÖNSTER — … kasserade rapporten (o47 §2)` | nej |
  | exit 1 + GRIND:-rad | `SKIPPAD — mätfönster stängt` | nej |
  | övrigt | `VAKTFEL-larm (verktygsfel, ej länkfel)` | **ja** |
- Larmvägen = våg 103/105-mönstret exakt: admin-nyckel ur skyddad env-fil
  (namnet satt ihop i delar), session ur /api/studio/mal/status, POST
  /api/studio/stream; FYND-prompten beordrar rightning av KÄLLOR i data/
  med R2-staket (publicering = kundens beslut, data/blogg/ orörd) +
  återvalidering via `--validera-fran`.
- Retention: rapporter ≤ 30, insamlings-mellanlager ≤ 3, logg < 200 rader.
- RAM-grind behövs EJ (dokumenterat beslut): node-crawlen är lätt (~100–200 MB,
  ingen puppeteer); verktygets EGEN bas-hälsogrind stoppar OOM-halvträd
  (GRIND → SKIPPAD), och rytmen är daglig — o72:s 6-timmarsblindhet gäller ej.

**Cron installad i ak1a:s crontab (server-lokal, verifierad efteråt):**
`17 4 * * * /home/ak1a/AK1/data/infra/contabo/doda-lankar-externa-cron.sh`
— dagligen 04:17 lokal: mellan molnbackupen 03:40 och gränsnittsvaktens
07:17-svep; den ~13-minuterslánga crawlen kolliderar varken med
backupfönstret eller vaktens chrome-RAM. Backup av föregående crontab:
/tmp/crontab-backup-o94.txt. Idempotens kontrollerad före append.

## Bevis

- **Svit `verktyg/testa-doda-lankar-externa-cron.mjs`: 17 PASS · 0 FAIL**
  (o85-mönstret: mock-verktyget skriver verktygets UTdata och exitar;
  DODA_EXTERNA_KOMMANDO/KATALOG/ENV_FIL = svit-ägda överridningar).
  Täcker: bash -n · GRÖN (rad + ingen larmtext + senaste-fil i överriden
  katalog) · FYND mot dummy-env ("FYND men larmvägen bruten" + ALDRIG
  "FYND-larm till molnagenten" = skarpt larm omöjligt) · FYND exit 0
  (verktygets kontrakt) · DRIFTFÖNSTER (rad + ingen larm) · SKIPPAD-GRIND ·
  VAKTFEL (rad + aldrig larm-rad) · OVÄNTAD EXIT 0 · DIAGNOSTIK ej GRÖN ·
  retention 32→≤30 rapporter + 5→≤3 mellanlager · **skarp logg orörd**
  (skapas ej/förändras ej av svitten — L9).
- **Skarp end-to-end-körning 15:02 lokal** (RAM-fönstret öppet 4 473 MB,
  mellanlagret = dagens gröna insamling 2 422 sidor/308 mål):
  `DODA_EXTERNA_KOMMANDO="node verktyg/doda-lankar-externa.mjs
  --validera-fran …-insamling.json" bash …cron.sh` → verktygets grind loggade
  `"grunder":"gröna"`, re-validerade 308 mål på 32 s, **DÖDA 0 · OUPPNÅBARA 0**
  → wrapper exit 0 → **skarp logg född**:
  `2026-09-19T1502 GRÖN — 0 döda externa (full crawl)`.
  Filskyddet bevisat skarpt: ny rapport fick klockslagssuffix
  `-130243` (dagens två tidigare bevarade).
- **tsc 0 fel** via projektbinär (`node node_modules/typescript/bin/tsc
  --noEmit`, exit 0) — src/ orörd av vågen.

## Observation att bevaka (ej fynd)

Skarpa klasser 15:02: `{BLOCKERADE: 204, OK: 104}` mot morgonkörningens
07:30Z `{OK: 300, BLOCKERADE: 7}` — BLOCKERADE = "kan ej maskinverifieras"
(bot-motstånd hos externa värdar), INTE fyndklass (larmar ej), men andelen
varierar kraftigt med dygnstid. Vid första organiska 04:17-körningen: om
BLOCKERADE-andelen är systematiskt > ~50 % kan målningen bli tandlös i
praktiken (flera mätvärden än OK) — i så fall köpost: sprid cron-ranson
eller per-domän-takt (verktyget har redan en sonde per domän i taget).

## Kö

- **Första organiska cron-körningen 2026-09-20 04:17** bevakas av nästa
  vaktvåg: loggrad `GRÖN — 0 döda externa (full crawl)` förväntas; avsaknad =
  vakt-hälsa (se då senaste-filen + crontab).
- BLOCKERADE-andelsbevakning enligt observationen ovan.

## KVD

- src/ orörd = INGET bygge (prod-synken äger) · tsc 0 via projektbinär.
- R2 orörd (priser/tier/publicering: FYND-prompten bär R2-staketet) ·
  data/blogg/ orörd · verktyg/doda-lankar-externa.mjs orörd (u2:o87:s ägda).
- Syskonytor orörda: u2:s backup-offsite (o93), u3:s mimosa-objekt (o92,
  inklusive deras STAGEDA filer — denna commit bär EXPLICIT pathspec, indexet
  granskat före: deras stageda arbete lämnas staged).
- data/vakten/-filer (anspråk, gåva, logg, rapporter) = gitignorerade per
  konvention, lever på disk.
