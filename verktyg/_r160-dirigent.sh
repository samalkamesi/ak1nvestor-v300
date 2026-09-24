#!/bin/bash
# _r160-dirigent.sh — sekvensgenerator för deploy-kuren:
#   fas 1: vänta ut fabrikens barn (ren prod-yta + RAM-fönster)
#   fas 2: pusha arbetsytans commits (med emottagningsmerge)
#   fas 3: bygg med ENOTEMPTY-kuren (wrappern äger flock + pm2-restart)
#   fas 4: verifiera sidor + sitemap + P2-bevis
#   fas 5: färsk kvalitetsvaktkörning
# Skriver löpande /tmp/r160-dirigent-status.txt — läs tillbaka den.
STATUS=/tmp/r160-dirigent-status.txt
LOGG=/tmp/r160-dirigent.log
WS=/home/ak1a/agent/ak1
PROD=/home/ak1a/AK1
: > "$STATUS"
echo "START $(date -Is)" >> "$STATUS"

# ── Fas 1: fönstret (max 75 min) ──
for i in $(seq 1 75); do
  BARN=$(ps -eo args | grep 'zcode -p' | grep -c 'fabriksagent')
  if [ "${BARN:-1}" -eq 0 ]; then
    DIRTY=$(git -C "$PROD" status --porcelain | wc -l)
    RAM=$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo)
    if [ "$DIRTY" -eq 0 ] && [ "$RAM" -ge 2500 ]; then
      echo "FONSTER-OPPET $(date -Is) (ram=${RAM}MB)" >> "$STATUS"
      break
    fi
  fi
  sleep 60
done
if ! grep -q 'FONSTER-OPPET' "$STATUS"; then
  echo "TIMEOUT-utan-fonster $(date -Is)" >> "$STATUS"
  exit 1
fi

# ── Fas 2: push (emotta ev. sista barn-commits först) ──
git -C "$WS" fetch prod develop >> "$LOGG" 2>&1
git -C "$WS" merge prod/develop -m "merge: dirigent-emottag före deploy (v160 P2 + s2-barn)" >> "$LOGG" 2>&1
if git -C "$WS" push prod develop >> "$LOGG" 2>&1; then
  echo "PUSH-GRON $(date -Is) $(git -C "$WS" rev-parse --short HEAD)" >> "$STATUS"
else
  echo "PUSH-FEL $(date -Is)" >> "$STATUS"
  exit 1
fi

# ── Fas 3: bygget med kuren ──
bash "$WS/verktyg/_r160-byggwrapper.sh"
if grep -q '^KLAR' /tmp/r160-bygg-status.txt; then
  echo "BYGG-KLAR $(date -Is)" >> "$STATUS"
else
  echo "BYGG-FEL $(date -Is) $(tail -3 /tmp/r160-build.log | tr '\n' ' ')" >> "$STATUS"
  exit 1
fi

# ── Fas 4: verifiering ──
sleep 20
for url in / /fas2 /fas3 /medlemskap /prenumeration /cookiepolicy /logga-in /topplista /bibliotek; do
  KOD=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3000$url")
  echo "VERIF $url -> $KOD" >> "$STATUS"
done
curl -s http://localhost:3000/sitemap.xml | grep -q '/fas2' \
  && echo "VERIF sitemap /fas2: JA" >> "$STATUS" \
  || echo "VERIF sitemap /fas2: NEJ" >> "$STATUS"
curl -s http://localhost:3000/medlemskap | grep -q 'AK1A Research Lab' \
  && echo "VERIF medlemskap-eyebrow (P2): JA" >> "$STATUS" \
  || echo "VERIF medlemskap-eyebrow (P2): NEJ" >> "$STATUS"
curl -s http://localhost:3000/cookiepolicy | grep -q 'font-serif text-4xl font-bold">Cookiepolicy' \
  && echo "VERIF cookiepolicy-4xl (P2): JA" >> "$STATUS" \
  || echo "VERIF cookiepolicy-4xl (P2): NEJ" >> "$STATUS"

# ── Fas 5: färsk kvalitetsvakt ──
( cd "$PROD" && node verktyg/kvalitetsvakt.mjs ) >> "$LOGG" 2>&1
grep -E 'ANTAL FEL' "$PROD/data/rapporter/kvalitetsrapport-SENASTE.md" | tail -1 >> "$STATUS" || true
echo "SLUT $(date -Is)" >> "$STATUS"
