# DR-PROV 2026-09-18 — AUTOMATISK kvartalsövning (GODKÄNT)


**Körd av:** `verktyg/dr-ovning.mjs` (spår 10, s10-u4) — hela övningen som
ett kommando; detta protokoll genererades av verktyget vid körningen.

**Uppdrag:** Evighetskatalogen spår 10 (DATAINTEGRITET & BACKUP) —
återställningsövning per kvartal. Tidigare prov: v98 F3 (2026-09-11),
s10-u2 + s10-u3 (2026-09-15, manuella). Detta är spårets nästa steg:
övningen MEKANISERAD — mätmetodiken från u3 (tre nivåer) inbyggd,
u3:s låsfilskur implementerad.

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från en backup** i en avskild testdatabas
   på servern: **10.2 sekunder** — sedan raderade vi
   testdatabasen igen. Produktionen påverkades inte.
2. Kontrollen: **60 publika tabeller och
   1 306 119 rader** kom tillbaka — datat växer som väntat.
3. Nytt från den här övningen: hela provet körs nu av **ett enda verktyg**
   i stället för en handflödesövning — nästa kvartalsprov är ett rutinkommando,
   och ett lås ser till att bara en agent i taget får använda testdatabasen.
4. Backupen kontrolleras först (är den komplett ända till sista raden?) —
   ett underkännande stoppar provet innan något händer. Inga okända fel uppstod.
5. Nästa övning: **senast 2026-12-18** — kör `node verktyg/dr-ovning.mjs`.

## 2. Genomförande (verktygets steg)

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 1872083) — EN agent äger PG17-fönstret |
| 1. Dumpkontroll | db-2026-09-18.sql.gz — GRÖN enligt markörkontraktet (s10-u1:s verktyg) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **10.2 s** (30.7 MB gz) · fellogg 788 rader → /tmp/dr-ovning-fel-2026-09-18.log |
| 5. Mätning | se §3 |
| 6. Protokoll | denna fil |
| 7. Städning | skrap-DB raderad · PG17 stoppad (redo) |

## 3. Mätning (tre nivåer — u3:s kontrakt)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 306 119 |
| public + storage | 68 | 1 306 255 |
| alla scheman | 99 | 1 306 515 |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 306 119 |
| auth | 27 | 140 |
| storage | 8 | 136 |
| realtime | 3 | 82 |
| supabase_migrations | 1 | 38 |

Nyckeltabeller:

| Tabell | Rader |
|---|---|
| auth.users | 3 |
| public.board_decisions | 48 578 |
| public.course_materials | 0 |
| public.course_modules | 122 |
| public.course_progress | 0 |
| public.courses | 10 |
| public.members | 0 |
| public.profiles | 3 |
| public.section_data | 19 363 |
| public.section_data_era | 18 933 |
| public.section_data_snapshots | 1 214 436 |
| public.user_course_progress | 0 |

Största tabellerna:

| Tabell | Rader |
|---|---|
| public.section_data_snapshots | 1 214 436 |
| public.board_decisions | 48 578 |
| public.section_data | 19 363 |
| public.section_data_era | 18 933 |
| public.organ_health_logs | 2 976 |
| public.wave_signals | 490 |
| public.forecast_log | 429 |
| public.app_files | 251 |

Jämförelse mot tidigare protokoll:

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (automatisk)** | 2026-09-18 | **10.2 s** | 60 | 1 306 119 |

## 4. Felloggen (788 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extension finns inte i lokal
PG; vid äkta katastrof återskapas de i målmiljön först — v98 F3-slutsatsen):

- Roller: authenticated 208, service_role 142, anon 135, dashboard_user 111, supabase_auth_admin 45, supabase_admin 43, supabase_storage_admin 31, supabase_realtime_admin 23, pgbouncer 2
- Scheman: cron 12, net 5
- Övrigt kända mönster ("does not exist"/"must be owner"/"already exists"): 13
- Fortsättningsrader (HINT/DETAIL/LINE — tillhör ovanstående): 12
- Okända fel: 0
- Full logg: /tmp/dr-ovning-fel-2026-09-18.log

## 5. Kontext

- Dumpkällor: 8 natt-dumpar på disk (db-2026-09-11.sql.gz … db-2026-09-18.sql.gz; äldsta 6 dagar) — 30-dagarsretentionen sköts av cron-raden (find -mtime +30).
- Disk (72G ledigt (26 % använt)) — oförändrat av övningen (skrap-DB städad).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.

## 6. Status

- Verktyget: `verktyg/dr-ovning.mjs` — kvartalsövningen är härmed ETT kommando
  (nästa: **senast 2026-12-18**, `node verktyg/dr-ovning.mjs`).
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **GRÖN — övningen godkänd**.

SLUT — maskinellt genererat av dr-ovning.mjs 2026-09-18T00:58:55.874Z
