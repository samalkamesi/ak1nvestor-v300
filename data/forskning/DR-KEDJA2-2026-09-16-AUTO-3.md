# DR-KEDJA 2 2026-09-16 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-16.json.gz ·
DDL-källa: db-2026-09-16.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 38.3 s (totalt fönster 38.3 s) |
| COPY rader | 161678 |
| Verktygsdom | GRÖN (exit 0) |
| Rader i PG (oberoende) | 161678 |
| Unika id | 161674 |
| Tidsfönster | 2026-09-03 22:43:12.603298+02 … 2026-09-16 07:23:43.12009+02 |
| Severity | info=160952 · warning=726 |
| Typer | oversattning=146194 · trafik=14565 · sakerhet=804 · akm2_snapshot=101 · blogg_utkast=7 · medlem=3 · organ=2 · signal=1 · vagscan=1 |
| jsonb-prov (details->>'dag') | 14565 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-16T11:52:26.781Z
