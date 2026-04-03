---
name: firecrawl
description: Scrape, crawl, search, and extract structured data from the web via Firecrawl MCP (through mcporter).
metadata: { "openclaw": { "emoji": "🔥", "requires": { "bins": ["mcporter", "firecrawl-mcp"], "env": ["FIRECRAWL_API_KEY"] } } }
---

# Firecrawl

Web scraping, crawling, search, and structured data extraction via the Firecrawl MCP server using mcporter.

## When to use

- Scraping a single web page for content or data
- Crawling multiple pages from a site
- Searching the web for information
- Extracting structured data (JSON) from pages
- Discovering URLs on a site (sitemap/map)
- Complex multi-source web research (agent mode)

> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

## Tools

### Scrape a single page (default tool — use this first)
```bash
mcporter call firecrawl.firecrawl_scrape url="https://example.com" formats=["markdown"] onlyMainContent=true
```

For structured data extraction (preferred when you need specific fields):
```bash
mcporter call firecrawl.firecrawl_scrape url="https://example.com/pricing" formats=[{"type":"json","prompt":"Extract pricing tiers","schema":{"type":"object","properties":{"tiers":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"price":{"type":"string"}}}}}}}]
```

### Search the web
```bash
mcporter call firecrawl.firecrawl_search query="topic to search" limit=5
```

### Map a site (discover URLs)
```bash
mcporter call firecrawl.firecrawl_map url="https://example.com" search="specific page"
```

### Crawl multiple pages
```bash
mcporter call firecrawl.firecrawl_crawl url="https://example.com" limit=10
```

### Extract structured data from multiple URLs
```bash
mcporter call firecrawl.firecrawl_extract urls=["https://example.com/page1","https://example.com/page2"] prompt="Extract product names and prices"
```

### Agent (complex research)
```bash
mcporter call firecrawl.firecrawl_agent url="https://example.com" objective="Find all pricing information and compare plans"
```

### Browser tools (interactive)
```bash
mcporter call firecrawl.firecrawl_browser_create url="https://example.com"
mcporter call firecrawl.firecrawl_browser_execute sessionId="<id>" actions=[{"type":"click","selector":"button.submit"}]
mcporter call firecrawl.firecrawl_browser_delete sessionId="<id>"
```

## Format selection rules

- **JSON format** — when extracting specific data points (prices, specs, lists, API params). Always provide a prompt and schema.
- **Markdown format** — when you need the full page content for reading or summarization.
- **Branding format** — when extracting brand identity (colors, fonts, logos).

## Tips

- Add `onlyMainContent=true` to skip navs/footers
- Add `waitFor=5000` for JavaScript-heavy pages
- Use `firecrawl_map` first to discover the right URL, then `firecrawl_scrape` on it
- For SPA/JS pages that return empty: increase waitFor, try base URL, use map, or fall back to agent
- Add `maxAge=86400` for faster cached scrapes (value in seconds)
- Hobby plan: $16/mo, 500 credits/mo. Scrape = 1 credit, crawl = 1/page, search = 1/result

## Notes

- API key: $FIRECRAWL_API_KEY (set in .zshrc, passed via mcporter env config)
- Config: /Users/claw/config/mcporter.json
- Dashboard: https://firecrawl.dev/app
