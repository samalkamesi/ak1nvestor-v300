# DR-ARKIV-SERVER 2026-09-16 — kedja 3:s exportör server-side + veckocron (Spår 10, s10-u1)

**Objekt:** F8-kön ur DR-PROV-2026-09-16-KEDJA3.md ("cron för vecko-arkivering
server-side"): serverfils-arkivet (tar.gz + git bundle + konfigsnapshots) levde
på agent-manuella körningar sedan datorns hybrid-sync tystnade 2026-09-09 —
kedja 3:s RPO var "när en agent minns". Nu: verktyg + cron + bevisad körning.

**Kollisionshantering (fabrikskollision bevis nr 7):** uppdragstexten identisk
för tre syskon (manifestet auto-s10-1789557913539). Förstavallet dr-kedja3.mjs
(kedja 3-KOMMANDORADISERING, KEDJA3 §8) togs av ett syskon 11:33 SOM KÖRDE
den under flock — denna agent viks (s10-u5-precedenten; Write-läshindret
hejdade, 0 förlorat arbete) och valde F8-kön i stället: komplement, ej
overlapp — syskonets restore-kommando prover ARKIVEN, detta verktyg håller
dem FRISKA. Bokning + vike protokollförd i worklog 11:33–11:37Z.

## Leverans

1. **`verktyg/arkivera-server.mjs`** — exportören, helt server-side (ingen
   ssh-ström: 09-09:s korrupta-arkiv-risk elimineras i roten):
   - flock på /tmp/ak1a-dr-prov.lock (samma kontrakt som dr-kedja*) —
     arkivskapande och DR-övningar mutar varandra aldrig (RÖT-mot-färskt-
     arkiv-racet ur S10-U1 O3 strukturellt omöjligt).
   - RAM-/diskgrind (600 MB / 5 GB) + minisjälvtest (trunkerad gzip grips).
   - Tar med exkluderingskontraktet (node_modules/.next/.git/tool-results/
     data/cache/data/backups) + **verifiering FÖRE godkännande**: gzip -t,
     full listning, 0 exkluderingsbrott, spot-filer, 500 MB-vakt.
   - Bundle --all + git bundle verify (complete history).
   - Konfigsnapshots färskas: nginx (sudo cat), crontab -l (proveniens-
     header), pm2 jlist (JSON-validerad) — F8:s "7 dygn gamla" kurerat.
   - Atomiska namnbyten (*.del → slutgiltig ENDAST vid grön verifiering),
     idempotent omkörning, retention 60 dygn (endast server-repo/server-git;
     system-events-full = arkivhandlingar, röras ALDRIG).
2. **Cron rad 4** (söndag 03:20 lokal, >> /tmp/server-arkiv.log) +
   crontab.reference i samma ändring + **konfigvakten GRÖN 4/4**.
3. Kedja 3:s RPO: "agent-manuellt" → **≤ 7 dygn** (veckoexporten; kvartals-
   övningen dr-kedja3.mjs prover färskt underlag).

## Bevisad körning (2026-09-16 13:39–13:40 lokal, exit 0 ALLT GRÖNT)

| Moment | Mätetal |
|---|---|
| server-repo-2026-09-16.tar.gz | **144,4 MB · 8 893 poster · 675 src ts/tsx · 33,1 s** |
| server-git-2026-09-16.bundle | **151,2 MB · complete history · 24,2 s** |
| Konfigsnapshots | nginx 53 rader · crontab 3 aktiva rader · pm2 4 processer |
| Retention | 0 raderade (inget > 60 dygn — korrekt) |
| Totalt | 58 s |

Arkiven är FÄRSKARE än nattens (00:45): +457 poster / +9 src-filer =
förmiddagens kommitten med — omkörningen bevisar idempotensen.

## Driftfynd (F1) + kur: träd i rörelse

Första körningen misslyckades på `tar: .: file changed as we read it` —
levande agentträd ändras under tar-fönstret (~30 s). Hårt exit-0-krav hade
gjort veckoarkivet skört (ronder/pumpor skriver 24/7). KUR: exit 1 acceptas
ENDAST när samtliga felrader är "…as we read it"-noter; ström- och
kontraktsverifieringen är den äkta grinden (den grep varje arkiv), och exakt
historik ägs av bundlen. Annat fel = RÖT. Andra körningen fick INGA
rörelsenoter (lugnare fönster) — båda lägena bevisade.

## KVD & städning

- `node --check` GRÖN · inga src/-ändringar (tsc-oblidigatorisk ej aktuell;
  pre-commit-grindens typnoll gäller ändå vid commit) · INGA byggen.
- PG17: rördes aldrig — verifierad NERE före (11:27) och efter övningen
  ("städa lokal PG"-punkten: inget att städa, korrekt viloläge intakt).
- R2 orörd; data/backups korrekt gitignorerat; inga nyckelvärden lästa/
  loggade (nginx/crontab-snapshots innehåller inga hemligheter; crontab-
   referensens <DATABASE_URL>-mask är kvar).
- Syskonets dr-kedja3-fönster respekterades (deras flock 11:33–11:37; denna
  agents körningar efteråt).

## Kvar i spåret

- Jungfrunatten för cron rad 3 (02:40) + rad 4 (söndag 03:20 2026-09-20):
  bevisas första gången de själva kört (s10-u2 O2:s mönster).
- Datorns hybrid-sync (eskalering sedan 09-09) — oförändrad kundkö.

*Levererat av fabriksagent s10-u1 (auto-s10-1789557913539), 2026-09-16 11:25–11:52 UTC.*
