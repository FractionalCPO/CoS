Run a full system health check and report results.

## Steps

1. **Test each MCP server** with a minimal real query (not config checks — actually use each tool):
   - **Notion**: Search for "test" in the workspace
   - **Gmail (fcpo)**: List 1 recent email subject from vahid@fractionalcpo.com
   - **Gmail (hi)**: List 1 recent email subject from hi@vahidjozi.com
   - **Calendar (fcpo)**: List today's events for vahid@fractionalcpo.com
   - **Calendar (hi)**: List today's events for hi@vahidjozi.com
   - **Fellow**: Search for 1 recent meeting
   - **Clay**: Search for 1 contact
   - **Firecrawl**: Confirm tool loads (list tools or scrape a test URL)
   - **Apollo**: Confirm tool loads (list tools or search a test query)
   - **Slack**: Read 1 recent message from any active channel
   - **DataForSEO**: Confirm tool loads (list tools or run a test query)
   - **Granola**: List 1 recent meeting

2. **Check relay health**: GET `$RELAY_URL/health` (default: http://localhost:3100/health)
   - Parse the response for WhatsApp bridge status, system info, uptime

3. **Check LaunchAgents & Tunnel** (local Mac only):
   - Verify these LaunchAgents are loaded and running:
     - `com.fractionalcpo.whatsapp-bridge` (port 8080)
     - `com.fractionalcpo.donna-relay` (port 3100)
     - `com.fractionalcpo.donna-tunnel` (cloudflared)
   - For each: `launchctl list | grep <label>`, check PID exists and exit status is 0
   - Check ports: `lsof -i :3100` and `lsof -i :8080` to verify processes are listening
   - Test tunnel: read URL from `/tmp/donna-tunnel-url.txt`, curl `<url>/health`
   - Report: loaded/running/crashed for each agent, tunnel URL + reachability

4. **Check Railway internals** (if running on Railway):
   - Session file accessible and valid
   - Git repo (CoS) is clean and up to date
   - Disk space available

5. **Report in table format**:
   ```
   ✓ Notion — ok (responded)
   ✓ Gmail fcpo — ok
   ✓ Gmail hi — ok
   ✓ Calendar fcpo — ok (3 events today)
   ✗ WhatsApp — bridge not running
   ✓ Relay — ok (uptime: 4h 23m)
   ✓ Fellow — ok
   ✓ Clay — ok
   ✓ Firecrawl — ok
   ✓ Apollo — ok
   ✓ Slack — ok
   ✓ DataForSEO — ok
   ✓ Granola — ok
   ✓ LaunchAgent: whatsapp-bridge — running (PID 1234)
   ✓ LaunchAgent: donna-relay — running (PID 5678)
   ✓ LaunchAgent: donna-tunnel — running (PID 9012)
   ✓ Tunnel — ok (https://xxx.trycloudflare.com)
   ```

6. If any service is down, include a brief note on what might be wrong and suggested fix.

## Rules
- Test by DOING, not by checking config files
- Report failures honestly — don't mask errors
- Keep output concise — table format with status + brief note
