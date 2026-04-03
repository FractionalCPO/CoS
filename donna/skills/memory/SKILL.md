---
name: memory
description: Persistent knowledge graph for cross-session memory. Store entities, relations, and observations that survive across conversations.
metadata: { "openclaw": { "emoji": "brain", "requires": { "bins": ["mcporter", "mcp-server-memory"] } } }
---

# Knowledge Graph Memory

Persistent cross-session memory using a knowledge graph. Store and retrieve entities, relations, and observations.

## When to use

- Remembering facts about people, projects, preferences across sessions
- Building a persistent knowledge base about Vahid, contacts, deals, patterns
- Storing learned context that should survive conversation restarts
- Tracking relationships between entities (people, companies, concepts)


> **Note:** The `mcporter call` syntax below is for reference. OpenClaw invokes these tools natively through its MCP protocol — you don't need to run mcporter commands directly. Just use the tool names (e.g., `apollo.apollo_search_people`) in your tool calls.

## Data model

- **Entities:** Named nodes with a type and observations (e.g., entity "Vahid" of type "person")
- **Relations:** Directed edges between entities in active voice (e.g., "Vahid" --works_at--> "FractionalCPO")
- **Observations:** Discrete facts attached to an entity (e.g., "prefers morning deep work", "timezone is ET")

## Storage

Data persists at `/Users/claw/.openclaw/memory/` (main.sqlite for OpenClaw memory, knowledge-graph.jsonl for MCP knowledge graph)

## Tools (via mcporter)

### Create entities
```bash
mcporter call memory.create_entities entities='[{"name":"Vahid","entityType":"person","observations":["timezone is ET","prefers morning deep work"]}]'
```

### Create relations
```bash
mcporter call memory.create_relations relations='[{"from":"Vahid","to":"FractionalCPO","relationType":"founded"}]'
```

### Add observations to existing entity
```bash
mcporter call memory.add_observations observations='[{"entityName":"Vahid","contents":["has right ACL tear","uses Oura Ring"]}]'
```

### Search the graph
```bash
mcporter call memory.search_nodes query="Vahid"
```

### Read entire graph
```bash
mcporter call memory.read_graph
```

### Open specific entities
```bash
mcporter call memory.open_nodes names='["Vahid","FractionalCPO"]'
```

### Delete entities
```bash
mcporter call memory.delete_entities entityNames='["OldEntity"]'
```

### Delete observations
```bash
mcporter call memory.delete_observations deletions='[{"entityName":"Vahid","observations":["outdated fact"]}]'
```

### Delete relations
```bash
mcporter call memory.delete_relations relations='[{"from":"Vahid","to":"OldCompany","relationType":"works_at"}]'
```

## Best practices

- Use consistent entity names (check with search_nodes before creating duplicates)
- Relations in active voice: "manages", "founded", "reports_to", "lives_in"
- Entity types: person, company, project, concept, tool, location
- Keep observations atomic -- one fact per observation string
- Read the graph at session start to restore context
- Config: /Users/claw/config/mcporter.json
