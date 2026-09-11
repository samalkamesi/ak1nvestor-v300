---
name: drift-ops
description: AK1A:s driftsystem — backup, DR-prov i skrap-postgres, ISR-varmaren kl 03:10, cron-kvalitetsvakten 07:00 UTC, DRIFTSBOKEN, pm2-återstart och felsökning av prod. Använd vid driftproblem, prod nere, långsam ISR, backup/återställning, OOM. Nyckelord: drift, backup, DR, återställning, varmaren, cron, pm2, server, prod nere.
---

# Drift-ops — servern är datorn

Prod = Contabo 5.189.162.162: Next.js (pm2 `ak1a`, port 3000) + zcode
app-server + nginx + Let's Encrypt. All kunskap protokollförs i
**`data/DRIFTSBOKEN.md`** — läs den först vid driftfall.

## Prod nere — ordning

1. `pm2 ls` — är `ak1a` online? `pm2 restart ak1a --update-env` om ej.
2. `pm2 logs ak1a --lines 50` — leta OOM/undantag.
3. `curl -s -o /dev/null -w "%{http_code}" https://lab.ak1nvestor.com/`
4. Byggtrasig commit? → `leverera-kod`-färdighetens revert-stoppregel.
5. Dokumentera händelsen + lösningen i DRIFTSBOKEN.

## Cron-systemen (server-ops)

- **ISR-varmaren** kl 03:10 vardagar: `data/infra/contabo/ak1a-varm.sh`
  värmer ~65 vägar via localhost (kapar förstagångssvansen 0,5–3,6 s).
  Testkörning: 12/44 ok — sökvägslistan finslipas successivt.
- **Kvalitetsvakten** 07:00 UTC: `/api/cron/kvalitet` skriver
  `data/rapporter/kvalitetsrapport-SENASTE.md`.

## Backup + DR-prov

- Backupper: `verktyg/backup-server-filer.mjs` (serverfiler) och
  `verktyg/backup-fran-molnen.mjs`; databasdumpar enligt DRIFTSBOKEN.
- **DR-prov** (godkänt mall 2026-09-11): återställ gårdagens dump i
  skrap-postgres → jämför tabell-/radräkningsmot produktion → dokumentera
  återställningstid i DRIFTSBOKEN. Referens: 20 s · 60 tabeller ·
  1 187 291 rader. Lokal PG17 är installerad och stoppad:
  start `sudo pg_ctlcluster 17 main start`, stop … `stop`.
- Supabase-GRANT-fel (768 st vid provet) är kända och ofarliga.

## Serverresurser

Server-OOM är ett känt läge (våg 85): undvik tunga parallella byggen,
övervaka minne vid stora importer. `tool-results/` och `data/cache/` är
rörliga — cache städas vid deploy, committa ALDRIG cache.

## Verifiering efter driftåtgärd

KVD kontroll 4 (prod 200) + deep-länkar + pm2 online + notis i
DRIFTSBOKEN (datum, symptom, åtgärd, utfall).
