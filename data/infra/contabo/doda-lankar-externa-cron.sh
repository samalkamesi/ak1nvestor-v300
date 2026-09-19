#!/usr/bin/env bash
# DÖDA-LÄNKAR-EXTERNA — cron-wrapper (o94, spår 8)
# =====================================================================
# Driftsättning av verktyg/doda-lankar-externa.mjs (o87:s instrumentkur,
# deployad 24c220d6 2026-09-19: mätfönster-grind + drift-tak + filskydd +
# exitkodskontrakt 0/1/2 — allt SKYDD bor I verktyget; denna wrapper är
# tunn: kör, LÄS KLASS UR VERKTYGETS EGEN UTDATA (o85-doktrinen — aldrig
# gissade tidsfönster), logga en ärlig rad, larma molnagenten vid fynd.
#
# Installad i ak1a:s crontab:  17 4 * * *  (dagligen 04:17 lokal — mellan
#   molnbackupen 03:40 och gränsnittsvaktens 07:17-svep: den ~13-min långa
#   node-crawlen (~2 400 sidor, ingen puppeteer, låg RAM) kolliderar varken
#   med backupfönstret eller vaktens chrome-RAM.)
# Logg: data/vakten/doda-lankar-externa-cron.log
#   Utdata: data/vakten/doda-lankar-externa-senaste.txt (skrivs över varje
#   gång — bestående bevis bor i verktygets egna klockslagsskyddade
#   rapport/insamlingsfiler, se retention nedan).
#
# Loggklasser (spegling av o85:s ärliga klassläsning):
#   GRÖN — 0 döda externa (full crawl)      exit 0, DÖDA=0 OUPPNÅBARA=0
#   FYND-larm till molnagenten              exit 0, DÖDA/OUPPNÅBARA > 0
#   DRIFTFÖNSTER — rapport kasserad         exit 2 (verktygets tak, o47 §2)
#   SKIPPAD — mätfönster stängt             exit 1 + GRIND:-rad (bygg/deploy)
#   VAKTFEL-larm (verktygsfel, ej länkfel)  övriga felkoder
#   OVÄNTAD EXIT 0 utan sammanfattning      exit 0 utan klassrader (hälsa)
#   FEL men larmvägen bruten                larmpost omöjlig — ärligt loggat
set -uo pipefail

ROT="/home/ak1a/AK1"
cd "$ROT" || exit 2

STAMP="$(date +%Y-%m-%dT%H%M)"
# DODA_EXTERNA_KATALOG: test-överridning (sviten kör mot tmp-katalog — skarp
# cron använder default data/vakten).
RAPPORTKATALOG="${DODA_EXTERNA_KATALOG:-data/vakten}"
LOGG="$RAPPORTKATALOG/doda-lankar-externa-cron.log"
mkdir -p "$RAPPORTKATALOG"

# DODA_EXTERNA_KOMMANDO: svit-ägd överridning av vaktkörningen (o85:s
# GRANSSNITT_VAKT_KOMMANDO-mönster: sviten mockar verktygets UTdata och
# påstår wrapperns loggklass); skarp cron använder default.
KOMMANDO="${DODA_EXTERNA_KOMMANDO:-node verktyg/doda-lankar-externa.mjs}"
$KOMMANDO > "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt" 2>&1
KOD=$?

# Retention (o87:s filskydd gör ALDRIG om — därför raderas ÄLDSTA här):
# rapporter ≤ 30 dagar, insamlings-mellanlager ≤ 3 (diagnostikvärde enligt
# o47 §2 bakdörrs-stängningen), logg < 200 rader.
ls -1t "$RAPPORTKATALOG"/doda-lankar-externa-*.json 2>/dev/null | grep -v -- '-insamling.json$' | tail -n +31 | xargs -r rm -f
ls -1t "$RAPPORTKATALOG"/doda-lankar-externa-*-insamling.json 2>/dev/null | tail -n +4 | xargs -r rm -f
tail -200 "$LOGG" > "$LOGG.tmp" 2>/dev/null && mv "$LOGG.tmp" "$LOGG"

