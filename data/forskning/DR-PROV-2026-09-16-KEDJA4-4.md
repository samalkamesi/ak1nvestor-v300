# DR-KEDJA 4 2026-09-16 — per-typ-snapshots (AUTO)

Körd av `verktyg/dr-kedja4.mjs` (spår 10). Källa: data/backups/<fil>-<datum>.json
(exportör: backup-fran-molnet.mjs — tio per-typ-vyor ur system_events).
Referensarkiv: system-events-full-2026-09-16.json.gz. Skrap-DB: ak1a_dr_pertyp (probe-tabell per_typ_probe).

| Moment | Resultat |
|---|---|
| Självtest (sabotage) | 4/4 PASS |
| Totalt fönster | 35.6 s |
| RTO COPY-fas | 0.14 s |
| Rader inlästa (summa per-typ) | 10 |
| Konsistens per-typ ⊆ full-arkiv | matchade 10 av 10 · saknade 0 |
| PG-verifiering (oberoende) | totalt 10 · jsonb 10 (varav medlem-epostHash 3) · fönster 2026-09-11 10:44:30.398277+02 … 2026-09-11 23:25:06.730062+02 · per typ: blogg_utkast=7 · medlem=3 |
| Städning | ak1a_dr_pertyp raderad · PG17 stoppad/nere |

Per-typ-tabell (senaste filen per typ; set-datum 2026-09-16):

| Fil | Fildatum | antal | Status |
|---|---|---|---|
| variabler | 2026-09-16 | 0 | GRÖN |
| variabel-andringar | 2026-09-16 | 0 | GRÖN |
| kurs-metadata | 2026-09-16 | 0 | GRÖN |
| kurs-metadata-andringar | 2026-09-16 | 0 | GRÖN |
| termbank-tillagg | 2026-09-16 | 0 | GRÖN |
| blogg-utkast | 2026-09-16 | 7 | GRÖN |
| blogg-publicerade | 2026-09-16 | 0 | GRÖN |
| media-filer | 2026-09-16 | 0 | GRÖN |
| medlemmar | 2026-09-16 | 3 | GRÖN |
| medlem-progress | 2026-09-16 | 0 | GRÖN |

Noteringar:
- Per-typ-filerna bär endast created_at+details (exportörens select) — full
  återställning av innehållet äger kedja 2 (full-arkivet); detta led bevisar
  att vyerna är INTAKTA, KONSISTENTA och INLÄSNINGSBARA.
- Tysta exportfel är diskreta: HTTP-fel i exportören skriver ingen fil —
  en typ utan fil för set-datumet flaggas ovan (VARNING).
- Arkivets radtal per per-typ-typ (ägtenhet-svaret på antal=0):
  medlem=3 · blogg_utkast=7

Avbrottsorsak: ingen

SLUT — maskinellt genererat av dr-kedja4.mjs 2026-09-16T18:44:26.916Z
