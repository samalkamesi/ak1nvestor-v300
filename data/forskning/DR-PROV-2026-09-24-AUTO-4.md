# DR-PROV 2026-09-24 — AUTOMATISK kvartalsövning (GODKÄNT)


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
   på servern: **93.8 sekunder** — sedan raderade vi
   testdatabasen igen. Produktionen påverkades inte.
2. Kontrollen: **372 publika tabeller och
   188 736 rader** kom tillbaka.
3. Nytt från den här övningen: hela provet körs nu av **ett enda verktyg**
   i stället för en handflödesövning — nästa kvartalsprov är ett rutinkommando,
   och ett lås ser till att bara en agent i taget får använda testdatabasen.
4. Backupen kontrolleras först (är den komplett ända till sista raden?) —
   ett underkännande stoppar provet innan något händer. Inga okända fel uppstod.
5. Nästa övning: **senast 2026-12-24** — kör `node verktyg/dr-ovning.mjs`.

## 2. Genomförande (verktygets steg)

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 2880259) — EN agent äger PG17-fönstret |
| 1. Dumpkontroll | db-app-2026-09-24.sql.gz — GRÖN enligt markörkontraktet (s10-u1:s verktyg) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **93.8 s** (84.6 MB gz) · fellogg 2611 rader → /tmp/dr-ovning-fel-blad-app-2026-09-24-p2880259-1790228166635.log |
| 5. Mätning | se §3 |
| 6. Protokoll | denna fil |
| 7. Städning | skrap-DB raderad · PG17 stoppad (redo) |

## 3. Mätning (tre nivåer — u3:s kontrakt)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 372 | 188 736 |
| public + storage | 380 | 190 081 |
| alla scheman | 417 | 191 851 |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|
| public | 372 | 188 736 |
| auth | 27 | 1 539 |
| storage | 8 | 1 345 |
| supabase_migrations | 1 | 149 |
| realtime | 9 | 82 |

Nyckeltabeller:

| Tabell | Rader |
|---|---|
| auth.users | 45 |
| public.ai_generated_courses | 154 |
| public.autonomous_course_evolution | 0 |
| public.autonomous_course_triggers | 0 |
| public.board_decisions | 77 |
| public.course_adaptations | 0 |
| public.course_ecosystem_data | 0 |
| public.course_progress | 0 |
| public.course_updates | 0 |
| public.courses | 3 |
| public.edu_course_adaptations | 0 |
| public.education_courses | 6 |
| public.educational_modules | 13 |
| public.members | 3 |
| public.news_course_mappings | 0 |
| public.profiles | 11 |
| public.user_course_progress | 0 |

Största tabellerna:

| Tabell | Rader |
|---|---|
| public.system_events | 174 821 |
| public.user_activities | 8 029 |
| public.autonomous_system_evolution | 1 359 |
| storage.objects | 1 273 |
| auth.audit_log_entries | 1 180 |
| public.agent_swarm | 1 000 |
| public.learning_feedback_loops | 714 |
| public.ai_performance_metrics | 437 |

Jämförelse mot tidigare protokoll:

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (automatisk)** | 2026-09-24 | **93.8 s** | 372 | 188 736 |

## 4. Felloggen (2611 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extension finns inte i lokal
PG; vid äkta katastrof återskapas de i målmiljön först — v98 F3-slutsatsen):

- Roller: service_role 572, authenticated 569, anon 547, dashboard_user 117, supabase_admin 50, supabase_auth_admin 45, supabase_storage_admin 31, supabase_realtime_admin 23, pgbouncer 2
- Scheman: net 17, cron 12
- Övrigt kända mönster ("does not exist"/"must be owner"/"already exists"): 588
- Fortsättningsrader (HINT/DETAIL/LINE — tillhör ovanstående): 24
- Okända fel: 0
- Full logg: /tmp/dr-ovning-fel-blad-app-2026-09-24-p2880259-1790228166635.log

## 5. Kontext

- Dumpkällor: 14 natt-dumpar på disk (db-2026-09-11.sql.gz … db-2026-09-24.sql.gz; äldsta 12 dagar) — 30-dagarsretentionen sköts av cron-raden (find -mtime +30).
- Disk (48G ledigt (51 % använt)) — oförändrat av övningen (skrap-DB städad).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.

## 6. Status

- Verktyget: `verktyg/dr-ovning.mjs` — kvartalsövningen är härmed ETT kommando
  (nästa: **senast 2026-12-24**, `node verktyg/dr-ovning.mjs`).
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **GRÖN — övningen godkänd**.

SLUT — maskinellt genererat av dr-ovning.mjs 2026-09-24T05:37:46.640Z
