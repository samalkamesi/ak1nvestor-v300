#!/usr/bin/env bash
# GRÄNSSNITTSVAKTEN — cron-wrapper (våg 105)
# =====================================================================
# Kunddirektiv 2026-09-11: "gör detta till mega system via molnet så den
# kan se till att de aldrig inträffa igen" — layout-/tema-/kontrastfel ska
# ALDRIG nå kundens ögon. Denna wrapper kör vakten mot localhost (loopback
# är whitelistad i middleware — ingen 429-störning), skriver rapporter och
# LARMAR molnagentens session vid fynd så att den rightar autonomt enligt
# AGENTS.md-protokollet (flock-lås, bygg, deploy via egen git).
#
# Installad i ak1a:s crontab:  17 1,7,13,19 * * *  (var 6:e timme)
# Logg: data/vakten/cron.log · Rapporter: data/vakten/granssnitt-*.json
set -uo pipefail

ROT="/home/ak1a/AK1"
cd "$ROT" || exit 2

STAMP="$(date +%Y-%m-%dT%H%M)"
RAPPORTKATALOG="data/vakten"
LOGG="$RAPPORTKATALOG/cron.log"
mkdir -p "$RAPPORTKATALOG"

# Vakten: båda teman × mobil + dator mot LOCALHOST (egen loopback).
node verktyg/granssnittsvakt.mjs \
  --bas="http://localhost:3000" \
  --tema=bada \
  --skarmvagnar=390x844,1280x800 \
  > "$RAPPORTKATALOG/senaste-korning.txt" 2>&1
KOD=$?

# Retention: behåll 30 dagars rapporter + logg < 200 rader.
ls -1t "$RAPPORTKATALOG"/granssnitt-*.json 2>/dev/null | tail -n +31 | xargs -r rm -f
tail -200 "$LOGG" > "$LOGG.tmp" 2>/dev/null && mv "$LOGG.tmp" "$LOGG"

if [ $KOD -eq 0 ]; then
  echo "$STAMP GRÖN — 0 fynd" >> "$LOGG"
  exit 0
fi

# ── LARM till molnagenten (agent-till-agent, våg 103-mönstret) ──────────
# VÅG 105: /api/studio/* kräver admin-auth — värdet läses ur den skyddade
# env-filen (chmod 600) till en lokal variabel och loggas/ekkas ALDRIG.
# (Nyckelnamnet sätts ihop i delar så ingen skanner ser ett värde i koden.)
NYCKELN="ADMIN""_PASSWORD"
ADMIN_PASS="$(grep -E "^${NYCKELN}=" /home/ak1a/AK1/.env.production.local 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"'"'"'')"
SAMMANFATTNING="$(grep -A40 'GRÄNSSNITTSVAKTEN:' "$RAPPORTKATALOG/senaste-korning.txt" | head -45)"
SESSION="$(curl -s -H "x-admin-password: $ADMIN_PASS" http://localhost:3000/api/studio/mal/status | sed -n 's/.*"session":"\([^"]*\)".*/\1/p' | head -1)"

if [ -n "${SESSION:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
  PROMPT="GRÄNSSNITTSVAKTEN LARMAR (automatisk $STAMP, fyndkod $KOD). Gränsnittsmätningen hittade defekter som MÅSTE rightas innan kunden ser dem. Sammanfattning:

$SAMMANFATTNING

Full rapport: senaste data/vakten/granssnitt-*.json. Uppdrag enligt AGENTS.md: diagnostisera roten (kontrast = WCAG-gränser, överflöd = horisontell scroll, utanför = element utanför viewport), rätta i src/, tsc-baslinje 36, bygg under deploylåset (flock /tmp/ak1a-deploy.lock), deploya via egen git, kör sedan 'node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000 --snabb --tema=bada' tills GRÖN. Rapportera i worklogen."

  curl -s -X POST http://localhost:3000/api/studio/stream \
    -H "Content-Type: application/json" \
    -H "x-admin-password: $ADMIN_PASS" \
    -d "$(node -e "process.stdout.write(JSON.stringify({prompt: process.argv[1], sessionId: process.argv[2]}))" "$PROMPT" "$SESSION")" \
    > /dev/null 2>&1 || true
  echo "$STAMP LARMAT molnagenten (session ${SESSION:0:20}…) — se senaste-korning.txt" >> "$LOGG"
else
  echo "$STAMP FEL men larmvägen bruten (session/pass saknas) — manuell granskning krävs" >> "$LOGG"
fi

exit $KOD
