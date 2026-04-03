#!/usr/bin/env python3
"""
session-summarizer.py

Extracts new user messages from target Donna sessions, calls Haiku to
identify persistent facts, and appends them to today's memory file.

Usage:
    python3 session-summarizer.py
    python3 session-summarizer.py --test-session /path/to/file.jsonl
"""

import argparse
import json
import os
import subprocess
import sys
from datetime import datetime

# ── Constants ─────────────────────────────────────────────────────────────────

AUTH_PROFILES_PATH = "/Users/claw/.openclaw/agents/main/agent/auth-profiles.json"
SESSIONS_INDEX_PATH = "/Users/claw/.openclaw/agents/main/sessions/sessions.json"
STATE_FILE_PATH = "/Users/claw/.openclaw/workspace/memory/session-summarizer-state.json"
MEMORY_DIR = "/Users/claw/.openclaw/workspace/memory"

TARGET_SESSIONS = [
    "agent:main:telegram:direct:112718186",
    "agent:main:main",
]

MODEL = "claude-haiku-4-5-20251001"
MIN_MESSAGE_LEN = 15
MAX_MESSAGE_CHARS = 1500
MAX_MESSAGES_TO_SEND = 40

FACT_EXTRACTION_PROMPT = """You are reviewing user messages from a conversation with an AI assistant.
Extract ONLY facts worth persisting to long-term memory — facts the AI would otherwise forget.

INCLUDE:
- Purchases (domains, subscriptions, products — with price/order# if present)
- Decisions ("going with X", "cancelled Y", "chose Z over W")
- Account/project context (URLs, status changes, named entities + role)
- Confirmations that resolve ambiguity ("that alert was me", "deal is closed", "task done")
- New project names, codenames, key people mentioned with context

EXCLUDE:
- Questions, requests, commands to the AI
- Casual chat, greetings, reactions
- Things that are generic knowledge

Format: one bullet per fact, starting with "- "
If nothing qualifies, output exactly: NO_FACTS

Messages:
{messages}"""


# ── Helpers ───────────────────────────────────────────────────────────────────

def load_api_key():
    """Load Anthropic API key from auth-profiles.json."""
    with open(AUTH_PROFILES_PATH) as f:
        profiles = json.load(f)
    token = profiles["profiles"]["anthropic:general-max-sub"]["token"]
    if not token:
        raise ValueError("Empty API token in auth-profiles.json")
    return token


def load_state():
    """Load state file. Returns dict with lastProcessedLine per session key."""
    if not os.path.exists(STATE_FILE_PATH):
        return {}
    with open(STATE_FILE_PATH) as f:
        try:
            return json.load(f)
        except json.JSONDecodeError as e:
            print(f"[summarizer] WARN: corrupt state file, resetting: {e}", file=sys.stderr)
            return {}


def save_state(state):
    """Persist state file atomically."""
    tmp = STATE_FILE_PATH + ".tmp"
    with open(tmp, "w") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, STATE_FILE_PATH)


def get_session_file(session_key):
    """Look up sessionFile path from sessions index."""
    with open(SESSIONS_INDEX_PATH) as f:
        index = json.load(f)
    entry = index.get(session_key)
    if not entry:
        return None
    return entry.get("sessionFile")


def extract_new_user_messages(jsonl_path, last_processed_line):
    """
    Read JSONL from last_processed_line onward.
    Returns (new_messages, total_line_count).
    new_messages is a list of text strings from user turns.
    """
    messages = []
    total_lines = 0

    with open(jsonl_path) as f:
        for i, raw_line in enumerate(f):
            total_lines = i + 1
            if i < last_processed_line:
                continue
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                obj = json.loads(raw_line)
            except json.JSONDecodeError as e:
                print(f"[summarizer] WARN: JSON parse error at line {i}: {e}", file=sys.stderr)
                continue

            msg = obj.get("message")
            if not msg:
                continue
            if msg.get("role") != "user":
                continue

            content = msg.get("content", [])
            text = ""
            if isinstance(content, list):
                for part in content:
                    if isinstance(part, dict) and part.get("type") == "text":
                        text = part.get("text", "")
                        break
            elif isinstance(content, str):
                text = content

            text = text.strip()
            if len(text) < MIN_MESSAGE_LEN:
                continue

            messages.append(text[:MAX_MESSAGE_CHARS])

    return messages, total_lines


