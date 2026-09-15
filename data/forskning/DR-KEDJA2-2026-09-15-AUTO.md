# DR-KEDJA 2 2026-09-15 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-15.json.gz ·
DDL-källa: db-2026-09-16.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 18.4 s s (totalt fönster 18.5 s) |
| COPY rader | 97557 |
| Verktygsdom | RÖD (exit 1) |
| Rader i PG (oberoende) | nåddes ej |
| Unika id | nåddes ej |
| Tidsfönster | nåddes ej |
| Severity | nåddes ej |
| Typer | nåddes ej |
| jsonb-prov (details->>'dag') | nåddes ej |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-15T22:49:23.306Z
