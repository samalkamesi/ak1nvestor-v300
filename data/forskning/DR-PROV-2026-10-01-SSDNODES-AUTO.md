# DR-PROV 2026-10-01 SSDNODES — AUTOMATISK övning (GODKÄNT)


**Körd av:** `verktyg/dr-ovning-ssdnodes.mjs` (v193, r288) — serverbytets
DR-övning: samma kontrakt som Contabo-syskonet (dr-ovning.mjs) men mot en
USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root behövs).

---

## 1. Sammanfattning för kunden (5 rader)

1. Vi återställde **hela databasen från backup** i en avskild testdatabas på servern: **80.1 sekunder** — testdatabasen raderades efteråt. Produktionen påverkades inte.
2. Kontrollen: **60 publika tabeller och 1 563 634 rader** kom tillbaka.
3. Nytt: övningen körs nu mot en **root-fri userspace-postgres** — nya servern saknar system-PG och sudo är förbjudet; hela katastrofåterställningsförmågan är bevisad på nya maskinen.
4. Backupen kontrollerades först (komplett ända till sista raden). Inga okända fel.
5. Nästa övning: kvartal enligt DRIFTSBOKEN — `node verktyg/dr-ovning-ssdnodes.mjs`.

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 2583820) |
| 1. Dumpkontroll | db-2026-10-01.sql.gz — GRÖN |
| 2. Userspace-PG18 | startad av verktyget (127.0.0.1:55432, port 5432 orörd) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **80.1 s** (36.4 MB gz) · fellogg 1077 rader → /tmp/dr-ovning-fel-blad-2026-10-01-p2583820-1790831606486.log |
| 5. Mätning | se §3 |
| 6. Protokoll | denna fil |
| 7. Städning | skrap-DB raderad · PG stoppad |

## 3. Mätning (tre nivåer)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 563 634 |
| public + storage | 68 | 1 563 770 |
| alla scheman | 99 | 1 564 030 |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|
| public | 60 | 1 563 634 |
| auth | 27 | 140 |
| storage | 8 | 136 |
| realtime | 3 | 82 |
| supabase_migrations | 1 | 38 |

Nyckeltabeller:

| Tabell | Rader |
|---|---|
| auth.users | 3 |
| public.board_decisions | 58 626 |
| public.course_materials | 0 |
| public.course_modules | 122 |
| public.course_progress | 0 |
| public.courses | 10 |
| public.members | 0 |
| public.profiles | 3 |
| public.section_data | 19 363 |
| public.section_data_era | 18 933 |
| public.section_data_snapshots | 1 461 228 |
| public.user_course_progress | 0 |

Största tabellerna:

| Tabell | Rader |
|---|---|
| public.section_data_snapshots | 1 461 228 |
| public.board_decisions | 58 626 |
| public.section_data | 19 363 |
| public.section_data_era | 18 933 |
| public.organ_health_logs | 3 589 |
| public.wave_signals | 490 |
| public.forecast_log | 429 |
| public.forecast_outcomes | 299 |

Jämförelse (Contabo-eran):

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (ssdnodes, userspace-PG)** | 2026-10-01 | **80.1 s** | 60 | 1 563 634 |

## 4. Felloggen (1077 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extensions finns inte i lokal PG —
vid äkta katastrof återskapas de i målmiljön först, v98 F3-slutsatsen):
roller {supabase_admin×25, postgres×313, pgbouncer×2, supabase_auth_admin×42, supabase_realtime_admin×23, supabase_storage_admin×31, authenticated×208, anon×135, service_role×142, dashboard_user×111} ·
scheman {cron×12, net×5} ·
extensions {pg_cron×2, pg_net×2, supabase_vault×2} ·
övrigt kända 13 · fortsättningsrader 9.
- Okända fel: 0
- Full logg: /tmp/dr-ovning-fel-blad-2026-10-01-p2583820-1790831606486.log

## 5. Kontext

- Dump: db-2026-10-01.sql.gz (36.4 MB gz).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:55432); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.
- Userspace-PG: binärer ~/.pg-ssdnodes (deb-uppackade, ingen root) · datadir /home/ak1a/dr-pgdata · serverlogg /home/ak1a/dr-pgdata-server.log.

## 6. Status

- Slutdom: **GRÖN — övningen godkänd**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-ovning-ssdnodes.mjs 2026-10-01T05:14:55.657Z
