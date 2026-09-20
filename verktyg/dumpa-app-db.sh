#!/bin/bash
# dumpa-app-db.sh — nattlig dump av APPENS Supabase-projekt (aufr) — DUBBELPROJEKT-kuran
# (spår 10, s10-u3, 2026-09-20; rot: DR-OVNING-2026-09-19-DUBBELPROJEKT §7.1,
#  blockerat upplöst av KEDJA-0-bevisen: lösenordet läses VID KÖRNING ur
#  .env.production.local — .pgpass rörs ALDRIG).
#
# Kontrakt speglar rkaq-raden (crontab 02:30) med tre skillnader:
#   1. MÅLET härleds ur .env:s NEXT_PUBLIC_SUPABASE_URL (appens projekt),
#      lösenordet ur .env.production.local:s DATABASE_URL — bevisat 2026-09-19
#      gäller samma lösenord båda projekten. Värdet förs ENBART som
#      PGPASSWORD-miljövariabel till pg_dump — aldrig argv, aldrig loggat.
#   2. Dumpen skrivs till <namn>.part och flyttas in i kedjan FÖRST när
#      pg_dump|gzip-pipelinen lyckats — ett trunkerat blad kan aldrig ligga
#      i kedjan och tas för en backup.
#   3. Slutmarkörkontroll (verktyg/kolla-dump-markorer.mjs --fil: \restrict/
#      \unrestrict-token + "dump complete") körs FÖRE retentionen — en RÖD
#      dump stoppar raden (exit 1) och raderar inga gamla blad.
#
# Cron (rad 6): 50 2 * * * /bin/bash /home/ak1a/AK1/verktyg/dumpa-app-db.sh >> /tmp/supabase-appdump.log 2>&1
# Tidsläget 02:50: rkaq 02:30 · moln-JSON 02:40 · app 02:50 (~2,5 min) · ISR 03:10.
# Manuell körning: bash verktyg/dumpa-app-db.sh (cron-paritet: absoluta sökvägar,
# ingen beroenden på användarens PATH/env). Datum beräknas INTE i crontab-raden —
# procenttecken-problematiken finns inte här.
#
# Exit: 0 GRÖN (dumpad + markörgrön + retention kördd) · 1 misslyckande (loggat).

set -euo pipefail

REPO=/home/ak1a/AK1
KATALOG="$REPO/data/backups/supabase"
PG_DUMP=/usr/lib/postgresql/17/bin/pg_dump
NODE=/usr/bin/node
LOGG_TID() { date '+%Y-%m-%dT%H:%M:%S%z'; }

cd "$REPO"

# --- Driftskydd: aldrig två instanser (manuell + cron) på samma blad ---------
LAS=/tmp/ak1a-appdump.lock
exec 9>"$LAS"
if ! flock -n 9; then
  echo "$(LOGG_TID) HOPPAR OVER: en annan dumpa-app-db.sh-instans har laset ($LAS)."
  exit 0
fi

# --- Behörighet + mål (vardet loggas ALDRIG) ----------------------------------
LASSEN=$($NODE -e '
const fs = require("fs");
const prod = fs.readFileSync(".env.production.local", "utf8").split("\n").find(l => l.startsWith("DATABASE_URL="));
if (!prod) process.exit(3);
const u = new URL(prod.slice("DATABASE_URL=".length).trim());
const pass = decodeURIComponent(u.password || "");
if (!pass) process.exit(5);
const app = fs.readFileSync(".env", "utf8").split("\n").find(l => l.startsWith("NEXT_PUBLIC_SUPABASE_URL="));
if (!app) process.exit(4);
const ref = new URL(app.slice("NEXT_PUBLIC_SUPABASE_URL=".length).trim()).hostname.split(".")[0];
process.stdout.write("db." + ref + ".supabase.co\t" + pass);
') || { KOD=$?; echo "$(LOGG_TID) FEL: las behorighet/mal (node exit $KOD - .env.production.local/.env lasbar?)"; exit 1; }
MAL="${LASSEN%%$'\t'*}"
LOSEN="${LASSEN#*$'\t'}"
unset LASSEN

STAMPEL=$(date '+%Y-%m-%d')
NAMN="db-app-$STAMPEL.sql.gz"
DEL="$KATALOG/$NAMN.part"
MALFIL="$KATALOG/$NAMN"

mkdir -p "$KATALOG"

echo "$(LOGG_TID) APP-DUMP start: mal=$MAL db=postgres (aufr) → $NAMN"

# --- Dump → .part → mv in i kedjan forst vid pipeline-success -----------------
START=$SECONDS
if ! PGPASSWORD="$LOSEN" "$PG_DUMP" "host=$MAL port=5432 dbname=postgres user=postgres sslmode=require" \
    2>>/tmp/supabase-appdump.err.log | gzip > "$DEL"; then
  rm -f "$DEL"
  echo "$(LOGG_TID) FEL: pg_dump-pipelinen misslyckades — .part raderad, kedjan orord (se /tmp/supabase-appdump.err.log)."
  exit 1
fi
unset LOSEN
chmod 664 "$DEL"
mv -f "$DEL" "$MALFIL"
TID=$((SECONDS - START))
STORLEK=$(stat -c %s "$MALFIL")
echo "$(LOGG_TID) APP-DUMP klar: $NAMN $STORLEK byte på ${TID} s"

# --- Slutmarkorkontroll FORE retention (RÖD dump = stopp, inga raderingar) ---
if ! "$NODE" "$REPO/verktyg/kolla-dump-markorer.mjs" --fil "$MALFIL"; then
  echo "$(LOGG_TID) FEL: slutmarkorkontrollen ROD for $NAMN — bladet lämnas kvar för analys, retention SKIPPAD."
  exit 1
fi

# --- 30-dagars retention (endast app-kedjans egna blad) ------------------------
RADERADE=$(find "$KATALOG" -name 'db-app-*.sql.gz' -mtime +30 -print -delete | wc -l)
echo "$(LOGG_TID) APP-DUMP GRON: markor verifierad · retention körd ($RADERADE blad över 30 dygn raderade)."
exit 0
