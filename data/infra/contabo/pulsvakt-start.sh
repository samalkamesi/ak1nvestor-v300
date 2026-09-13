#!/usr/bin/env bash
# ============================================================================
# PULSVAKTEN — aktivering (våg 122A, styrelsens beslut mtzou25g åtgärd 1)
# ============================================================================
# Detta är instruktioner för HUVUDAGENTEN (eller kunden vid Termius) — själva
# pulsvakten (verktyg/pulsvakt.mjs) är en evig loop avsedd som EGEN pm2-
# process. Den kompletterar ak1a-pumpor (våg 113): pumporna schemalägger
# agentens arbeten, pulsvakten mäter SAJTENS puls och startar om appen.
#
# FÖRUTSÄTTNING: verktyg/pulsvakt.mjs finns i PROD-trädet (/home/ak1a/AK1)
# via deploy (push prod develop + ev. ombygge krävs EJ — ren node-fil).
#
# ── AKTIVERA (en gång) ──────────────────────────────────────────────────────
#   cd /home/ak1a/AK1
#   pm2 start verktyg/pulsvakt.mjs --name pulsvakt
#   pm2 save
#
# ── KONTROLL EFTERÅT ────────────────────────────────────────────────────────
#   pm2 ls                                   # pulsvakt = online (status online, ↺ lågt)
#   cat data/vakten/pulsvakt-status.json     # senasteKoll uppdateras var 60:e s, lever: true
#   pm2 logs pulsvakt --lines 20 --nostream  # startraden + ev. larm
#
# ── STOPPA / TA BORT ────────────────────────────────────────────────────────
#   pm2 stop pulsvakt        # pausa (processen ligger kvar, skriver ingen status)
#   pm2 delete pulsvakt && pm2 save   # ta bort permanent
#
# ── UPPGRADERA (efter ny deploy av pulsvakt.mjs) ────────────────────────────
#   cd /home/ak1a/AK1 && git pull --ff-only   # eller: huvudagentens deploy
#   pm2 restart pulsvakt
#   cat data/vakten/pulsvakt-status.json      # verifiera lever: true + färsk senasteKoll
#
# ── VAD DEN GÖR (minne) ─────────────────────────────────────────────────────
#   var 60 s: GET / + /api/sok?q=akm2 via loopback (Host lab.ak1nvestor.com)
#             fel → pm2 restart ak1a --update-env (max 1/min, max 10 utan OK,
#             3 fel i rad → högprio-larm; därefter vakten klarar sig själv)
#   var 10:e varv: GET https://lab.ak1nvestor.com/ — fel → högprio-larm
#             (nginx/cert kan EJ auto-omstartas — sudo är kundens domän)
#   Larm: data/vakten/pulsvakt-larm.log (JSON-rader, max 5000)
#   Status: data/vakten/pulsvakt-status.json (varje varv)
#
#   OBS (våg 122A): styrelse-ronden läser ännu ENDAST data/vakten/senaste-
#   korning.txt — pulsvaktens larmfil syns inte automatiskt i ronden. Koppling
#   (rond-läsning av pulsvakt-status/larm ELLER studio-kick vid hogprio) är
#   huvudagentens beslut — rund-skriptet ägs av annan agent.
# ============================================================================
echo "Instruktionsfil — körs inte (se kommentarerna ovanför)."
echo "Aktivering: cd /home/ak1a/AK1 && pm2 start verktyg/pulsvakt.mjs --name pulsvakt && pm2 save"
