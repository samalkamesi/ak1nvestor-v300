#!/bin/bash
# ============================================================
# AK1A Watchdog Daemon
# ============================================================
# Runs forever, invoking watchdog.sh every 120 seconds.
# Fully detached (setsid + nohup) so it survives shell exits.
# Logs its own heartbeat to watchdog-daemon.log
# ============================================================

INTERVAL=60
PROJECT_DIR="/home/z/my-project"
DAEMON_LOG="$PROJECT_DIR/watchdog-daemon.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

echo "[$(ts)] watchdog daemon started (PID=$$, interval=${INTERVAL}s)" >> "$DAEMON_LOG"

while true; do
    # Run the watchdog check
    /bin/bash "$PROJECT_DIR/scripts/watchdog.sh" >> "$DAEMON_LOG" 2>&1
    echo "[$(ts)] --- daemon heartbeat, sleeping ${INTERVAL}s ---" >> "$DAEMON_LOG"
    sleep "$INTERVAL"
done
