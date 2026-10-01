# DR-KEDJA 2 2026-10-01 SSDNODES — moln-JSON-övning (GODKÄNT)


Körd av `verktyg/dr-kedja2-ssdnodes.mjs` (spår 10) — kedja 2:s port till
SSD Nodes-eran: samma kontrakt som Contabo-syskonet (dr-kedja2.mjs) men mot
en USERSPACE-PG18 (port 55432, ~/.pg-ssdnodes — ingen root). Userspace-
lagret ärvs via import från dr-ovning-ssdnodes.mjs; inmatningsverktyget
aterstall-system-events.mjs kör OMODIFIERAT (styrt via PGHOST/PGPORT/PGUSER).

---

## 1. Sammanfattning för kunden (5 rader)

1. Händelseloggen (system_events) saknas i SQL-nattdumpen — dess katastrofväg är moln-JSON-arkivet. Vi återställde **hela händelseloggen från moln-backupen** i en avskild testdatabas på servern: **298.0 sekunder** — testdatabasen raderades efteråt. Produktionen påverkades inte.
2. Kontrollen: **187737 händelser** kom tillbaka, alla med unika id (187737) — fyra-samma-kontraktet höll (arkivets eget tal == strömmens == inlästa == oberoende omräkning i databasen).
3. Nytt: kedja 2 är nu bevisad på **nya servern** (root-fri userspace-postgres) — dessförinnan var kedjans senaste restore-bevis från 09-21 på Contabo, och moln-bladen som fötts sedan serverbytet var restore-oskyddade.
4. Backupen kontrollerades först (arkivets header + ström + per-rad giltighet, verktygets egen dom: GRÖN).
5. Nästa övning: kvartal enligt DRIFTSBOKEN — `node verktyg/dr-kedja2-ssdnodes.mjs` (tillsammans med kedja 1).

## 2. Genomförande

| Steg | Resultat |
|---|---|
| 0. Lås /tmp/ak1a-dr-prov.lock | taget (pid 2588385) |
| 1. Grind | MemAvailable/disk kontrollerad före allt tungt |
| 2. Userspace-PG18 | startad av verktyget (127.0.0.1:55432, port 5432 orörd) |
| 3. Skrap-DB | ak1a_dr_json skapad färsk (ägare ak1a) |
| 4. Tabell-DDL | ur db-2026-10-01.sql.gz (prodens egen definition) · extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY) |
| 5. Återställning (RTO) | **298.0 s** (totalt fönster 299.2 s · arkiv 27.4 MB gz) |
| 6. Oberoende verifiering | se §3 |
| 7. Städning | skrap-DB raderad · PG stoppad |

## 3. Fyra-samma-kontraktet + verifiering

| Led | Källa | Tal |
|---|---|---|
| 1. Arkivets header | moln-backupens egen räkning | (bärs av verktygsdomen) |
| 2. Gzip-ström | per-rad giltighet, 0 dubblett-id | (verktygsdomen GRÖN) |
| 3. COPY-n | psql:s inlästa rader | 187737 |
| 4. Oberoende omräkning | count(*) i återställd tabell | 187737 |

Oberoende frågor mot den återställda tabellen:

| Fråga | Svar |
|---|---|
| Rader | 187737 |
| Unika id | 187737 |
| Tidsfönster (created_at) | 2026-09-03 20:43:12.603298+00 … 2026-10-01 02:40:06.876233+00 |
| Severity | info=186035 · warning=1702 |
| Typer (event_type) | oversattning=146190 · trafik=39555 · sakerhet=1874 · akm2_snapshot=101 · blogg_utkast=12 · medlem=3 · blogg_publicerad=2 |
| jsonb-prov (details->>'dag') | 39555 |

Jämförelse (Contabo-eran, kedja 2):

| Övning | Datum | RTO | Rader |
|---|---|---|---|
| kedja 2 jungfru (s10) | 2026-09-17 | 25.0 s | 163 039 |
| kedja 2 (s10-u4-replik) | 2026-09-20 | 34.3 s | 168 696 |
| kedja 2 (s10-u1 kväll) | 2026-09-21 | 104.5 s | 170 979 |
| **denna (ssdnodes, userspace-PG18)** | 2026-10-01 | **298.0 s** | 187737 |

## 4. Kontext

- Arkiv: system-events-full-2026-10-01.json.gz (27.4 MB gz, fött 2026-10-01T02:41:53.180Z).
- DDL-källa: db-2026-10-01.sql.gz.
- GDPR: protokollet redovisar endast antal och typer — inga personvärden.
- Prod opåverkad: skrap-DB på userspace-PG (127.0.0.1:55432); prod-data lever i Supabase-molnet; port 5432 rördes aldrig.

## 5. Status

- Slutdom: **GRÖN — övningen godkänd**.
- src/ berördes ej — tsc-baslinjen orörd; inga byggen.

SLUT — maskinellt genererat av dr-kedja2-ssdnodes.mjs 2026-10-01T05:23:17.363Z
