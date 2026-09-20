# DR-ÖVNING 2026-09-20 — DUBBELPROJEKT-KUREN LANDAD: app-DB:n (aufr) får egen nattlig crontab-dump — RPO-gapet stängs (GODKÄNT)

**Agent:** s10-u3 (manifest auto-s10-1789923906930, vakt 3/3).
**Anspråk låst (disk-först):** 19:08 lokal — `data/vakten/auto-s10-1789923906930-s10-u3-ansprak.md`.
**Fönster:** 19:08–19:28 lokal (17:08–17:28Z). Syskonen u1/u2 lämnades blad-/KEDJA-ytorna fria (u:s kvällspunkt KEDJA0-3 levererad 19:09–19:2x — inläst som jämförelsetal, deras yta orörd).

## 1. Valet och dess rot

Spårets bokade stående gap (V234 + s10-u2-middagens kö-rad): **appens
Supabase-projekt (aufr, ref suhvlsbp) saknade egen nattlig dump** — kedja 1
(02:30) läser projekt rkaq (pump-universumet); appens ~2 100 r/dygn (se §5)
växte i ENDA kopian (kedja 2:s JSON 02:40, per-typ). §7 i
DR-OVNING-2026-09-19-DUBBELPROJEKT.md köade kuren till huvudagenten EFTERSOM
receptet då krävde **ny .pgpass-post** (R2-nära). KEDJA-0-bevisen (09-19 ×2,
09-20 ×3) upplöste det blockeret: lösenordet kan läsas **vid körning** ur
.env.production.local:s DATABASE_URL (samma lösenord gäller båda projekten,
bevisat 2026-09-19) — .pgpass behöver ALDRIG röras. Därmed är kuren
fabrikslevererbar utan en enda R2-nära yt-skrivning, och detta är den
leveransen.

## 2. Kuren (tre delar, alla bevisade i kväll)

1. **`verktyg/dumpa-app-db.sh`** (ny, committad) — speglar rkaq-radens
   kontrakt med tre förbättringar:
   - Mål härleds ur .env:s NEXT_PUBLIC_SUPABASE_URL (aufr), lösenord ur
     .env.production.local — förs ENBART som PGPASSWORD-env till pg_dump,
     aldrig argv, aldrig loggat (dr-appdump.mjs-mönstret, bevisat).
   - Dump skrivs till `*.part` och flyttas in i kedjan **först när
     pg_dump|gzip-pipelinen lyckats** — ett trunkerat blad kan aldrig ligga
     i kedjan och tas för en backup.
   - Slutmarkörkontroll (kolla-dump-markorer.mjs --fil: \restrict/\unrestrict
     + "dump complete") körs **före** retentionen — RÖD dump stoppar raden
     (exit 1) och raderar inga gamla blad.
   - Driftskydd: flock -n på /tmp/ak1a-appdump.lock (manuell + cron krockar
     aldrig); 30-dagars retention `db-app-*.sql.gz` (rkaq-radens find
     `db-*.sql.gz` täcker även app-bladen — samma policy, harmlös dubbel-
     säkring, konstaterad).
2. **Crontab rad 6** (installerad 19:29 lokal, 6 rader totalt):
   `50 2 * * * /bin/bash /home/ak1a/AK1/verktyg/dumpa-app-db.sh >> /tmp/supabase-appdump.log 2>&1`
   — tidsläget 02:50 kedjar natten: rkaq 02:30 · moln-JSON 02:40 · **app
   02:50** (~2–6 min) · ISR 03:10. Före-tillståndet (5 rader) säkrat i
   `data/vakten/crontab-före-s10u3-2026-09-20.txt` (katalogen gitignorerad
   — därför även här, revert-underlag i git):