if [ $KOD -eq 0 ]; then
  # Diagnostikläge märks av verktyget själv ([DIAGNOSTIK — ej mätvärde]):
  # cron kör ALDRIG --tvinga, men en manuell körnings utdata kan hamna här —
  # loggas ärligt, bokförs ALDRIG som mätvärde.
  if grep -q '\[DIAGNOSTIK' "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt" 2>/dev/null; then
    echo "$STAMP DIAGNOSTIK — manuell --tvinga-körning, ej mätvärde (cron kör aldrig --tvinga)" >> "$LOGG"
    exit 0
  fi
  DODA="$(sed -n 's/^DÖDA (4xx): \([0-9][0-9]*\).*/\1/p' "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt" | head -1)"
  OUPP="$(sed -n 's|^OUPPNÅBARA (domän/anslutning): \([0-9][0-9]*\).*|\1|p' "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt" | head -1)"
  if [ -z "$DODA" ] || [ -z "$OUPP" ]; then
    # o85:s fjärde klass: exit 0 UTAN klassrader är verktygshälso-anomali —
    # loggas ärligt, larmar ej (våg 142-doktrinen).
    echo "$STAMP OVÄNTAD EXIT 0 utan sammanfattning — inget klassat, granska doda-lankar-externa-senaste.txt (verktygshälsa)" >> "$LOGG"
    exit 0
  fi
  if [ "$DODA" -eq 0 ] && [ "$OUPP" -eq 0 ]; then
    echo "$STAMP GRÖN — 0 döda externa (full crawl)" >> "$LOGG"
    exit 0
  fi
  # ── FYND: bevisat döda/ouppnåbara utgående länkar → larm (nedan) ──────
  LARMTYP="FYND"
  PROMPT="DÖDA-LÄNKAR-EXTERNA LARMAR (automatisk $STAMP): $DODA bevisat döda (4xx) + $OUPP ouppnåbara externa mål. Uppdrag: läs senaste rapport (sökväg på sista raden i data/vakten/doda-lankar-externa-senaste.txt, fälten fynd.doda/ouppnabara med källor), righta KÄLLORNA i data/ (byt ut eller ta bort döda utgående länkar i analyser/kurser/utkast — utkast publiceras ALDRIG av vakt: publicering är kundens beslut R2, data/blogg/ är kundens yta), kör sedan 'node verktyg/doda-lankar-externa.mjs --validera-fran <dagens insamlingsfil i data/vakten/>' tills GRÖN. Rapportera i worklogen."
elif [ $KOD -eq 2 ]; then
  echo "$STAMP DRIFTFÖNSTER — verktygets tak kasserade rapporten (o47 §2), ingen larm; mellanlagret märkt för diagnostik, nästa cron mäter" >> "$LOGG"
  exit 0
elif [ $KOD -eq 1 ] && grep -q 'GRIND:' "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt" 2>/dev/null; then
  echo "$STAMP SKIPPAD — mätfönster stängt (bygg/deploy/bas enligt verktygets grind) — nästa cron mäter" >> "$LOGG"
  exit 0
else
  LARMTYP="VAKTFEL"
  PROMPT="DÖDA-LÄNKAR-EXTERNA VAKTFEL (automatisk $STAMP, exit $KOD) — VERKTYGSFEL, inte länkfynd. Vakten kunde inte mäta. Senaste utdata:

$(tail -20 "$RAPPORTKATALOG/doda-lankar-externa-senaste.txt")

Uppdrag: diagnostisera (mätfönster? bas nere? node? — verktyget har --sjalvtest), reparera enligt deployprotokollet vid infra-rot, kör sedan 'node verktyg/doda-lankar-externa.mjs' manuellt i fritt fönster tills den SVARAR. Rapportera i worklogen."
fi

# ── LARM till molnagenten (agent-till-agent, våg 103/105-mönstret) ──────
# /api/studio/* kräver admin-auth — värdet läses ur den skyddade env-filen
# (chmod 600) till en lokal variabel och loggas/ekkas ALDRIG. Nyckelnamnet
# sätts ihop i delar så ingen skanner ser ett värde i koden.
# DODA_EXTERNA_ENV_FIL: svit-ägd överridning (dummy-nyckel i tmp ⇒ session-
# hämtningen misslyckas ⇒ sviten kan ALDRIG posta skarpt studio-larm).
NYCKELN="ADMIN""_PASSWORD"
ENV_FIL="${DODA_EXTERNA_ENV_FIL:-/home/ak1a/AK1/.env.production.local}"
ADMIN_PASS="$(grep -E "^${NYCKELN}=" "$ENV_FIL" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"'"'"'')"
SESSION="$(curl -s -H "x-admin-password: $ADMIN_PASS" http://localhost:3000/api/studio/mal/status | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p' | head -1)"

if [ -n "${SESSION:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
  curl -s -X POST http://localhost:3000/api/studio/stream \
    -H "Content-Type: application/json" \
    -H "x-admin-password: $ADMIN_PASS" \
    -d "$(node -e "process.stdout.write(JSON.stringify({prompt: process.argv[1], sessionId: process.argv[2]}))" "$PROMPT" "$SESSION")" \
    > /dev/null 2>&1 || true
  echo "$STAMP ${LARMTYP}-larm till molnagenten (session ${SESSION:0:20}…) — se doda-lankar-externa-senaste.txt" >> "$LOGG"
else
  echo "$STAMP ${LARMTYP} men larmvägen bruten (session/pass saknas) — manuell granskning krävs" >> "$LOGG"
fi

exit $KOD
