# DR-INDEX-PROV 2026-09-16 — ALTER-system_events-composite.sql mot äkta data (AUTO)

Körd av `verktyg/dr-index-prov.mjs` (spår 10). Testobjekt: data/sql/ALTER-system_events-composite.sql
(våg 63, okörd sedan dess). DDL-källa: db-2026-09-16.sql.gz · rader: system-events-full-2026-09-16.json.gz.
Skrap-DB: ak1a_dr_index (isolerad PG17; prod RÖRDES ALDRIG — prod-DDL förblir huvudagentens).

| Moment | Resultat |
|---|---|
| Tabell-DDL ur dumpen | id, event_type, severity, message, details, source, created_at |
| Sekundära index i dumpen (prodens läge) | 0 st — INGA sekundära index i prod · PK: ALTER TABLE ONLY public.system_events ADD CONSTRAINT system_events_pkey PRIMARY KEY (id); |
| COPY rader (verktyg u3:2) | ? · totalt fönster 35.3 s |
| Dublett-id i datat | nåddes ej |
| Testfråga (filens eget läsmönster) | nåddes ej |
| Baseline (före index) | ? ms · plan: ? |
| RÅA FILEN ordagrant | undefined 
| Kurera sats (kolumn —, CONCURRENTLY) | undefined  |
| Efter index | ? ms · plan: ? |
| Vinst | ? |
| Indexstorlek / tabellstorlek | nåddes ej |
| Index aktivt (pg_indexes) | nåddes ej |
| Dom | RÖD (exit 1) |
| Städning | ak1a_dr_index raderad · PG17 stoppad/nere |

Rå filens sats (ordagrant testad):
```sql
(nåddes ej)
```

Kurerad sats (verifierad GRÖN här — kandidat för ny fil):
```sql
(behövdes ej — rå filen körbar)
```

Baseline-plan (klipp):
```
(nåddes ej)
```

Efter-plan (klipp):
```
(nåddes ej)
```

Avbrottsorsak: aterstall-system-events.mjs exit 1 (kedja 2-verktyget RÖT)

SLUT — maskinellt genererat av dr-index-prov.mjs 2026-09-16T11:46:30.962Z
