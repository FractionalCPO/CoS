# /health — System Health Check

## Description

Run a full system health check by testing each MCP server with a real query and reporting results.

## Usage

No arguments.

## Instructions

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
   - **Granola**: List 1 recent meeting
   - *(DataForSEO: direct API only, not an MCP server — skip)*

2. **Check local system health**:
   - CoS repo is clean (`git status`)
   - Key files accessible (CLAUDE.md, my-tasks.yaml, goals.yaml)
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
   ✓ Granola — ok
   - DataForSEO — skipped (direct API, not MCP)
   ```

4. If any service is down, include a brief note on what might be wrong and suggested fix.

## Rules
- Test by DOING, not by checking config files
- Report failures honestly — don't mask errors
- Keep output concise — table format with status + brief note
- Severity tiers for failures: **Critical** = Calendar + Notion (blocks /gm, /my-tasks). **Important** = Slack + Gmail (blocks /triage). **Informational** = all others.
