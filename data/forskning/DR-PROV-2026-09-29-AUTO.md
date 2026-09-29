# DR-PROV 2026-09-29 — AUTOMATISK kvartalsövning (UNDERKÄNT)

> **ÖVNINGEN AVBRÖTS:** pg_ctlcluster start misslyckades: sudo: I'm sorry ak1a. I'm afraid I can't do that


**Körd av:** `verktyg/dr-ovning.mjs` (spår 10, s10-u4) — hela övningen som
ett kommando; detta protokoll genererades av verktyget vid körningen.

**Uppdrag:** Evighetskatalogen spår 10 (DATAINTEGRITET & BACKUP) —
återställningsövning per kvartal. Tidigare prov: v98 F3 (2026-09-11),
s10-u2 + s10-u3 (2026-09-15, manuella). Detta är spårets nästa steg:
övningen MEKANISERAD — mätmetodiken från u3 (tre nivåer) inbyggd,
u3:s låsfilskur implementerad.

---

## 1. Sammanfattning för kunden (5 rader)

1. Övningen avbröts **före** återställningen (se banderollen) — inga återställningsmätetal framställdes; produktionen påverkades inte.
2. Orsak och dom: banderollen + §2.
3. Nytt från den här övningen: hela provet körs nu av **ett enda verktyg**
   i stället för en handflödesövning — nästa kvartalsprov är ett rutinkommando,
   och ett lås ser till att bara en agent i taget får använda testdatabasen.
4. Backupen kontrolleras först (är den komplett ända till sista raden?) —
   ett underkännande stoppar provet innan något händer. Inga okända fel uppstod.
5. Nästa övning: **senast 2026-12-29** — kör `node verktyg/dr-ovning.mjs`.

## 2. Genomförande (verktygets steg)

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 845201) — EN agent äger PG17-fönstret |
| 1. Dumpkontroll | db-2026-09-29.sql.gz — GRÖN enligt markörkontraktet (s10-u1:s verktyg) |
| 2. PG17 | startad av verktyget (låg stoppad — korrekt viloläge) |
| 3. Skrap-DB | nåddes ej |
| 4. **Återställning (RTO)** | nåddes ej |
| 5. Mätning | nåddes ej |
| 6. Protokoll | denna fil |
| 7. Städning | PG17/skrap-DB rördes ej (avbrot före start) |

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
| **denna (automatisk)** | 2026-09-29 | **NaN s** | 0 | 0 |

## 4. Felloggen (0 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extension finns inte i lokal
PG; vid äkta katastrof återskapas de i målmiljön först — v98 F3-slutsatsen):

- Roller: inga
- Scheman: inga
- Övrigt kända mönster ("does not exist"/"must be owner"/"already exists"): 0
- Fortsättningsrader (HINT/DETAIL/LINE — tillhör ovanstående): undefined
- Okända fel: 0
- Full logg: (restore nåddes ej)

## 5. Kontext

- Dumpkällor: 0 natt-dumpar på disk (undefined; äldsta null dagar) — 30-dagarsretentionen sköts av cron-raden (find -mtime +30).
- Disk (1.1T ledigt (3 % använt)) — oförändrat av övningen (skrap-DB städad).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på lokal PG17 (port 5432); prod-data lever i Supabase-molnet.

## 6. Status

- Verktyget: `verktyg/dr-ovning.mjs` — kvartalsövningen är härmed ETT kommando
  (nästa: **senast 2026-12-29**, `node verktyg/dr-ovning.mjs`).
- Kod i src/ berördes ej — tsc-baslinjen orörd; inga byggen.
- Slutdom: **RÖD — se fynd ovan**.

SLUT — maskinellt genererat av dr-ovning.mjs 2026-09-29T10:24:34.883Z
