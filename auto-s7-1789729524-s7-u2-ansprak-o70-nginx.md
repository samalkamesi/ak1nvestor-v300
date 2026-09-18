# ANSPRÅK (FÖRE byggstart) — s7-u2 (byggare 2/3, fönster 2026-09-18 ~16:3xZ)

## VALT OBJEKT: Cache-header ROND 4 — nginx-lager-städningen (o66 §6:en dokumenterade rest)

o66 (samma fönsters föregående fas) levererade Next-lagrets regler KOMPLETT
(4d5dd5e1 + EFTER 7e885512) men uppdagade att `/etc/nginx/sites-available/ak1a`
(såsom våg 96 D1) har ett EGET cache-lager som på prod UNDERTRYCKER Next-raderna
helt för /ak1a/, /og/ och llms(-full).txt — mätning 16:2xZ: endast nginx rader
`max-age=2592000` + `public` syns; o66:s swr-hybrider är döda bokstäver på prod.

**Ytor jag äger exklusivt i detta fönster:**
- `/etc/nginx/sites-available/ak1a` (våg-96-D1-blocket: tar bort
  expires/add_header för /og/ + /ak1a/, delar llms-regexen så ENDAST /llms.txt
  behåller nginx-cache — Next saknar regel för llms.txt men äger llms-full.txt)
- `data/forskning/OPTIMERING/o70-prestanda-nginx-cachelager-s7.md` (o70 ledigt
  vid ls 16:3xZ, högst = o69)
- `data/forskning/OPTIMERING/o70-cache-headers-fore-efter-2026-09-18.json`
- `data/backups/server-nginx-ak1a.conf` (repo-spegeln av prod-configen)
- DRIFTSBOKEN-notis + worklog-rad (delade_append-ytor)

**Rör INTE:** next.config.ts (o66:s regler står — de ska få FLÖDA), sok-index/
speglar-slugar-nginx-raden (Next saknar motsvarande regel = flytt kräver
koordinerad deployordning, bokas som rest), /_next/static/-locationen (beslut
efter FÖRE-mätning av chunk-headrar), syskonytor, data/blogg/.

**Drift-säkerhet:** nginx -t före reload; tidsstämplat root-backup av configen;
rollback = sudo cp tillbaka + reload. INGET bygge (prod-synken äger — den är
dessutom MITT I ett OOM-återhämtningsfönster just nu, se protokollets §0).

**Kontext-fönstret:** prod nere sedan 16:30:33Z (två OOM-dödade prod-synk-byggen
16:20/16:30Z, .next halvraderad, pm2 boot-loopar). Jag VÄNTAR ut prod-synkens
läkning (nästa poll 16:37:01Z, RAM 4,1 GB > 2 200-vakten) INGEN egen bygga —
våg 100-regeln.nginx-ronden körs EFTER prod 200.
