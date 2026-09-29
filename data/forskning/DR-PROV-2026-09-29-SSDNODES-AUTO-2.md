# DR-PROV 2026-09-29 SSDNODES — AUTOMATISK övning (GODKÄNT)


**Körd av:** `verktyg/dr-ovning-ssdnodes.mjs` (v193, r288) — serverbytets
DR-övning: samma kontrakt som Contabo-syskonet (dr-ovning.mjs) men mot en
USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root behövs).

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från backup** i en avskild testdatabas på servern: **89.3 sekunder** — testdatabasen raderades efteråt. Produktionen påverkades inte.
2. Kontrollen: **372 publika tabeller och 201 910 rader** kom tillbaka.
3. Nytt: övningen körs nu mot en **root-fri userspace-postgres** — nya servern saknar system-PG och sudo är förbjudet; hela katastrofåterställningsförmågan är bevisad på nya maskinen.
4. Backupen kontrollerades först (komplett ända till sista raden). Inga okända fel.
5. Nästa övning: kvartal enligt DRIFTSBOKEN — `node verktyg/dr-ovning-ssdnodes.mjs`.

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 850398) |
| 1. Dumpkontroll | db-app-2026-09-29.sql.gz — GRÖN |
| 2. Userspace-PG18 | startad av verktyget (127.0.0.1:55432, port 5432 orörd) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **89.3 s** (85.6 MB gz) · fellogg 3307 rader → /tmp/dr-ovning-fel-blad-app-2026-09-29-p850398-1790678072602.log |
| 5. Mätning | se §3 |
| 6. Protokoll | denna fil |
| 7. Städning | skrap-DB raderad · PG stoppad |

## 3. Mätning (tre nivåer)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 372 | 201 910 |
| public + storage | 380 | 203 260 |
| alla scheman | 417 | 205 115 |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|
| public | 372 | 201 910 |
| auth | 27 | 1 620 |
| storage | 8 | 1 350 |
| supabase_migrations | 1 | 149 |
| realtime | 9 | 86 |

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
| public.members | 2 |
| public.news_course_mappings | 0 |
| public.profiles | 11 |
| public.user_course_progress | 0 |

Största tabellerna:

| Tabell | Rader |
|---|---|
| public.system_events | 185 785 |
| public.user_activities | 10 240 |
| public.autonomous_system_evolution | 1 359 |
| storage.objects | 1 273 |
| auth.audit_log_entries | 1 244 |
| public.agent_swarm | 1 000 |
| public.learning_feedback_loops | 714 |
| public.ai_performance_metrics | 437 |

Jämförelse (Contabo-eran):

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (ssdnodes, userspace-PG)** | 2026-09-29 | **89.3 s** | 372 | 201 910 |

## 4. Felloggen (3307 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extensions finns inte i lokal PG —
vid äkta katastrof återskapas de i målmiljön först, v98 F3-slutsatsen):
roller {supabase_admin×32, postgres×721, pgbouncer×2, supabase_auth_admin×42, supabase_realtime_admin×23, supabase_storage_admin×33, anon×547, service_role×572, authenticated×569, dashboard_user×117} ·
scheman {cron×12, net×17} ·
extensions {pg_cron×2, pg_net×2, hypopg×2, index_advisor×2, supabase_vault×2, vector×2, wrappers×2} ·
övrigt kända 587 · fortsättningsrader 19.
- Okända fel: 0
- Full logg: /tmp/dr-ovning-fel-blad-app-2026-09-29-p850398-1790678072602.log

## 5. Kontext

- Dump: db-app-2026-09-29.sql.gz (85.6 MB gz).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:55432); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.
- Userspace-PG: binärer ~/.pg-ssdnodes (deb-uppackade, ingen root) · datadir /home/ak1a/dr-pgdata · serverlogg /home/ak1a/dr-pgdata-server.log.

## 6. Status

- Slutdom: **GRÖN — övningen godkänd**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-ovning-ssdnodes.mjs 2026-09-29T10:36:14.144Z
