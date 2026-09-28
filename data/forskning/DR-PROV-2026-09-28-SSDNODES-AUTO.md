# DR-PROV 2026-09-28 SSDNODES — AUTOMATISK övning (UNDERKÄNT)

> **ÖVNINGEN AVBRÖTS:** pg_ctl start misslyckades (exit 1, logg: /home/ak1a/dr-pgdata-server.log)


**Körd av:** `verktyg/dr-ovning-ssdnodes.mjs` (v193, r288) — serverbytets
DR-övning: samma kontrakt som Contabo-syskonet (dr-ovning.mjs) men mot en
USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root behövs).

---

## 1. Sammanfattning för kunden (5 rader)

1. Övningen avbröts **före** återställningen — inga mätetal framställdes; produktionen påverkades inte.
2. Orsak och dom: banderollen + §2.
3. Nytt: övningen körs nu mot en **root-fri userspace-postgres** — nya servern saknar system-PG och sudo är förbjudet; hela katastrofåterställningsförmågan är bevisad på nya maskinen.
4. Backupen kontrollerades först (komplett ända till sista raden). Inga okända fel.
5. Nästa övning: kvartal enligt DRIFTSBOKEN — `node verktyg/dr-ovning-ssdnodes.mjs`.

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 100283) |
| 1. Dumpkontroll | db-cutover-test.sql.gz — GRÖN |
| 2. Userspace-PG18 | startad av verktyget (127.0.0.1:55432, port 5432 orörd) |
| 3. Skrap-DB | nåddes ej |
| 4. **Återställning (RTO)** | nåddes ej |
| 5. Mätning | nåddes ej |
| 6. Protokoll | denna fil |
| 7. Städning | PG/skrap-DB rördes ej |

## 3. Mätning (tre nivåer)

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


Jämförelse (Contabo-eran):

| Övning | Datum | RTO | public-tabeller | public-rader |
|---|---|---|---|---|
| v98 F3 (godkänd mall) | 2026-09-11 | 20.0 s | 60 | 1 187 291 |
| s10-u2 (kvartalsövning) | 2026-09-15 | 17.7 s | 60 | 1 246 728 |
| s10-u3 (oberoende replik) | 2026-09-15 | 14.7 s | 60 | 1 246 728 |
| **denna (ssdnodes, userspace-PG)** | 2026-09-28 | **NaN s** | 0 | 0 |

## 4. Felloggen (0 rader)

Kända ofarliga (Supabase-molnets roller/scheman/extensions finns inte i lokal PG —
vid äkta katastrof återskapas de i målmiljön först, v98 F3-slutsatsen):
roller {inga} ·
scheman {inga} ·
extensions {inga} ·
övrigt kända 0 · fortsättningsrader undefined.
- Okända fel: 0
- Full logg: (restore nåddes ej)

## 5. Kontext

- Dump: db-cutover-test.sql.gz (35.1 MB gz).
- GDPR: protokollet redovisar endast antal, tabell-/fältnamn och tider — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:55432); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.
- Userspace-PG: binärer ~/.pg-ssdnodes (deb-uppackade, ingen root) · datadir /home/ak1a/dr-pgdata · serverlogg /home/ak1a/dr-pgdata-server.log.

## 6. Status

- Slutdom: **RÖD — se fynd ovan**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-ovning-ssdnodes.mjs 2026-09-28T05:38:42.826Z
