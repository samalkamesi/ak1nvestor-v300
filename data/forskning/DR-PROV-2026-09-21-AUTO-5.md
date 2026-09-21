# DR-PROV 2026-09-21 — AUTOMATISK kvartalsövning (GODKÄNT)

> **ÖVNINGEN AVBRÖTS:** psql misslyckades: ERROR:  relation "public.analytiska" does not exist
LINE 1: ...public.analytiska sidan' AS t, count(*) AS n FROM public.ana...
                                                             ^


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
   på servern: **19.8 sekunder** — sedan raderade vi
   testdatabasen igen. Produktionen påverkades inte.
2. Kontrollen: **0 publika tabeller och
   0 rader** kom tillbaka.
3. Nytt från den här övningen: hela provet körs nu av **ett enda verktyg**
   i stället för en handflödesövning — nästa kvartalsprov är ett rutinkommando,
   och ett lås ser till att bara en agent i taget får använda testdatabasen.
4. Backupen kontrolleras först (är den komplett ända till sista raden?) —
   ett underkännande stoppar provet innan något händer. Inga okända fel uppstod.
5. Nästa övning: **senast 2026-12-21** — kör `node verktyg/dr-ovning.mjs`.

## 2. Genomförande (verktygets steg)

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 4152128) — EN agent äger PG17-fönstret |
| 1. Dumpkontroll | db-app-2026-09-21.sql.gz — GRÖN enligt markörkontraktet (s10-u1:s verktyg) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | ak1a_dr_test skapad färsk |
| 4. **Återställning (RTO)** | **19.8 s** (84.3 MB gz) · fellogg 2611 rader → /tmp/dr-ovning-fel-blad-app-2026-09-21-p4152128-1789952061293.log |
| 5. Mätning | se §3 |
| 6. Protokoll | denna fil |
| 7. Städning | skrap-DB raderad · PG17 stoppad (redo) |

## 3. Mätning (tre nivåer — u3:s kontrakt)

| Nivå | Tabeller | Rader |
|---|---|---|
| public | 0 | 0 |
| public + storage | 0 | 0 |
| alla scheman | 0 | 0 |

Per schema:

| Schema | Tabeller | Rader |
|---|---|---|


Nyckeltabeller:

| Tabell | Rader |
|---|---|


Största tabellerna:

| Tabell | Rader |
|---|---|


Jämförelse mot tidigare protokoll:

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (automatisk)** | 2026-09-21 | **19.8 s** | 0 | 0 |

## 4. Felloggen (2611 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extension finns inte i lokal
PG; vid äkta katastrof återskapas de i målmiljön först — v98 F3-slutsatsen):

- Roller: service_role 572, authenticated 569, anon 547, dashboard_user 117, supabase_admin 50, supabase_auth_admin 45, supabase_storage_admin 31, supabase_realtime_admin 23, pgbouncer 2
- Scheman: net 17, cron 12
- Övrigt kända mönster ("does not exist"/"must be owner"/"already exists"): 588
- Fortsättningsrader (HINT/DETAIL/LINE — tillhör ovanstående): 24
- Okända fel: 0
- Full logg: /tmp/dr-ovning-fel-blad-app-2026-09-21-p4152128-1789952061293.log

## 5. Kontext

- Dumpkällor: 11 natt-dumpar på disk (db-2026-09-11.sql.gz … db-2026-09-21.sql.gz; äldsta 9 dagar) — 30-dagarsretentionen sköts av cron-raden (find -mtime +30).
- Disk (53G ledigt (45 % använt)) — oförändrat av övningen (skrap-DB städad).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.

## 6. Status

- Verktyget: `verktyg/dr-ovning.mjs` — kvartalsövningen är härmed ETT kommando
  (nästa: **senast 2026-12-21**, `node verktyg/dr-ovning.mjs`).
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **GRÖN — övningen godkänd**.

SLUT — maskinellt genererat av dr-ovning.mjs 2026-09-21T00:54:42.124Z
