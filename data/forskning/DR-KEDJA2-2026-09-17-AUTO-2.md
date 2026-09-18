# DR-KEDJA 2 2026-09-17 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-17.json.gz ·
DDL-källa: db-2026-09-17.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 29.0 s (totalt fönster 29.1 s) |
| COPY rader | 163039 |
| Verktygsdom | GRÖN (exit 0) |
| Rader i PG (oberoende) | 163039 |
| Unika id | 163039 |
| Tidsfönster | 2026-09-03 22:43:12.603298+02 … 2026-09-17 02:40:02.319573+02 |
| Severity | info=162296 · warning=743 |
| Typer | oversattning=146190 · trafik=15915 · sakerhet=823 · akm2_snapshot=101 · blogg_utkast=7 · medlem=3 |
| jsonb-prov (details->>'dag') | 15915 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-17T19:15:22.398Z
