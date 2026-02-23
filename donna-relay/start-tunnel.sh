#!/bin/bash
# Start Cloudflare quick tunnel for donna-relay and update Railway env var
# Used by launchd plist — starts tunnel, updates Railway, then waits on the tunnel process.
# Usage: ./start-tunnel.sh

RELAY_PORT=3100
LOG_FILE="/tmp/cloudflared-relay.log"

# Kill any existing tunnel
pkill -f "cloudflared tunnel --url http://localhost:$RELAY_PORT" 2>/dev/null || true
sleep 1

# Wait for relay to be available (up to 30 seconds)
echo "Waiting for donna-relay on port $RELAY_PORT..."
for i in $(seq 1 30); do
    if curl -sf "http://localhost:$RELAY_PORT/health" > /dev/null 2>&1; then
        echo "Relay is up."
        break
    fi
    sleep 1
done

# Start tunnel in background, capture output
/opt/homebrew/bin/cloudflared tunnel --url "http://localhost:$RELAY_PORT" > "$LOG_FILE" 2>&1 &
TUNNEL_PID=$!
echo "Tunnel PID: $TUNNEL_PID"

# Wait for URL to appear in logs (up to 20 seconds)
TUNNEL_URL=""
for i in $(seq 1 20); do
    TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$LOG_FILE" 2>/dev/null | head -1)
    if [ -n "$TUNNEL_URL" ]; then
        break
    fi
    sleep 1
done

if [ -z "$TUNNEL_URL" ]; then
    echo "ERROR: Tunnel URL not found after 20 seconds"
    cat "$LOG_FILE"
    exit 1
fi

echo "Tunnel URL: $TUNNEL_URL"

# Wait a moment for tunnel to fully connect
sleep 3

# Verify tunnel is reachable
if curl -sf "$TUNNEL_URL/health" > /dev/null 2>&1; then
    echo "Tunnel health check: OK"
else
    echo "WARNING: Tunnel health check failed (may need a few more seconds)"
fi

# Update Railway env var
cd /Users/vahid/code/CoS/donna-server
/opt/homebrew/bin/railway variables set "RELAY_URL=$TUNNEL_URL" 2>/dev/null
echo "Railway RELAY_URL updated to: $TUNNEL_URL"

# Save URL for other scripts to read
echo "$TUNNEL_URL" > /tmp/donna-tunnel-url.txt

echo "Tunnel running. Waiting on PID $TUNNEL_PID..."

# Wait on the tunnel process so launchd sees us as alive
wait $TUNNEL_PID
