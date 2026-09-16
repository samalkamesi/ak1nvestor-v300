# DR-KEDJA 2 2026-09-15 — system_events ur moln-JSON (AUTO)

Körd av `verktyg/dr-kedja2.mjs` (spår 10). Arkiv: system-events-full-2026-09-15.json.gz ·
DDL-källa: db-2026-09-16.sql.gz. Verktyg (u3:2): aterstall-system-events.mjs --db ak1a_dr_json.

| Moment | Resultat |
|---|---|
| RTO väggklocka | 27.1 s s (totalt fönster 27.2 s) |
| COPY rader | 160928 |
| Verktygsdom | GRÖN (exit 0) |
| Rader i PG (oberoende) | 160928 |
| Unika id | 160928 |
| Tidsfönster | 2026-09-03 22:43:12.603298+02 … 2026-09-16 00:40:02.217874+02 |
| Severity | info=160230 · warning=698 |
| Typer | oversattning=146190 · trafik=13824 · sakerhet=775 · akm2_snapshot=101 · organ=15 · blogg_utkast=7 · signal=7 · email_kö=3 · medlem=3 · vagvalidering=1 · styrelse_beslut=1 · vagscan=1 |
| jsonb-prov (details->>'dag') | 13824 |
| Städning | ak1a_dr_json raderad · PG17 stoppad/nere |

DDl-not: extensions.uuid_generate_v4() → gen_random_uuid() (moln-schema finnes ej lokalt; DEFAULT utan betydelse för COPY)

SLUT — maskinellt genererat av dr-kedja2.mjs 2026-09-15T22:50:54.779Z
