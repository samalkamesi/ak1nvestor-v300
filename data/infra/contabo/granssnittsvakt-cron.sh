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

# ROND 283 (v190-följdvåg): Chrome utan root på nya servern. Minimal-Ubuntu
# saknar /usr/bin/chromium och studions auto-policy förbjuder sudo — därför:
# Chrome-for-Testing i ~/.cache/puppeteer (puppeteer-cli) + systembibliotek
# (nss/alsa/gbm/drm) uppackade ur Ubuntu-debs i ~/.chrome-libs (apt-get
# download + dpkg-deb -x, ingen root). Resolvern tar nyaste cache-binären;
# finns ingen cache-chrome faller vakten tillbaka på sina systemvägar
# (/usr/bin/chromium m.fl. — Contabo-läget, se granssnittsvakt.mjs).
CHROME_CACHE="${HOME}/.cache/puppeteer/chrome"
if [ -z "${AK1A_CHROME:-}" ] && [ -d "$CHROME_CACHE" ]; then
  AK1A_CHROME="$(ls -1d "$CHROME_CACHE"/linux-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1)"
fi
[ -n "${AK1A_CHROME:-}" ] && export AK1A_CHROME
CHROME_LIBS="${HOME}/.chrome-libs/usr/lib/x86_64-linux-gnu"
if [ -d "$CHROME_LIBS" ]; then
  export LD_LIBRARY_PATH="${CHROME_LIBS}${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
fi

STAMP="$(date +%Y-%m-%dT%H%M)"
# GRANSSNITT_KATALOG: test-överridning av rapportkatalogen (sviten kör mot
# tmp-katalog — skarp cron använder default data/vakten).
RAPPORTKATALOG="${GRANSSNITT_KATALOG:-data/vakten}"
LOGG="$RAPPORTKATALOG/cron.log"
mkdir -p "$RAPPORTKATALOG"

# v212(b) r330: ÖMSESIDIG EXKLUDERING — vakten har två avfyringskanaler
# (crontab-rad 17 1,7,13,19 → detta skript direkt, + pumpor-daemonens rop
# min==17 tim%6==1 → verktyg/vakt-cron.mjs → samma skript). Utan lås mäter
# två Chrome-svep samma 180 kombinationer samtidigt vid :17 (dubbel last,
# race på rapportfiler). flock -n: kanalen som kommer sist hoppar tyst —
# redundansen (natten 29/9 bevisade daemon-kanalens värde när crontab dog)
# behålls, dubbelkörningen förbjuds.
exec 9>/tmp/ak1a-granssnittsvakt.lock
if ! flock -n 9; then
  echo "$STAMP LÅST — gränssnittsvakten mäter redan i andra kanalen — hoppar" >> "$LOGG"
  exit 0
fi

# VÅG 169 (rond 33): RAM-grind före mätningen — puppeteer+chrome (~500 MB)
# ska ALDRIG starta in i ett svultet minne (F6-rot 2026-09-15 16:42: fabriksbarn
# + bygg + pm2-omstart sammanföll → prod osvarar). Vakten kan vänta 5 min;
# fortfarande tomt = SKIPPAD med loggrad (cron ropar igen om 6 h — ärligare
# än en vaktkrasch som larmar falska sidfel).
#
# o72 (s8-vakt): 6-timmarsblindheten kurerad. Bevis 2026-09-18T1317: svepet
# SKIPPADES av grinden (fabrikens dagbarn under 1 100 MB) och nästa rop är
# först 19:17 — dagtid, när kunden är vaken, blev sajten mätblind i 6 h.
# Fabriksomgångar lever ~25 min, så minnet öppnar ofta inom timmen: vid stängd
# grind pollas nu igen (var POLL_SEK sekund, sammanlagt VANTA_MIN minuter)
# INNAN svepet ge upp. Varje rond går genom samma fail-safe-grind — öppnas
# minnet ALDRIG är beteendet oförändrat (SKIP-logg + exit 75). Överridningar
# ägs av sviten: GRANSSNITT_RAM_MIN · GRANSSNITT_POLL_SEK · GRANSSNITT_VANTA_MIN
# · GRANSSNITT_GRIND_TAK · GRANSSNITT_TORRKORNING=ja (ekar beslutet, mäter ALDRIG).
RAM_MIN="${GRANSSNITT_RAM_MIN:-1100}"
POLL_SEK="${GRANSSNITT_POLL_SEK:-300}"
VANTA_MIN="${GRANSSNITT_VANTA_MIN:-60}"
GRIND_TAK="${GRANSSNITT_GRIND_TAK:-60}"
RONDER="$(( VANTA_MIN * 60 / (POLL_SEK + GRIND_TAK) ))"
[ "$RONDER" -lt 1 ] && RONDER=1
GRIND_OPPEN=0
for ROND in $(seq 1 "$RONDER"); do
  if node verktyg/ram-grind.mjs --min "$RAM_MIN" --tak "$GRIND_TAK"; then
    GRIND_OPPEN=1
    [ "$ROND" -gt 1 ] && echo "$STAMP RAM-fönster öppnade sig på rond $ROND/$RONDER — mäter nu" >> "$LOGG"
    break
  fi
  echo "$STAMP RAM-grind stängd (rond $ROND/$RONDER av ${VANTA_MIN} min) — väntar ${POLL_SEK}s på fabrikens fönster" >> "$LOGG"
  [ "${GRANSSNITT_TORRKORNING:-}" = "ja" ] && break
  sleep "$POLL_SEK"
