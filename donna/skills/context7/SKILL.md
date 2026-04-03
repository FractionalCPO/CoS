---
name: context7
description: Query up-to-date library documentation and code examples via the Context7 MCP server (through mcporter).
metadata: { "openclaw": { "emoji": "📚", "requires": { "bins": ["mcporter", "context7-mcp"] } } }
---

# Context7

Look up current library/framework documentation and code examples via the Context7 MCP server using mcporter.

## When to use

- When you need up-to-date docs for any programming library or framework
- When answering coding questions that need current API reference
- When the user asks about a specific library version


> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

## Two-step workflow

### 1. Resolve the library ID

```bash
mcporter call context7.resolve-library-id query="how to do X" libraryName="library-name"
```

Returns Context7-compatible library IDs (format: /org/project). Pick the best match.

### 2. Query the docs

```bash
mcporter call context7.query-docs libraryId="/org/project" query="specific question about the library"
```

Returns relevant documentation snippets and code examples.

## Examples

### Look up Next.js routing
```bash
mcporter call context7.resolve-library-id query="app router setup" libraryName="next.js"
mcporter call context7.query-docs libraryId="/vercel/next.js" query="how to set up app router with layouts"
```

### Look up React hooks
```bash
mcporter call context7.resolve-library-id query="useEffect cleanup" libraryName="react"
mcporter call context7.query-docs libraryId="/facebook/react" query="useEffect cleanup function examples"
```

### Look up a specific version
```bash
mcporter call context7.resolve-library-id query="server actions" libraryName="next.js"
mcporter call context7.query-docs libraryId="/vercel/next.js/v14.3.0-canary.87" query="server actions usage"
```

## Notes

- Always resolve the library ID first, unless the user provides one directly (e.g. /org/project)
- Be specific in queries — "how to set up JWT auth in Express" beats "auth"
- Do not call either tool more than 3 times per question
- No API key needed — Context7 is a free service
- Config: /Users/claw/config/mcporter.json
