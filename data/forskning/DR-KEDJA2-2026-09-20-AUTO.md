# DR-KEDJA 2 2026-09-20 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-20.json.gz ·
DDL-källa: db-2026-09-20.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 34.2 s (totalt fönster 34.3 s) |
| COPY rader | 168696 |
| Verktygsdom | GRÖN (exit 0) |
| Rader i PG (oberoende) | 168696 |
| Unika id | 168696 |
| Tidsfönster | 2026-09-03 22:43:12.603298+02 … 2026-09-20 02:38:45.830845+02 |
| Severity | info=167765 · warning=931 |
| Typer | oversattning=146190 · trafik=21361 · sakerhet=1031 · akm2_snapshot=101 · blogg_utkast=9 · medlem=3 · blogg_publicerad=1 |
| jsonb-prov (details->>'dag') | 21361 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-20T17:25:05.679Z
