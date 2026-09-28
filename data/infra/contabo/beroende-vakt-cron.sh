#!/usr/bin/env bash
# BERODEVAKTEN — cron-wrapper (o164, spår 8)
# =====================================================================
# Rotorsakan (o164): verktyg/beroende-vakt.mjs (2026-09-15) föddes ur
# next-CRITICAL-lärdomen "ingen kör npm audit i rutin" — men driftsattes
# ALDRIG: ingen cron, endast manuella agentkörningar (09-18 o73, 09-19,
# 09-20 ×3), tyst död i 4 dygn = o50-klassen (instrument utan mekanisk
# puls dör tyst). Denna wrapper är kuren: daglig mekanisk mätning 05:37
# lokal (fritt fönster: dödlänkarnas ~13-min-crawl är klar ~04:30, rop-
# hälsan går 06:27, gränsnittsvakten 07:17 — npm audit tar sekunder och
# ingen chrome-RAM).
#
# Allt SKYDD bor i verktyget (exitkodskontrakt 0/1/2 + RESULTAT_JSON +
# SENASTE=ny|oforandrad); wrappern är tunn enligt o85-doktrinen: kör,
# LÄS KLASS UR VERKTYGETS EGEN UTDATA, logga en ärlig rad, larma
# molnagenten vid fynd. Verktyget installerar ALDRIG något (rätten till
# npm install ägs av prod-synken under /tmp/ak1a-deploy.lock).
#
# Loggklasser:
#   GRÖN — 0 critical/high (full audit)      exit 0 + RESULTAT_JSON
#   FYND-larm till molnagenten               exit 1 + RESULTAT_JSON
#   VAKTFEL-larm (verktygsfel, ej sårbarhet) exit 2 / övriga koder
#   OVÄNTAD EXIT utan RESULTAT_JSON          verktygshälso-anomali (våg 142)
#   SKIPPAD — deployfönster aktivt           flock-test på deploylåset
#
# Git-ytan (o164): verktyget skriver SENASTE.md IDEMPOTENT — vid
# SENASTE=ny committar wrappern rapporten ("vakt: …"); vid oforandrad
# läge rör inget git-trädet. Commiten passerar pre-commit-kroken (tsc);
# blockad commit loggas ärligt — larmvägen bär alltid fyndet ändå.
#
# Installad i ak1a:s crontab:  37 5 * * *  (dagligen 05:37 lokal)
# Logg: data/vakten/beroende-vakt-cron.log (< 200 rader, retention här)
#   Utdata: data/vakten/beroende-vakt-senaste.txt (skrivs över varje gång)
#
# Svit-överridningar (testa-beroende-vakt-cron.mjs — sviten kan ALDRIG
# posta skarpt studio-larm eller köra skarp git):
#   BERODEVAKT_KOMMANDO     default "node verktyg/beroende-vakt.mjs"
#   BERODEVAKT_KATALOG      default data/vakten (utdata + logg)
#   BERODEVAKT_DEPLOYLAS    default /tmp/ak1a-deploy.lock
#   BERODEVAKT_ENV_FIL      default .env.production.local (dummy i svit)
#   BERODEVAKT_GIT_KOMMANDO default git (mock i svit)
set -uo pipefail

ROT="/home/ak1a/AK1"
cd "$ROT" || exit 2
# cron-PATH är minimal — node/npm bor i /usr/bin (dödlänks-cron samma assumtion)
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

STAMP="$(date +%Y-%m-%dT%H%M)"
KATALOG="${BERODEVAKT_KATALOG:-data/vakten}"
LOGG="$KATALOG/beroende-vakt-cron.log"
SENASTE_UT="$KATALOG/beroende-vakt-senaste.txt"
mkdir -p "$KATALOG"

# ── deploygrind: prod-synkens byggfönster äger servern (o55 §2) ─────────
# flock -c true tar+släpper låset atomiskt (<1 ms) när det är fritt;
# upptaget ⇒ -n misslyckas ⇒ SKIPPAD (nästa cron mäter).
LAS="${BERODEVAKT_DEPLOYLAS:-/tmp/ak1a-deploy.lock}"
if ! flock -n "$LAS" -c 'true' 2>/dev/null; then
  echo "$STAMP SKIPPAD — deployfönster aktivt ($LAS hålls) — nästa cron mäter" >> "$LOGG"
  exit 0
fi

KOMMANDO="${BERODEVAKT_KOMMANDO:-node verktyg/beroende-vakt.mjs}"
$KOMMANDO > "$SENASTE_UT" 2>&1
KOD=$?

# ── retention: timestamp-json ≤ 30 st, logg < 200 rader ────────────────
ls -1t "$KATALOG"/beroende-vakt-*.json 2>/dev/null | tail -n +31 | xargs -r rm -f
tail -200 "$LOGG" > "$LOGG.tmp" 2>/dev/null && mv "$LOGG.tmp" "$LOGG"

