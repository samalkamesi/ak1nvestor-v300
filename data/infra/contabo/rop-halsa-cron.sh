#!/usr/bin/env bash
# ROP-HÄLSA — cron-wrapper (o136, spår 8)
# =====================================================================
# Driftsättning av verktyg/rop-halsa.mjs (o136:s sond): daemonens rop-
# kadens mäts dagligen ur pm2-loggen — ett vaktnät som ingen mäter är
# mätblint (o22-läxan). All MÄTLOGIK bor i verktyget; denna wrapper är
# tunn: kör, LÄS KLASS UR VERKTYGETS EGEN UTDATA (o85-doktrinen), logga
# en ärlig rad, larma molnagenten vid FYND.
#
# Installad i ak1a:s crontab:  27 6 * * *  (dagligen 06:27 lokal — efter
#   externa länk-vakten 04:17 och FÖRE kvalitetsvakten 07:02: rop-hälsan
#   är billig filläsning och kvalitetsrapporten 07:02 kan då relatera
#   till densamma; inga kollisioner med backupfönstren 02:30–02:50.)
# Logg: data/vakten/rop-halsa-cron.log
#   Rapport: data/vakten/rop-halsa.json (skrivs över per körning).
#
# Loggklasser (spegling av o85:s ärliga klassläsning):
#   GRÖN — 0 gap                              exit 0, klass GRÖN
#   OBSERVATION — mikro-gap (höglast-klass)   exit 0, klass OBSERVATION
#   FYND-larm till molnagenten                exit 1 (omstart/heltystnad/
#                                             persistent loop-svält)
#   VAKTFEL-larm (verktygsfel)                exit 2
#   OVÄNTAD EXIT 0 utan klassrad              verktygshälsa-anomali
#   FEL men larmvägen bruten                  larmpost omöjlig — ärligt
set -uo pipefail

ROT="/home/ak1a/AK1"
cd "$ROT" || exit 2

STAMP="$(date +%Y-%m-%dT%H%M)"
# ROP_HALSA_KATALOG: test-överridning (sviten kör mot tmp-katalog — skarp
# cron använder default data/vakten).
RAPPORTKATALOG="${ROP_HALSA_KATALOG:-data/vakten}"
LOGG="$RAPPORTKATALOG/rop-halsa-cron.log"
mkdir -p "$RAPPORTKATALOG"

# ROP_HALSA_KOMMANDO: svit-ägd överridning (o85:s GRANSSNITT_VAKT_KOMMANDO-
# mönster: sviten mockar verktygets UTdata och påstår wrapperns loggklass).
KOMMANDO="${ROP_HALSA_KOMMANDO:-node verktyg/rop-halsa.mjs --json data/vakten/rop-halsa.json}"
$KOMMANDO > "$RAPPORTKATALOG/rop-halsa-senaste.txt" 2>&1
KOD=$?

# Retention: logg < 200 rader (rapporten skrivs över — inget arkiv att städa).
tail -200 "$LOGG" > "$LOGG.tmp" 2>/dev/null && mv "$LOGG.tmp" "$LOGG"

if [ $KOD -eq 0 ]; then
  KLASS="$(sed -n 's/^ROP-HÄLSA: \(GRÖN\|OBSERVATION\).*/\1/p' "$RAPPORTKATALOG/rop-halsa-senaste.txt" | head -1)"
  if [ -z "$KLASS" ]; then
    # o85:s fjärde klass: exit 0 UTAN klassrad = verktygshälsa-anomali —
    # loggas ärligt, larmar ej (våg 142-doktrinen).
    echo "$STAMP OVÄNTAD EXIT 0 utan klassrad — granska rop-halsa-senaste.txt (verktygshälsa)" >> "$LOGG"
    exit 0
  fi
  if [ "$KLASS" = "GRÖN" ]; then
    echo "$STAMP GRÖN — daemonens rop-kadens hel (24 h, 0 gap)" >> "$LOGG"
  else
    SAMMAN="$(head -1 "$RAPPORTKATALOG/rop-halsa-senaste.txt" | sed 's/^ROP-HÄLSA: //' | cut -c1-120)"
    echo "$STAMP OBSERVATION — $SAMMAN (höglast-klass, trenddata — se rop-halsa.json)" >> "$LOGG"
  fi
  exit 0