def call_haiku(api_key, messages_text):
    """
    Call claude-haiku via curl subprocess.
    Returns the assistant's text response, or None on error.
    """
    payload = {
        "model": MODEL,
        "max_tokens": 1024,
        "messages": [
            {
                "role": "user",
                "content": FACT_EXTRACTION_PROMPT.format(messages=messages_text),
            }
        ],
    }

    cmd = [
        "curl",
        "-s",
        "-X", "POST",
        "https://api.anthropic.com/v1/messages",
        "-H", "Content-Type: application/json",
        "-H", f"x-api-key: {api_key}",
        "-H", "anthropic-version: 2023-06-01",
        "-d", json.dumps(payload),
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    except subprocess.TimeoutExpired:
        print("[summarizer] ERROR: curl timed out", file=sys.stderr)
        return None

    if result.returncode != 0:
        print(f"[summarizer] ERROR: curl exit {result.returncode}: {result.stderr}", file=sys.stderr)
        return None

    try:
        response = json.loads(result.stdout)
    except json.JSONDecodeError:
        print(f"[summarizer] ERROR: invalid JSON from API: {result.stdout[:200]}", file=sys.stderr)
        return None

    if "error" in response:
        print(f"[summarizer] ERROR: API error: {response['error']}", file=sys.stderr)
        return None

    content = response.get("content", [])
    for part in content:
        if part.get("type") == "text":
            return part["text"].strip()

    return None


def append_to_memory(facts_text):
    """Append facts to today's memory file under a timestamped header."""
    today = datetime.now().strftime("%Y-%m-%d")
    memory_file = os.path.join(MEMORY_DIR, f"{today}.md")

    time_str = datetime.now().strftime("%H:%M")
    header = f"\n## [session-summarizer] {time_str}\n"
    block = header + facts_text + "\n"

    with open(memory_file, "a") as f:
        f.write(block)

    print(f"[summarizer] Appended facts to {memory_file}")


def process_session(session_key, jsonl_path, state, api_key):
    """
    Process a single session file. Updates state in-place.
    Returns True if facts were found and written.
    """
    last_processed = state.get(session_key, 0)

    if not os.path.exists(jsonl_path):
        print(f"[summarizer] WARN: session file not found: {jsonl_path}", file=sys.stderr)
        return False

    messages, total_lines = extract_new_user_messages(jsonl_path, last_processed)

    if not messages:
        # No new user messages — update state silently and return
        state[session_key] = total_lines
        return False

    new_lines = total_lines - last_processed
    print(f"[summarizer] Processing session '{session_key}'")
    print(f"[summarizer]   File: {jsonl_path}")
    print(f"[summarizer]   Last processed line: {last_processed}")
    print(f"[summarizer]   Total lines: {total_lines}, new lines: {new_lines}")
    print(f"[summarizer]   New user messages extracted: {len(messages)}")

    # Cap to last MAX_MESSAGES_TO_SEND
    if len(messages) > MAX_MESSAGES_TO_SEND:
        print(f"[summarizer]   Capping to last {MAX_MESSAGES_TO_SEND} messages")
        messages = messages[-MAX_MESSAGES_TO_SEND:]

    messages_text = "\n---\n".join(messages)

    print(f"[summarizer]   Calling Haiku ({MODEL})...")
    response = call_haiku(api_key, messages_text)

    if response is None:
        print(f"[summarizer] ERROR: API call failed for session '{session_key}'", file=sys.stderr)
        # Don't update state — retry next run
        return False

    print(f"[summarizer]   API response preview: {response[:100]}")

    if response.strip() == "NO_FACTS":
        print(f"[summarizer]   No facts found — nothing to write")
        state[session_key] = total_lines
        return False

    append_to_memory(response)
    state[session_key] = total_lines
    return True


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Donna session fact extractor")
    parser.add_argument(
        "--test-session",
        metavar="PATH",
        help="Process a single JSONL file with key __test__ (for E2E testing)",
    )
    args = parser.parse_args()

    # Load API key
    try:
        api_key = load_api_key()
    except Exception as e:
        print(f"[summarizer] FATAL: Could not load API key: {e}", file=sys.stderr)
        sys.exit(1)

    # Load state
    state = load_state()

    if args.test_session:
        # Test mode: single file, key = __test__
        print(f"[summarizer] TEST MODE: {args.test_session}")
        process_session("__test__", args.test_session, state, api_key)
        save_state(state)
        print(f"[summarizer] Done (test mode)")
        return

    # Normal mode: target sessions
    wrote_facts = False
    for session_key in TARGET_SESSIONS:
        jsonl_path = get_session_file(session_key)
        if not jsonl_path:
            print(f"[summarizer] WARN: No session file for '{session_key}' — skipping", file=sys.stderr)
            continue

        try:
            result = process_session(session_key, jsonl_path, state, api_key)
            if result:
                wrote_facts = True
        except Exception as e:
            print(f"[summarizer] ERROR processing '{session_key}': {e}", file=sys.stderr)
            continue
        finally:
            save_state(state)

    if wrote_facts:
        print(f"[summarizer] Done at {datetime.now().isoformat()}")


if __name__ == "__main__":
    main()
