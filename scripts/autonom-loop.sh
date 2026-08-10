#!/bin/bash
# AK1A Research Lab — AI-organ autonom loop
#
# Detta skript körs var 6:e timme och låter AI-organen autonomt:
# 1. Analysera senaste kundaktivitet
# 2. Föreslå förbättringar av kundupplevelsen
# 3. Spara förslag i databasen
#
# Cron: 0 */6 * * * /home/z/my-project/scripts/autonom-loop.sh
#
# Fas-fördelning (roterar var 6:e timme):
#   00:00 — kundupplevelse
#   06:00 — branding
#   12:00 — marketing
#   18:00 — innehåll

cd /home/z/my-project

HOUR=$(date +%H)
case $HOUR in
  00|01|02) FOCUS="kundupplevelse" ;;
  06|07|08) FOCUS="branding" ;;
  12|13|14) FOCUS="marketing" ;;
  18|19|20) FOCUS="innehåll" ;;
  *) FOCUS="kundupplevelse" ;;
esac

echo "[$(date)] AI-organ autonom loop — focus: $FOCUS"

# Anropa autonom API
RESPONSE=$(curl -s -X POST http://localhost:3000/api/styrelse/autonom \
  -H "Content-Type: application/json" \
  -d "{\"focus\":\"$FOCUS\"}" \
  --max-time 90)

if [ $? -eq 0 ]; then
  echo "[$(date)] ✓ Autonom loop complete — response saved to SystemEvent"
  echo "$RESPONSE" | python3 -c "
import sys, json
try:
    d = json.loads(sys.stdin.read())
    print(f'  Focus: {d.get(\"focus\",\"?\")}')
    print(f'  Sessions: {d.get(\"dataSnapshot\",{}).get(\"totalSessions\",0)}')
    proposal = d.get('proposal', {})
    if proposal:
        print(f'  Organ: {proposal.get(\"organ\",\"?\")}')
        proposals = proposal.get('proposals', [])
        print(f'  Proposals: {len(proposals)}')
        for p in proposals[:3]:
            print(f'    - {p.get(\"title\",\"?\")[:80]}')
except Exception as e:
    print(f'  Parse error: {e}')
" 2>&1
else
  echo "[$(date)] ✗ Autonom loop failed"
fi

echo "[$(date)] Done."
