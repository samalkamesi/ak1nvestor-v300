#!/bin/bash
# ============================================================
# AK1A Status - quick health check for the live site
# Usage: bash scripts/status.sh
# ============================================================
echo "============================================"
echo "  AK1A Site Status  ($(date '+%Y-%m-%d %H:%M:%S'))"
echo "============================================"

# Dev server
if pgrep -f "next dev -p 3000" >/dev/null 2>&1; then
    PID=$(pgrep -f "next dev -p 3000" | head -1)
    echo "✓ Dev server: RUNNING (PID $PID)"
else
    echo "✗ Dev server: DOWN"
fi

# HTTP
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 http://localhost:3000/ 2>/dev/null)
if [ "$HTTP" = "200" ]; then
    echo "✓ HTTP check:  200 OK"
else
    echo "✗ HTTP check:  $HTTP (FAIL)"
fi

# Watchdog daemon
if pgrep -f "watchdog-daemon" >/dev/null 2>&1; then
    DPID=$(pgrep -f "watchdog-daemon" | head -1)
    echo "✓ Watchdog:    RUNNING (PID $DPID, 60s interval)"
else
    echo "✗ Watchdog:    STOPPED (auto-restart disabled!)"
fi

# Memory
MEM_AVAIL=$(free | awk '/Mem:/ {printf "%d", ($7/$2)*100}')
MEM_FREE=$(free -h | awk '/Mem:/ {print $4}')
echo "ℹ Memory:     ${MEM_AVAIL}% available ($MEM_FREE free)"

# Recent watchdog actions (last 5 restart events)
RESTARTS=$(grep -c "RESTART NEEDED" /home/z/my-project/watchdog.log 2>/dev/null || echo 0)
SUCCESS=$(grep -c "restart SUCCESS" /home/z/my-project/watchdog.log 2>/dev/null || echo 0)
echo "ℹ Restarts:   $RESTARTS triggered, $SUCCESS recovered"

# Uptime estimate (last successful start)
LAST_OK=$(grep "restart SUCCESS\|all healthy" /home/z/my-project/watchdog.log 2>/dev/null | tail -1 | grep -o '^\[[^]]*\]')
echo "ℹ Last check: ${LAST_OK:-(none logged yet)}"

echo "============================================"
if [ "$HTTP" = "200" ] && pgrep -f "watchdog-daemon" >/dev/null 2>&1; then
    echo "  STATUS: LIVE & MONITORED (20/7 capable)"
else
    echo "  STATUS: NEEDS ATTENTION"
fi
echo "============================================"
