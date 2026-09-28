#!/bin/bash
# AK1A — o151 natt-TBT-mätarens cron-ropare (Spår 7, s7-u3)
# Körs 03:2x lokal — EFTER ISR-varmaren (03:10) så sidorna är ISR-varma,
# och i det tystaste lastfönstret dygnet har (metrologiregeln o143 §3:
# TBT jämförbar endast inom samma lastfönster — nattbasen o139-fore
# mättes 06:03Z).  Utdata: dom-o151-natt.json i lighthouse-katalogen;
# bokföring av levande våg (o144 §10 — bakgrundsprocess bokför ALDRIG).
cd /home/ak1a/AK1 || exit 1
# Hoppa över om deploy/bygg pågår (flock-låset + npm-processer = byggfönster)
if [ -e /tmp/ak1a-deploy.lock ] && fuser /tmp/ak1a-deploy.lock >/dev/null 2>&1; then
  echo "$(date -u +%FT%TZ) HOPPAR ÖVER: deployfönster aktivt" >> data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log
  exit 0
fi
# r304 (CHROME_PATH-fundet o557/o558): nya servern saknar /usr/bin/google-chrome —
# Lighthouse/chrome-launcher behöver CHROME_PATH till puppeteer-cachens
# Chrome-for-Testing. Samma upptäckt som gränssnittsvakt-cronen (r283).
CHROME_CACHE="${HOME}/.cache/puppeteer/chrome"
if [ -z "${AK1A_CHROME:-}" ] && [ -d "$CHROME_CACHE" ]; then
  AK1A_CHROME="$(ls -1d "$CHROME_CACHE"/linux-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1)"
fi
if [ -n "${AK1A_CHROME:-}" ] && [ -x "$AK1A_CHROME" ]; then
  export CHROME_PATH="$AK1A_CHROME"
else
  echo "$(date -u +%FT%TZ) HOPPAR ÖVER: ingen Chrome hittad (varken AK1A_CHROME eller puppeteer-cache)" >> data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log
  exit 0
fi
/usr/bin/node verktyg/natt-tbt-matare.mjs >> data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log 2>&1
