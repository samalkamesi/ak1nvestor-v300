#!/bin/bash
# _r160-byggwrapper.sh — kuration + bygge + omstart, HELT under deploylåset.
# Bakgrund: tre OOM-dödade byggen lämnade korrupta Turbopack-segment i .next;
# next build dör på ENOTEMPTY rmdir '.next/server/app/index.segments/!KGh1dnvkKQ'
# även på good-HEAD. Kur = ta bort segmentkatalogen (återbyggs av next build).
set -o pipefail
LOCK=/tmp/ak1a-deploy.lock
STATUS=/tmp/r160-bygg-status.txt
LOGG=/tmp/r160-build.log

exec 9>"$LOCK"
if ! flock -n 9; then echo "LOCK_UPPTAGT $(date -Is)" > "$STATUS"; exit 1; fi

echo "BYGGER $(date -Is)" > "$STATUS"
rm -rf '/home/ak1a/AK1/.next/server/app/index.segments' >> "$LOGG" 2>&1

cd /home/ak1a/AK1 || { echo "CD_FEL $(date -Is)" > "$STATUS"; exit 1; }
if npm run build >> "$LOGG" 2>&1; then
  pm2 restart ak1a >> "$LOGG" 2>&1
  echo "KLAR $(date -Is)" >> "$STATUS"
else
  echo "BYGGFEL $(date -Is)" >> "$STATUS"
  exit 1
fi