```crontab
30 2 * * * cd /home/ak1a/AK1 && mkdir -p data/backups/supabase && PGPASSFILE=/home/ak1a/.pgpass /usr/lib/postgresql/17/bin/pg_dump "host=db.rkaqmulgoubvewwnwxrw.supabase.co port=5432 dbname=postgres user=postgres sslmode=require" 2>>/tmp/supabase-backup.log | gzip > data/backups/supabase/db-$(date +\%Y-\%m-\%d).sql.gz && /usr/bin/node /home/ak1a/AK1/verktyg/kolla-dump-markorer.mjs --natt >> /tmp/supabase-backup.log 2>&1 && find data/backups/supabase -name "db-*.sql.gz" -mtime +30 -delete
17 1,7,13,19 * * * /home/ak1a/AK1/data/infra/contabo/granssnittsvakt-cron.sh
40 2 * * * cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/backup-fran-molnet.mjs >> /tmp/moln-backup.log 2>&1
20 3 * * 0 cd /home/ak1a/AK1 && /usr/bin/node /home/ak1a/AK1/verktyg/arkivera-server.mjs >> /tmp/server-arkiv.log 2>&1
17 4 * * * /home/ak1a/AK1/data/infra/contabo/doda-lankar-externa-cron.sh
```
3. **Bevisövning same-night** (§§3–4): dumpen körd EXAKT som cron kör den
   (`env -i` cron-paritets-env) + återställning av det riktiga bladet i
   skrap-PG17 med RTO/radkontrakt + full städning.

## 3. Bevis: första bladet + cron-paritet + kompatibilitet

| Moment | Värde |
|---|---|
| RAM-grind före dump | 840 MB → väntade 150 s (deploy/bygge) → **2 174 MB** vid körning |
| Dump (cron-paritet, env -i) | **exit 0** · 371 s (server efterbygges-belastad; nattreferens 115–178 s) |
| **Första bladet** | `db-app-2026-09-20.sql.gz` · **84,2 MB** (88 324 083 B) · sha256 `1453365ee1ff3bbe…` · beh 664 |
| Slutmarkörkontrakt | **GRÖN** (\restrict/\unrestrict + complete) · CREATE TABLE 418 · COPY 420 · 2 288 977 dumprader |
| Oberoende markörkoll (wrappern) | exit 0 — GRÖN |
| Retention | körd · 0 raderade (första bladet — korrekt) |
| **rkaq-vakten opåverkad** | `--natt` exit 0 (läser db-2026-09-20.sql.gz, GRÖN) |
| **Baslinjen opåverkad** | 10 blad listade, app-bladet EJ med (regex `^db-\d{4}…` skyddar — app-kedjan kontrolleras av skriptets egen --fil-koll) |
| .part-säkerheten | verifierad indirekt: bladet existerar enbart som färdig gz (mv först vid pipeline-success) |

## 4. Bevis: återställning av DET RIKTIGA bladet (v98-mönstret — mät tid/rader)

Fullt format (rkaq-paritet: ägarskap/grants MED i dumpen — skillnad mot
KEDJA-0:ens --no-owner/--no-privileges-övningar) under
/tmp/ak1a-dr-prov.lock (flock, pid-rad enligt konvention):

| Moment | Värde |
|---|---|
| PG17 | viloläge före (egenmätt) · startad av övningen · **stoppad + nere efter** (egenmätt) |
| RAM vid PG17-start | 1 849 MB (grind ≥1 500 passeras utan väntan) |
| Restore `zcat \| psql` → ak1a_dr_app_kur | **exit 0 · RTO 32,9 s** (KEDJA-0-övningarna: 19,5–22,2 s med tunnare format) |
| Restore-fel | **2 611 rader — 100 % kända, 0 OKÄNDA** (fullformatets roll/grant-universum: service_role 572 · authenticated 569 · anon 547 · dashboard_user 117 · supabase_admin 50 · supabase_*_admin 99 · pgbouncer 2 · scheman cron 12/net 17 · övrigt kända 602 · fortsättningsrader 24) |
| Radkontrakt public | **372 tabeller / 182 332 rader** |
| Radkontrakt public+storage | 380 / 183 677 |
| Radkontrakt alla scheman | 417 / 185 505 |
| Nyckeltabeller | system_events **170 175** · user_activities **6 271** · auth.users 45 · board_decisions 77 · profiles 11 · members 3 · kurser 3+6+154 |
| Städning | skrap-DB raderad · PG17 stoppad · fellogg chmod 600 i /tmp · låsfilen kvar (flock-konvention, samma inode) |

Konsistens: syskonets KEDJA0-3 (19:09) hade system_events 170 174 — vårt
170 175 = +1 rad på ~35 min (levande system, sammanhängande); datorns
KEDJA-referens 372/417 tabeller EXAKT oförändrade.

## 5. RPO-gapet kurens stänger (mätt)

