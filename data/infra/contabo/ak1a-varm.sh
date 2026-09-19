#!/usr/bin/env bash
# VÅG 98 F1 — ISR-uppvärmare för Contabo-servern (körs av pumpor-daemon kl 03:10
# mot repo-vägen). Runtime-cachelukring av populära vägar via localhost —
# INTE en byggändring (kunddirektivet "INGET förbygge" gäller byggtid/SSG).
# Loggar till /tmp/ak1a-varm.log.
# ROND 104-ROTKUR (studio, 2026-09-19): (1) sitemap-grepet levererar sluggar med
# REDAN /blogg/-prefix — gamla loopen prependede igen ⇒ /blogg//blogg/slug = 404,
# Alla 30 bloggvägar värmdes ALDRIG (loggen 12/44 = enbart statiska 200:or);
# (2) /en/ + /ar/ svarade 308 (trailing slash) ⇒ värms som /en + /ar (200);
# (3) ett nytt försök per väg — dipparna 12→11 var transienta timeout i
# nattbackupens fönster; (4) missade vägar loggas namngivet för diagnos.
SOKVAGAR=(
  / /kurser /dataset /blogg
  /en /en/kurser /en/dataset /ar /ar/kurser /ar/dataset
  /data/nyckeltalsguide /om-oss /prenumeration /logga-in
)
# Topp-blogg (senaste 10 ur sitemap) × 3 språk — $slug bär själv /blogg/-prefixet
while IFS= read -r slug; do
  SOKVAGAR+=("$slug" "/en$slug" "/ar$slug")
done < <(curl -s http://127.0.0.1:3000/sitemap.xml | grep -o "/blogg/[a-z0-9-]*" | sort -u | head -10)
ANTAL=0
MISSADE=()
for v in "${SOKVAGAR[@]}"; do
  kod=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://127.0.0.1:3000$v")
  if [ "$kod" != "200" ]; then
    kod=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://127.0.0.1:3000$v")
  fi
  if [ "$kod" = "200" ]; then ANTAL=$((ANTAL+1)); else MISSADE+=("$v=$kod"); fi
  sleep 1
done
echo "$(date +%FT%T) varmade $ANTAL/${#SOKVAGAR[@]} vagar" >> /tmp/ak1a-varm.log
if [ ${#MISSADE[@]} -gt 0 ]; then
  echo "$(date +%FT%T) missade: ${MISSADE[*]}" >> /tmp/ak1a-varm.log
fi
