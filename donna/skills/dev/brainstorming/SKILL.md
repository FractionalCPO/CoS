---
name: dev-brainstorming
description: "Use before any creative work — new features, components, or behavior changes. Explores intent and design before implementation."
---

# Brainstorming

**Iron Law:** Never jump to implementation. Understand the problem first.

## Process

### 1. Understand Intent (Socratic)
Ask ONE question at a time. Do not batch questions. Goals:
- What problem are we solving?
- Who is it for?
- What does success look like?
- What are the constraints?

Keep going until the problem is crisp. If Vahid says "just build it," still ask at least one clarifying question.

### 2. Explore the Codebase
Before proposing anything:
- Find existing patterns that solve similar problems
- Identify code that will be touched
- Note conventions already in use

### 3. Propose Approaches
Present 2-3 options. For each:
- **Approach:** one-sentence summary
- **How it works:** brief mechanics
- **Tradeoffs:** what you gain, what you lose
- **Recommendation:** pick one and say why

Apply YAGNI ruthlessly. The simplest approach that solves the stated problem wins.

### 4. Design Document
Once an approach is chosen, write a design doc with these sections:
- **Problem:** what and why
- **Solution:** chosen approach
- **Changes:** files to create/modify
- **Edge cases:** what could go wrong
- **Testing strategy:** how we verify it works

Save the design doc to a workspace file (e.g., `workspace/designs/<feature-name>.md`).

### 5. Get Approval
Present the design. Do NOT proceed to implementation until Vahid says go.

## Red Flags
- Starting to write code before design is approved
- Proposing only one approach
- Skipping the "why" and jumping to "how"
- Building for hypothetical future requirements
