# DR-APPDUMP 2026-09-20 — KEDJA-0: första dump+restore av APPENS projekt (GODKÄNT)

**Körd av:** `verktyg/dr-appdump.mjs` (s10-u2, manifest auto-s10-1789826700636).
**Mål:** db.aufrvmesyzsfsuhvlsbp.supabase.co — appens projekt (aufr, ref suhvlsbp).
**Behörighetskälla:** .env.production.local:s DATABASE_URL (värd db.rkaqmulgoubvewwnwxrw.supabase.co) — lösenord finns (20 tecken), läst vid körning, ALDRIG loggat.

> Bakgrund: DUBBELPROJEKT-övningen 2026-09-19 bevisade att kedja 1 (db-dumpar
> 02:30) läser projekt rkaq och ALDRIG fångat appens data. Detta är spårets
> första dump+restore av appens projekt — beviset huvudagentens kedjekur
> (DUBBELPROJEKT §7.1) bygger på.

## Mätetal

| Moment | Värde |
|---|---|
| pg_dump-tid (aufr) | 114.8 s |
| Dumpstorlek (gz) | 84.1 MB · sha256 223b6e8189ce4021… |
| Slutmarkör / COPY / CREATE TABLE | GRÖN / 420 / 418 |
| RTO (restore i skrap-PG17) | 20.4 s |
| Restore-fel | 109 rader (kända 109, OKÄNDA 0) → /tmp/dr-appdump-fel-aufr-p3620937-1789900983600.log |
| Kända roller | service_role 26, authenticated 24, anon 2 |
| Kända scheman | cron 2 |

## Radkontrakt (tredelat, jämförbart med rkaq-bladen)

| Nivå | Tabeller | Rader | rkaq-blad 09-19 (referens) |
|---|---|---|---|
| public | 372 | 181 143 | 60 / 1 325 919 |
| public+storage | 380 | 182 488 | 68 / 1 326 055 |
| alla scheman | 417 | 184 307 | 99 / 1 326 315 |

## Appens nyckeltabeller (återställda)

| auth.users | 45 |
| public.ai_generated_courses | 154 |
| public.ai_learning_events | 0 |
| public.ai_self_healing_events | 0 |
| public.audit_events | 0 |
| public.autonomous_course_evolution | 0 |
| public.autonomous_course_triggers | 0 |
| public.board_decisions | 77 |
| public.course_adaptations | 0 |
| public.course_ecosystem_data | 0 |
| public.course_progress | 0 |
| public.course_updates | 0 |
| public.courses | 3 |
| public.economic_events | 0 |
| public.edu_course_adaptations | 0 |
| public.education_courses | 6 |
| public.educational_modules | 13 |
| public.failover_events | 0 |
| public.immune_security_events | 0 |
| public.members | 3 |
| public.news_course_mappings | 0 |
| public.profiles | 11 |
| public.system_events | 169 313 |
| public.user_course_progress | 0 |

## Schema-fördelning

| public | 372 | 181 143 |
| auth | 27 | 1 588 |
| storage | 8 | 1 345 |
| supabase_migrations | 1 | 149 |
| realtime | 9 | 82 |

## Topp-8 tabeller

| public.system_events | 169 313 |
| public.user_activities | 5 944 |
| public.autonomous_system_evolution | 1 359 |
| storage.objects | 1 273 |
| auth.audit_log_entries | 1 168 |
| public.agent_swarm | 1 000 |
| public.learning_feedback_loops | 714 |
| public.ai_performance_metrics | 437 |

## Kedja-2-jämförelse (den ENDA befintliga kopian av appens händelser)

| Kopia | Rader | API-total | Truncerad | Fil (gz-storlek) |
|---|---|---|---|---|
| system-events-full (JSON 02:40) | 168 696 | 168 696 | false | system-events-full-2026-09-20.json.gz (27 MB) |
| medlemmar (JSON 02:40) | 3 | 3 | false | medlemmar-2026-09-20.json |
| system_events (DUMP, nu) | 169 313 | — | — | pg_dump 2026-09-20 (84.1 MB HELA databasen) |

## Städning

- skrap-DB raderad · PG17 stoppad · dumpfil raderad (GDPR)

## Gränser

- .pgpass / crontab / .env* orörda (skriv) — lösenord läst vid körning ur
  .env.production.local, förs endast som PGPASSWORD-env, aldrig loggat.
- Dumpfilen i /tmp chmod 600, raderad efter mätning (bär personuppgifter).
- Protokollet bär ENDAST antal och tabell-/kolumnnamn — GDPR-rent.
- src/ orörd — inget bygge. PG17-fönstret under /tmp/ak1a-dr-prov.lock (flock).


SLUT — DR-APPDUMP KEDJA-0, genererad 2026-09-20T10:43:32.860Z