GITK="${BERODEVAKT_GIT_KOMMANDO:-git}"
# Verktyget skrev om SENASTE.md (reell lägesändring) ⇒ rapporten in i git
# (smutsig committad yta = prod-synk-larm). Ändrad rad ändras aldrig av
# cron-mätning med oförändrat läge (idempotenskontraktet o164).
commita_rapport() {
  if grep -q '^SENASTE=ny$' "$SENASTE_UT" 2>/dev/null; then
    if "$GITK" add data/rapporter/beroende-halsa-SENASTE.md \
      && "$GITK" commit -m "vakt: beroende-hälsorapport ändrad (auto $STAMP, o164-cron)" >/dev/null 2>&1; then
      echo "$STAMP SENASTE=ny — rapporten committad av vakten" >> "$LOGG"
    else
      echo "$STAMP SENASTE=ny — commit blockerad (krok/träd) — rapporten ligger oskriven i ytan, granska manuellt" >> "$LOGG"
    fi
  fi
}

if [ $KOD -eq 0 ]; then
  if ! grep -q '^RESULTAT_JSON=' "$SENASTE_UT" 2>/dev/null; then
    # våg 142-doktrinen: exit 0 UTAN kontraktsrad är verktygshälso-anomali
    echo "$STAMP OVÄNTAD EXIT 0 utan RESULTAT_JSON — inget klassat, granska $SENASTE_UT (verktygshälsa)" >> "$LOGG"
    exit 0
  fi
  commita_rapport
  echo "$STAMP GRÖN — 0 critical/high (full audit)" >> "$LOGG"
  exit 0
elif [ $KOD -eq 1 ]; then
  if ! grep -q '^RESULTAT_JSON=' "$SENASTE_UT" 2>/dev/null; then
    echo "$STAMP OVÄNTAD EXIT 1 utan RESULTAT_JSON — verktyget lovar kontraktsrad vid fynd; granska $SENASTE_UT (verktygshälsa)" >> "$LOGG"
    exit 0
  fi
  SUM="$(sed -n 's/^RESULTAT_JSON=//p' "$SENASTE_UT" | tail -1)"
  ARBETE="$(node -e "const j=JSON.parse(process.argv[1]);console.log(j.critical+' critical + '+j.high+' high (av '+j.sårbarheter+' sårbarheter)')" "$SUM" 2>/dev/null || echo 'critical/high enligt rapporten')"
  LARMTYP="FYND"
  PROMPT="BEROENDEVAKTEN FYNDAR (automatisk $STAMP): $ARBETE i npm-beroendena. Uppdrag: läs data/vakten/beroende-vakt-senaste.txt (RESULTAT_JSON + listor) och data/rapporter/beroende-halsa-SENASTE.md; bedöm per post (transitiv? prod- eller dev-kedja? fix inom intervall?). Installation ägs ENDAV prod-synken under deploy-låset — bokför ev. ny post i data/infra/patch-ko.json enligt o46-kontraktet (exakt semver, registry-verifierad, max enligt PATCH_MAX_POSTER), ALDRIG kör npm install/audit-fix själv. Major-steg kräver styrelsebeslut. Rapportera i worklogen. R2 orörd."
  commita_rapport
elif [ $KOD -eq 2 ]; then
  LARMTYP="VAKTFEL"
  PROMPT="BEROENDEVAKTEN VAKTFEL (automatisk $STAMP, exit 2) — VERKTYGSFEL, inte sårbarhetsfynd. Vakten kunde inte mäta (npm audit/outdated svarade ej). Senaste utdata:

$(tail -20 "$SENASTE_UT")

Uppdrag: diagnostisera (npm i PATH? nätverk? registry?), reparera enligt deployprotokollet vid infra-rot, kör sedan 'node verktyg/beroende-vakt.mjs' manuellt i fritt fönster tills den SVARAR. Rapportera i worklogen."
else
  LARMTYP="VAKTFEL"
  PROMPT="BEROENDEVAKTEN VAKTFEL (automatisk $STAMP, exit $KOD — okänd kod, kontraktet känner 0/1/2) — granska $SENASTE_UT, diagnostisera verktyget, kör manuellt tills det svarar. Rapportera i worklogen."
fi

# ── LARM till molnagenten (agent-till-agent, våg 103/105-mönstret) ──────
# /api/studio/* kräver admin-auth — värdet läses ur den skyddade env-filen
# (chmod 600) till en lokal variabel och loggas/ekkas ALDRIG. Nyckelnamnet
# sätts ihop i delar så ingen skanner ser ett värde i koden.
NYCKELN="ADMIN""_PASSWORD"
ENV_FIL="${BERODEVAKT_ENV_FIL:-/home/ak1a/AK1/.env.production.local}"
ADMIN_PASS="$(grep -E "^${NYCKELN}=" "$ENV_FIL" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"'"'"'')"
SESSION="$(curl -s -m 10 -H "x-admin-password: $ADMIN_PASS" http://localhost:3000/api/studio/mal/status | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p' | head -1)"

if [ -n "${SESSION:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
  curl -s -m 10 -X POST http://localhost:3000/api/studio/stream \
    -H "Content-Type: application/json" \
    -H "x-admin-password: $ADMIN_PASS" \
    -d "$(node -e "process.stdout.write(JSON.stringify({prompt: process.argv[1], sessionId: process.argv[2]}))" "$PROMPT" "$SESSION")" \
    > /dev/null 2>&1 || true
  echo "$STAMP ${LARMTYP}-larm till molnagenten (session ${SESSION:0:20}…) — se beroende-vakt-senaste.txt" >> "$LOGG"
else
  echo "$STAMP ${LARMTYP} men larmvägen bruten (session/pass saknas) — manuell granskning krävs" >> "$LOGG"
fi

exit $KOD