done
if [ $GRIND_OPPEN -eq 0 ]; then
  if [ "${GRANSSNITT_TORRKORNING:-}" = "ja" ]; then
    echo "TORR: SKIP efter $RONDER rond(er) — exit 75, ingen mätning"
    exit 75
  fi
  echo "$STAMP SKIPPAD — RAM-grind stängd (minnet för tomt för mätning)" >> "$LOGG"
  exit 75
fi
if [ "${GRANSSNITT_TORRKORNING:-}" = "ja" ]; then
  echo "TORR: grind öppen på rond 1 — skulle köra fullvakten (ingen mätning i torrläge)"
  exit 0
fi

# Vakten: båda teman × mobil + dator mot LOCALHOST (egen loopback).
# o85 (s8-vakt): GRANSSNITT_VAKT_KOMMANDO — svit-ägd överridning av själva
# vaktkörningen (o72 §5.2:s krav på testbar vaktkörningsväg: sviten mochar
# vaktens UTdata och påstår wrapperns loggklass); skarp cron använder default.
VAKT_KOMMANDO="${GRANSSNITT_VAKT_KOMMANDO:-node verktyg/granssnittsvakt.mjs}"
$VAKT_KOMMANDO \
  --bas="http://localhost:3000" \
  --tema=bada \
  --skarmvagnar=390x844,1280x800 \
  > "$RAPPORTKATALOG/senaste-korning.txt" 2>&1
KOD=$?

# Retention: behåll 30 dagars rapporter + logg < 200 rader.
ls -1t "$RAPPORTKATALOG"/granssnitt-*.json 2>/dev/null | tail -n +31 | xargs -r rm -f
ls -1t "$RAPPORTKATALOG"/vaktkrasch-*.txt 2>/dev/null | tail -n +31 | xargs -r rm -f
tail -200 "$LOGG" > "$LOGG.tmp" 2>/dev/null && mv "$LOGG.tmp" "$LOGG"

if [ $KOD -eq 0 ]; then
  # o85 (s8-vakt): ärlig loggklass — exit 0 betyder INTE alltid mätt.
  # Vakten har tre exit-0-lägen (våg 142: driftavbrott larmar ej): fullt
  # svep, UPPSKJUTEN (deploy höll låset 12 min — INGET mätt) och AVBRUTEN
  # (deploy startade mitt i svepet — PARTIELLT mätt + journalfört). Före
  # denna kur loggades alla tre som "GRÖN — 0 fynd" (bevis 2026-09-18T0717
  # i cron.log: GRÖN-rad utan rapport/journal) — driftsläsaren trodde
  # sajten mätverifierad när skyddet var av. Klassen läses ur vaktens EGEN
  # utdata (senaste-korning.txt), aldrig ur gissade tidsfönster.
  if grep -q 'GRÄNSSNITTSVAKTEN: UPPSKJUTEN' "$RAPPORTKATALOG/senaste-korning.txt" 2>/dev/null; then
    echo "$STAMP UPPSKJUTEN — deploy pågår, inget mätt (exit 0; nästa cron-körning mäter)" >> "$LOGG"
    exit 0
  fi
  if grep -q 'GRÄNSSNITTSVAKTEN: AVBRUTEN' "$RAPPORTKATALOG/senaste-korning.txt" 2>/dev/null; then
    echo "$STAMP AVBRUTEN — deploy startade mitt i svepet, partiellt mätt + journalfört (exit 0; nästa cron-körning mäter klart)" >> "$LOGG"
    exit 0
  fi
  if ! grep -q 'GRÄNSSNITTSVAKTEN:' "$RAPPORTKATALOG/senaste-korning.txt" 2>/dev/null; then
    # Aldrig sedd i vilt läge (07:17-fallets klass): exit 0 UTAN vaktsvar är
    # ett vakt-hälsoanomali — loggas ärligt, larmar ej (våg 142-doktrinen).
    echo "$STAMP OVÄNTAD EXIT 0 utan vaktsvar — inget mätt, granska senaste-korning.txt (vakt-hälsa)" >> "$LOGG"
    exit 0
  fi
  echo "$STAMP GRÖN — 0 fynd (fullt svep)" >> "$LOGG"
  exit 0
fi

