# DR-INDEX-PROV 2026-09-16 — ALTER-system_events-composite.sql mot äkta data (AUTO)

Körd av `verktyg/dr-index-prov.mjs` (spår 10). Testobjekt: data/sql/ALTER-system_events-composite.sql
(våg 63, okörd sedan dess). DDL-källa: db-2026-09-16.sql.gz · rader: system-events-full-2026-09-16.json.gz.
Skrap-DB: ak1a_dr_index (isolerad PG17; prod RÖRDES ALDRIG — prod-DDL förblir huvudagentens).

| Moment | Resultat |
|---|---|
| Tabell-DDL ur dumpen | id, event_type, severity, message, details, source, created_at |
| Sekundära index i dumpen (prodens läge) | 0 st — INGA sekundära index i prod · PK: ALTER TABLE ONLY public.system_events ADD CONSTRAINT system_events_pkey PRIMARY KEY (id); |
| COPY rader (verktyg u3:2) | 161678 · totalt fönster 33.8 s |
| PK-mätning (kedja 1 + 2 i sekvens = katastrofens väg) | PK UNDERKÄND — ERROR:  could not create unique index "system_events_pkey" |
| Dublett-id i datat | 4 (rader 161678 − unika 161674) |
| Testfråga (filens eget läsmönster) | SELECT id, event_type, severity, created_at FROM system_events WHERE event_type='oversattning' ORDER BY created_at DESC LIMIT 20 (topp-typ oversattning, 146194 rader) |
| Baseline (före index) | 74.8 ms · plan: Seq Scan + Sort |
| RÅA FILEN ordagrant | UNDERKÄND (RÖD) — fel: `psql:/home/ak1a/AK1/data/sql/ALTER-system_events-composite.sql:31: ERROR:  syntax error at or near "CONCURRENTLY"`
| Kurera sats (kolumn event_type, CONCURRENTLY) | KÖRD GRÖN — kandidat 1 av 3 · bygg_tid 0.4 s (kandidat 1) |
| Efter index | 0.2 ms · plan: Index Scan |
| Vinst | 74.8 ms → 0.2 ms = 395.9× snabbare · Seq Scan + Sort → Index Scan |
| Tabellstorlek (före index) | 238 MB |
| Index-/tabellstorlek (efter) | 238 MB / 1552 kB (tabell / index) |
| Index aktivt (pg_indexes) | idx_system_events_type_created |
| Dom | GRÖN (exit 0) |
| Städning | ak1a_dr_index raderad · PG17 stoppad/nere |

Rå filens sats (ordagrant testad):
```sql
CREATE INDEX IF NOT EXISTS CONCURRENTLY idx_system_events_type_created
```

Kurerad sats (verifierad GRÖN här — kandidat för ny fil):
```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_system_events_type_created
  ON public.system_events(event_type, created_at desc);
```

Baseline-plan (klipp):
```
Limit  (cost=37067.00..37069.33 rows=20 width=104) (actual time=68.074..74.720 rows=20 loops=1)
  Buffers: shared hit=2506 read=28024
  ->  Gather Merge  (cost=37067.00..37585.27 rows=4442 width=104) (actual time=68.072..74.657 rows=20 loops=1)
        Workers Planned: 2
        Workers Launched: 2
        Buffers: shared hit=2506 read=28024
        ->  Sort  (cost=36066.98..36072.53 rows=2221 width=104) (actual time=61.462..61.465 rows=20 loops=3)
              Sort Key: created_at DESC
              Sort Method: top-N heapsort  Memory: 27kB
              Buffers: shared hit=2506 read=28024
              Worker 0:  Sort Method: top-N heapsort  Memory: 27kB
              Worker 1:  Sort Method: top-N heapsort  Memory: 27kB
              ->  Parallel Seq Scan on system_events  (cost=0.00..36007.88 rows=2221 width=104) (actual time=0.624..48.027 rows=48731 loops=3)
                    Filter: (event_type = 'oversattning'::text)
                    Rows Removed by Filter: 5161
                    Buffers: shared hit=2432 read=28024
Planning:
  Buffers: shared hit=54
Planning Time: 0.507 ms
Execution Time: 74.823 ms
```

Efter-plan (klipp):
```
Limit  (cost=0.42..79.88 rows=20 width=104) (actual time=0.078..0.148 rows=20 loops=1)
  Buffers: shared hit=3 read=5
  ->  Index Scan using idx_system_events_type_created on system_events  (cost=0.42..3210.56 rows=808 width=104) (actual time=0.077..0.144 rows=20 loops=1)
        Index Cond: (event_type = 'oversattning'::text)
        Buffers: shared hit=3 read=5
Planning:
  Buffers: shared hit=89 read=1
Planning Time: 0.733 ms
Execution Time: 0.189 ms
```

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-index-prov.mjs 2026-09-16T11:55:48.459Z
