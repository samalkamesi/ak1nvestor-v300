#!/usr/bin/env bash
# VÅG 98 F1 — ISR-uppvärmare för Contabo-servern (installerad som ~/ak1a-varm.sh,
# cron: 10 3 * * *). Runtime-cachelukring av populära vägar via localhost —
# INTE en byggändring (kunddirektivet "INGET förbygge" gäller byggtid/SSG).
# Loggar till /tmp/ak1a-varm.log.
SOKVAGAR=(
  / /kurser /dataset /blogg
  /en/ /en/kurser /en/dataset /ar/ /ar/kurser /ar/dataset
  /data/nyckeltalsguide /om-oss /prenumeration /logga-in
)
# Topp-blogg (senaste 10 ur sitemap) × 3 språk
while IFS= read -r slug; do
  SOKVAGAR+=("/blogg/$slug" "/en/blogg/$slug" "/ar/blogg/$slug")
done < <(curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "/blogg/[a-z0-9-]*" | sort -u | head -10)
ANTAL=0
for v in "${SOKVAGAR[@]}"; do
  kod=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://127.0.0.1:3000$v")
  [ "$kod" = "200" ] && ANTAL=$((ANTAL+1))
  sleep 1
done
echo "$(date +%FT%T) varmade $ANTAL/${#SOKVAGAR[@]} vagar" >> /tmp/ak1a-varm.log