Diff mot KEDJA0-2 (12:43, samma instrument): **+1 189 public-rader på
6,55 h = 181,5 r/h** (blandad dag/kväll-fas; söndag). Dekomposition:
system_events +862 (72,5 %) · övrigt +327 (user_activites 6 271 mot
middagens 5 944 = +327, u2:s protokoll som källa — KEDJA0-2:s JSON saknade
nyckeln, ärligt null i maskin-JSON:en). Trefasmodellen (natt 103,4 · dag
61,6–82,4 · kväll ~180 r/h) ger **~2 400–2 500 rader/dygn** som hittills
växte i enda kopian — från i natt 02:50 fångas varje dygn i sin egen
db-app-bladkedja med 30 dagars retention och markerat slutmarkörskontrakt.

## 6. Avvikelser och ärlighetsnoteringar

- Dump-tiden 371 s är KVÄLLSBELASTAD (efter ett prod-bygge); nattreferensen
  (115–178 s från KEDJA-körningarna 02:30-tidigare) gäller för cron-läget —
  första riktiga 02:50-körningen verifieras i morgon (se kö).
- RAM-grinden väntade 150 s in bygget — doktrin följd ("vänta in fönstret,
  kringå aldrig grinden"); till skillnad från u2:s 12:39-vägran behövdes
  ingen omstart, fönstret öppnades självt.
- Felloggen (2 611 rader) ligger kvar i /tmp (chmod 600, tabell-/rollnamn
  endast, inga personuppgifter) som analysbar artefakt — väcks bort av
  reboot; protokollet bär kategoriseringen.
- crontab är systemtillstånd (ej i git) — bevis: före-kopia committad +
  rad 6 installerad 19:29 + jungfrukörning 02:50 väntas i morgon.

## 7. KVD

- **src/ orörd = INGET bygge** (nya filer: verktyg/dumpa-app-db.sh,
  protokoll, JSON-kopia, crontab-före-kopia, anspråk, DRIFTSBOKEN,
  worklog) — tsc ej aktuellt (ingen kod i src/ berörd).
- **R2 orörd**: priser/tier/publicering orörda · .env*/.pgpass/nycklar
  ENDAST lästa (vid körning), aldrig skrivna · data/blogg/ orörd.
- **Prod orörd** (dumpen läser Supabase-aufr som klient; inga skrivningar).
- Retentionen 30 dygn = spårets standard; R2-notis: bladen innehåller
  personuppgifter (auth.users 45) och ligger i data/backups/supabase/
  (gitignorerad, 664, samma regime som rkaq-bladen sedan 09-10).
- Disk: 55,3 GB ledigt före; +84,2 MB/dygn × 30 ≈ 2,5 GB tak — bevakas av
  spårets diskgrind (≥5 GB) vid varje övning.

## 8. Spårbarhet + kö vidare

- Maskinellt bevis: `data/forskning/DR-APPDUMP-2026-09-20-KUR.json`
  (kopia av /tmp/s10u3-kur-bevis.json — wrappern /tmp/s10u3-kur-ovning.mjs
  är engångs och städas ej in i repot).
- **Jungfrukörningsbevis 2026-09-21**: läsa /tmp/supabase-appdump.log
  (första raden väntas 02:50:xx "APP-DUMP start") + `db-app-2026-09-21.sql.gz`
  GRÖN — DUBBELPROJEKT-jungurkvitto, spårets nästa objekt.
- Kedja-3 (veckoarkiv 03:20 söndagar) fångar crontab-artefakten — nästa
  söndags konfigsnapshot bär rad 6 (jämförelsen 5==5 blir 6==6).
- Kvartalssviten (senast 2026-12-20): lägg till app-bladskontroll
  (`kolla-dump-markorer.mjs --fil db-app-senaste`) — baslinje-läget listar
  dem medvetet Ej (regex-skyddet).
- u2:s läxa kvarstående: dr-rpo-diff.mjs --projekt-app (DUBBELPROJEKT §7.2) —
  nu med en dumpkedja att mäta mot.

SLUT — DR-ÖVNING DUBBELPROJEKT-KUR, s10-u3 (fabriksagent, spår 10 vakt,
manifest auto-s10-1789923906930 uppgift 3/3), 2026-09-20 19:08–19:29 lokal
(17:08–17:29Z).