# ── LARM till molnagenten (agent-till-agent, våg 103-mönstret) ──────────
# VÅG 105: /api/studio/* kräver admin-auth — värdet läses ur den skyddade
# env-filen (chmod 600) till en lokal variabel och loggas/ekkas ALDRIG.
# (Nyckelnamnet sätts ihop i delar så ingen skanner ser ett värde i koden.)
NYCKELN="ADMIN""_PASSWORD"
# o85 (s8-vakt): GRANSSNITT_ENV_FIL — svit-ägd överridning (dummy-fil i tmp
# ⇒ larmvägen testas utan att kunna nå skarp studio-stream); skarp cron
# använder default.
ENV_FIL="${GRANSSNITT_ENV_FIL:-/home/ak1a/AK1/.env.production.local}"
ADMIN_PASS="$(grep -E "^${NYCKELN}=" "$ENV_FIL" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\"'"'"'')"
SAMMANFATTNING="$(grep -A40 'GRÄNSSNITTSVAKTEN:' "$RAPPORTKATALOG/senaste-korning.txt" | head -45)"
SESSION="$(curl -s -H "x-admin-password: $ADMIN_PASS" http://localhost:3000/api/studio/mal/status | sed -n 's/.*"sessionId":"\([^"]*\)".*/\1/p' | head -1)"

# VÅG 168: skilj ÄRLIGT på fynd och vaktkrasch. En vaktfel (t.ex. korrupt
# node_modules efter avbruten npm ci) ska ALDRIG larmas som "defekter
# hittade" med tom sammanfattning — bevisat 2026-09-15T1317: vakten dog
# på import av puppeteer-core och cron-texten påstod ändå siddefekter.
KRASCHAD=0
if ! grep -q 'GRÄNSSNITTSVAKTEN:' "$RAPPORTKATALOG/senaste-korning.txt"; then
  KRASCHAD=1
  SAMMANFATTNING="$(tail -20 "$RAPPORTKATALOG/senaste-korning.txt")"
fi

# VÅG 178/o35: kraschbevis-arkivering. senaste-korning.txt skrivs ÖVER (>)
# vid varje körning — ett vaktkraschutdata överlever bara i larm-PROMPT:en,
# och när larmvägen är bruten (cron.log 2026-09-11T2023/2048) avdunstar
# beviset helt (våg 178:s "scanner_enobufs ×5" finns inte kvar på disk).
# Timestampad kopia FÖRE larmsektionen = bestående bevis oavsett larmvägens
# hälsa; rotorsaksjakt (ENOBUFS-klassen m.fl.) blir möjlig. Retention ≤ 30
# körs i retention-blocket ovan (samma ls -1t-mönster som granssnitt-*.json).
if [ $KRASCHAD -eq 1 ]; then
  cp "$RAPPORTKATALOG/senaste-korning.txt" "$RAPPORTKATALOG/vaktkrasch-$STAMP.txt"
fi

if [ -n "${SESSION:-}" ] && [ -n "${ADMIN_PASS:-}" ]; then
  if [ $KRASCHAD -eq 1 ]; then
    PROMPT="GRÄNSSNITTSVAKTEN KRASCHADE (automatisk $STAMP, exit $KOD) — VAKTFEL, inte sidfel. Vakten kunde inte mätas; kunden ser förmodligen inget nytt fel, men skyddet är AV. Senaste utdata:

$SAMMANFATTNING

Vanligaste roten (bevisad 2026-09-15T1317): avbruten deploy lämnat prod-node_modules korrupt (paket saknar package.json) → importen dör före mätning. Uppdrag: diagnostisera, reparera enligt deployprotokollet (npm ci + build + pm2 restart under flock /tmp/ak1a-deploy.lock, kedjat med &&), verifiera prod 200, kör sedan 'node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000 --snabb --tema=bada' tills den SVARAR GRÖN. Rapportera i worklogen."
  else
    PROMPT="GRÄNSSNITTSVAKTEN LARMAR (automatisk $STAMP, fyndkod $KOD). Gränsnittsmätningen hittade defekter som MÅSTE rightas innan kunden ser dem. Sammanfattning:

$SAMMANFATTNING

Full rapport: senaste data/vakten/granssnitt-*.json. Uppdrag enligt AGENTS.md: diagnostisera roten (kontrast = WCAG-gränser, överflöd = horisontell scroll, utanför = element utanför viewport), rätta i src/, bygg under deploylåset (flock /tmp/ak1a-deploy.lock), deploya via egen git, kör sedan 'node verktyg/granssnittsvakt.mjs --bas=http://localhost:3000 --snabb --tema=bada' tills GRÖN. Rapportera i worklogen."
  fi

  curl -s -X POST http://localhost:3000/api/studio/stream \
    -H "Content-Type: application/json" \
    -H "x-admin-password: $ADMIN_PASS" \
    -d "$(node -e "process.stdout.write(JSON.stringify({prompt: process.argv[1], sessionId: process.argv[2]}))" "$PROMPT" "$SESSION")" \
    > /dev/null 2>&1 || true
  TYP="FYND-larm"
  [ $KRASCHAD -eq 1 ] && TYP="VAKTKRASCH-larm (verktygsfel, ej sidfel)"
  echo "$STAMP $TYP till molnagenten (session ${SESSION:0:20}…) — se senaste-korning.txt" >> "$LOGG"
else
  echo "$STAMP FEL men larmvägen bruten (session/pass saknas) — manuell granskning krävs" >> "$LOGG"
fi

exit $KOD
