---
name: playwright
description: Headless browser automation via Playwright. Navigate, click, type, screenshot, and interact with web pages using accessibility snapshots.
metadata: { "openclaw": { "emoji": "globe", "requires": { "bins": ["mcporter", "playwright-mcp"] } } }
---

# Playwright Browser Automation

Control a headless Chromium browser via Playwright. Uses accessibility snapshots (not screenshots) for fast, LLM-friendly page interaction.

## When to use

- Scraping dynamic/JS-rendered pages that Firecrawl cannot handle
- Filling out web forms
- Navigating multi-step web workflows (login, search, extract)
- Taking screenshots of web pages
- Testing or verifying web page behavior
- Any task requiring real browser interaction


> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

## Core workflow

1. Navigate to a URL
2. Take a snapshot to see the page structure
3. Interact with elements using their ref IDs from the snapshot
4. Repeat as needed

## Tools (22 total, key ones below)

### Navigate
```bash
mcporter call playwright.browser_navigate url="https://example.com"
```

### Snapshot (primary way to "see" the page)
```bash
mcporter call playwright.browser_snapshot
```
Returns an accessibility tree with ref IDs for every interactive element.

### Click
```bash
mcporter call playwright.browser_click ref="s1e5" element="Submit button"
```

### Type text
```bash
mcporter call playwright.browser_type ref="s1e3" text="hello world" submit=true
```

### Fill form (multiple fields at once)
```bash
mcporter call playwright.browser_fill_form fields='[{"name":"Email","type":"textbox","ref":"s1e2","value":"test@example.com"},{"name":"Password","type":"textbox","ref":"s1e4","value":"secret"}]'
```

### Screenshot
```bash
mcporter call playwright.browser_take_screenshot type="png" filename="page.png"
```

### Select dropdown option
```bash
mcporter call playwright.browser_select_option ref="s1e7" values='["option1"]'
```

### Evaluate JavaScript
```bash
mcporter call playwright.browser_evaluate function="() => document.title"
```

### Run Playwright code
```bash
mcporter call playwright.browser_run_code code="async (page) => { await page.goto('https://example.com'); return await page.title(); }"
```

### Wait
```bash
mcporter call playwright.browser_wait_for text="Loading complete"
mcporter call playwright.browser_wait_for time=3
```

### Tabs
```bash
mcporter call playwright.browser_tabs action="list"
mcporter call playwright.browser_tabs action="new"
mcporter call playwright.browser_tabs action="select" index=0
```

### Close
```bash
mcporter call playwright.browser_close
```

### Console / network
```bash
mcporter call playwright.browser_console_messages level="error"
mcporter call playwright.browser_network_requests includeStatic=false
```

### Install browser (if needed)
```bash
mcporter call playwright.browser_install
```

## Key concepts

- **ref:** Every element in a snapshot has a ref ID (e.g., "s1e5"). Use these to target clicks, typing, etc.
- **element:** Human-readable description of what you are clicking (for logging/approval). Optional but good practice.
- **Headless:** Runs without a display. No visual UI on the Mac Mini.
- **Snapshots over screenshots:** Prefer browser_snapshot for understanding page structure. Use browser_take_screenshot only when you need a visual image.

## Example: search Google and extract results

```bash
mcporter call playwright.browser_navigate url="https://www.google.com"
mcporter call playwright.browser_snapshot
# find the search box ref from snapshot, e.g. "s1e3"
mcporter call playwright.browser_type ref="s1e3" text="FractionalCPO" submit=true
mcporter call playwright.browser_snapshot
# read results from the accessibility tree
```

## Notes

- Browser: Chromium (headless), installed at /Users/claw/Library/Caches/ms-playwright/
- Runs with --headless flag (no display needed on Mac Mini)
- Config: /Users/claw/config/mcporter.json
