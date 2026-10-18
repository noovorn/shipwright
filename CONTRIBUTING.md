# Contributing

## Adding a skill

1. Create `skills/<kebab-name>/SKILL.md` with frontmatter:
   ```yaml
   ---
   name: <kebab-name>          # must match the folder
   description: Use when <concrete situations>. <what it enforces>.
   ---
   ```
2. Write the body as a procedure: numbered steps, real commands, a checklist, and an output format. Avoid generic advice the model already knows.
3. Keep it under 500 lines. Long reference material goes in `skills/<name>/references/` and is linked from SKILL.md.
4. Run `python scripts/validate.py`.
5. In your PR, show a before/after transcript of an agent using the skill.

## What makes a good skill

- **Triggers reliably**: the description names the exact situations, words, and file types.
- **Changes behavior**: it stops a real failure mode (guessing, skipping tests, false "done").
- **Is verifiable**: it ends with a check the agent must run.

## Improving an existing skill

Bring evidence: a transcript where the current skill led the agent wrong, and how your change fixes it.
