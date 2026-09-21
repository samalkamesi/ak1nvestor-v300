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
/usr/bin/node verktyg/_s7u3o151-natt-tbt.mjs >> data/forskning/OPTIMERING/lighthouse/o151-natt-cron.log 2>&1
