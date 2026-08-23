#!/bin/bash
# ============================================================
# AK1A Watchdog - ensures the Next.js dev server stays live 20/7
# ============================================================
# Checks:
#   1. Is the bun/next process alive?
#   2. Does http://localhost:3000/ respond with HTTP 200?
#   3. Is memory pressure too high? (restart if so)
# Actions:
#   - If process dead OR HTTP fails OR memory critical -> restart server
#   - Logs every action to watchdog.log
# ============================================================

set -u

PROJECT_DIR="/home/z/my-project"
PORT=3000
HEALTH_URL="http://localhost:3000/"
LOG_FILE="$PROJECT_DIR/watchdog.log"
PID_FILE="$PROJECT_DIR/.dev.pid"
MAX_MEM_PCT=92   # if available memory drops below this %, restart to avoid OOM
DEV_LOG="$PROJECT_DIR/dev.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

log() {
    echo "[$(ts)] $*" >> "$LOG_FILE"
    echo "[$(ts)] $*"
}

# Rotate log if it gets too big (>5MB)
if [ -f "$LOG_FILE" ]; then
    SIZE=$(stat -c%s "$LOG_FILE" 2>/dev/null || echo 0)
    if [ "$SIZE" -gt 5242880 ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old"
        log "log rotated"
    fi
fi

log "=== watchdog tick ==="

# --- 1. Check HTTP health (10s timeout) ---
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null)
[ -z "$HTTP_CODE" ] && HTTP_CODE="000"

# --- 2. Check process health ---
PROC_ALIVE=0
if pgrep -f "next dev -p 3000" >/dev/null 2>&1 || pgrep -f "next-server" >/dev/null 2>&1; then
    PROC_ALIVE=1
fi

# --- 3. Check memory pressure ---
MEM_AVAIL_PCT=$(free | awk '/Mem:/ {printf "%d", ($7/$2)*100}')
log "HTTP=$HTTP_CODE PROC=$PROC_ALIVE MEM_AVAIL_PCT=${MEM_AVAIL_PCT}%"

# --- Decide whether to restart ---
NEEDS_RESTART=0
REASON=""

if [ "$HTTP_CODE" != "200" ]; then
    NEEDS_RESTART=1
    REASON="HTTP not 200 (got $HTTP_CODE)"
fi

if [ "$PROC_ALIVE" -eq 0 ]; then
    NEEDS_RESTART=1
    REASON="process not alive"
fi

if [ "${MEM_AVAIL_PCT:-100}" -lt 8 ]; then
    NEEDS_RESTART=1
    REASON="memory critical (avail ${MEM_AVAIL_PCT}%)"
fi

if [ "$NEEDS_RESTART" -eq 1 ]; then
    log "RESTART NEEDED: $REASON"
    # Kill any existing next processes
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    pkill -9 -f "bun run dev" 2>/dev/null
    sleep 3
    # Truncate dev.log to keep it manageable (keep last 200 lines)
    if [ -f "$DEV_LOG" ]; then
        tail -200 "$DEV_LOG" > "${DEV_LOG}.tmp" 2>/dev/null && mv "${DEV_LOG}.tmp" "$DEV_LOG"
    fi
    # Restart
    cd "$PROJECT_DIR" || exit 1
    nohup bun run dev > "$DEV_LOG" 2>&1 &
    NEW_PID=$!
    echo "$NEW_PID" > "$PID_FILE"
    log "server restarted, new PID=$NEW_PID"
    # Wait for it to come up
    sleep 12
    NEW_HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$HEALTH_URL" 2>/dev/null || echo "000")
    log "post-restart HTTP=$NEW_HTTP"
    if [ "$NEW_HTTP" = "200" ]; then
        log "restart SUCCESS"
    else
        log "restart FAILED (HTTP=$NEW_HTTP) - will retry next tick"
    fi
else
    log "all healthy - no action"
fi

exit 0
