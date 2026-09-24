# DR-KEDJA 2 2026-09-21 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-21.json.gz ·
DDL-källa: db-2026-09-21.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 104.5 s (totalt fönster 104.7 s) |
| COPY rader | 170979 |
| Verktygsdom | GRÖN (exit 0) |
| Rader i PG (oberoende) | 170979 |
| Unika id | 170979 |
| Tidsfönster | 2026-09-03 22:43:12.603298+02 … 2026-09-21 02:40:02.711294+02 |
| Severity | info=169966 · warning=1013 |
| Typer | oversattning=146190 · trafik=23535 · sakerhet=1140 · akm2_snapshot=101 · blogg_utkast=9 · medlem=3 · blogg_publicerad=1 |
| jsonb-prov (details->>'dag') | 23535 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-21T17:20:29.914Z