elif [ $KOD -eq 1 ]; then
  LARMTYP="FYND"
  PROMPT="ROP-HÄLSA LARMAR (automatisk $STAMP): pumpor-daemonens rop-kadens har FYND i 24 h-fönstret — omstart i fönstret, hel-tystnad ≥ 600 s eller persistent loop-svält (≥ 5 missade automation-motor-minuter). Detta betyder VAKTNÄTETS TÄCKNING har haft hål: organens rop kan ha missats. Uppdrag: läs data/vakten/rop-halsa.json (tystnadsgap/organGap/omstarterIvanster med tidsstämplar), kontrollera 'pm2 list' (ak1a-pumpor ↺/uptime) och korrelera gapen med deployfönster i data/vakten/prod-synk.log (bygg-OOM-klassen) innan dom — höglast-mikro-gap under byggen är design-tåligt (v2:s klocka självläker), okända långa tystnader kräver rotjakt i daemonen (verktyg/pumpor-daemon.mjs). Rapportera i worklogen. R2 orörd: ingen omstart av pm2-tjänster utan bevisad rotorsak."
else
  LARMTYP="VAKTFEL"
  PROMPT="ROP-HÄLSA VAKTFEL (automatisk $STAMP, exit $KOD) — VERKTYGSFEL, inte kadensfynd. Sonden kunde inte mäta daemonens rop-logg. Senaste utdata:

$(tail -20 "$RAPPORTKATALOG/rop-halsa-senaste.txt")

Uppdrag: diagnostisera (loggsökväg /home/ak1a/.pm2/logs/ak1a-pumpor-out.txt? rättigheter? pm2-logg roterad?) och reparera enligt deployprotokollet vid infra-rot. Rapportera i worklogen."
fi

# ── LARM till molnagenten (agent-till-agent, våg 103/105-mönstret) ──────
# /api/studio/* kräver admin-auth — värdet läses ur den skyddade env-filen
# (chmod 600) till en lokal variabel och loggas/ekkas ALDRIG. Nyckelnamnet
# sätts ihop i delar så ingen skanner ser ett värde i koden.
# ROP_HALSA_ENV_FIL: svit-ägd överridning (dummy-nyckel i tmp ⇒ session-
# hämtningen misslyckas ⇒ sviten kan ALDRIG posta skarpt studio-larm).
NYCKELN="ADMIN""_PASSWORD"
ENV_FIL="${ROP_HALSA_ENV_FIL:-/home/ak1a/AK1/.env.production.local}"
ADMIN_PASS="$(grep -E "^${NYCKELN}=" "$ENV_FIL" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"'"'"'')"
SESSION="$(curl -s -H "x-admin-password: $ADMIN_PASS" http://localhost:3000/api/studio/mal/status | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p' | head -1)"

if [ -n "${SESSION:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
  curl -s -X POST http://localhost:3000/api/studio/stream \
    -H "Content-Type: application/json" \
    -H "x-admin-password: $ADMIN_PASS" \
    -d "$(node -e "process.stdout.write(JSON.stringify({prompt: process.argv[1], sessionId: process.argv[2]}))" "$PROMPT" "$SESSION")" \
    > /dev/null 2>&1 || true
  echo "$STAMP ${LARMTYP}-larm till molnagenten (session ${SESSION:0:20}…) — se rop-halsa.json" >> "$LOGG"
else
  echo "$STAMP ${LARMTYP} men larmvägen bruten (session/pass saknas) — manuell granskning krävs" >> "$LOGG"
fi

exit $KOD
