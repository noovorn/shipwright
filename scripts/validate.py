#!/usr/bin/env python3
"""Validate every skills/*/SKILL.md: frontmatter, naming, description, size."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "skills"
NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
MAX_LINES = 500
errors = []

def err(path, msg):
    errors.append(f"{path.relative_to(ROOT.parent)}: {msg}")

def frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    if not m:
        return None
    fields = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith(" "):
            k, v = line.split(":", 1)
            fields[k.strip()] = v.strip()
    return fields

skills = sorted(p for p in ROOT.iterdir() if p.is_dir())
if not skills:
    print("no skills found"); sys.exit(1)

for d in skills:
    f = d / "SKILL.md"
    if not f.exists():
        err(d, "missing SKILL.md"); continue
    text = f.read_text(encoding="utf-8")
    fm = frontmatter(text)
    if fm is None:
        err(f, "missing or malformed YAML frontmatter"); continue
    name, desc = fm.get("name", ""), fm.get("description", "")
    if name != d.name:
        err(f, f"name '{name}' must equal folder name '{d.name}'")
    if not NAME_RE.match(name) or len(name) > 64:
        err(f, "name must be kebab-case, ≤64 chars")
    if any(w in name for w in ("claude", "anthropic")):
        err(f, "name must not contain 'claude' or 'anthropic'")
    if not desc:
        err(f, "description is required")
    elif len(desc) > 1024:
        err(f, f"description is {len(desc)} chars (max 1024)")
    elif not desc.lower().startswith("use "):
        err(f, "description should start with 'Use when…' so agents know when to trigger it")
    if "<" in desc or ">" in desc:
        err(f, "description must not contain angle brackets")
    n = text.count("\n")
    if n > MAX_LINES:
        err(f, f"{n} lines (max {MAX_LINES}); move detail to references/")

if errors:
    print("\n".join("✗ " + e for e in errors)); sys.exit(1)
print(f"✓ {len(skills)} skills valid")
