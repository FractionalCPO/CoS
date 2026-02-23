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

2. **Check Railway internals** (if running on Railway):
   - Session file accessible and valid
   - Git repo (CoS) is clean and up to date
   - Disk space available

3. **Report in table format**:
   ```
   ✓ Notion — ok (responded)
   ✓ Gmail fcpo — ok
   ✓ Gmail hi — ok
   ✓ Calendar fcpo — ok (3 events today)
   ✓ Fellow — ok
   ✓ Clay — ok
   ✓ Firecrawl — ok
   ✓ Apollo — ok
   ✓ Slack — ok
   ✓ DataForSEO — ok
   ✓ Granola — ok
   ```

4. If any service is down, include a brief note on what might be wrong and suggested fix.

## Rules
- Test by DOING, not by checking config files
- Report failures honestly — don't mask errors
- Keep output concise — table format with status + brief note
