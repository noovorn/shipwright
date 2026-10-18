#!/usr/bin/env bash
# Shipwright installer — installs skills for Claude Code and/or Codex.
# Usage:
#   ./install.sh                 # install all skills for every detected agent (user-level)
#   ./install.sh --project       # install into ./.claude/skills and ./.codex/skills of the current repo
#   ./install.sh --agent claude  # only Claude Code   (claude | codex | all)
#   ./install.sh --link          # symlink instead of copy (auto-updates with git pull)
#   ./install.sh debug review    # only skills whose name contains these words
#   ./install.sh --uninstall
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="$REPO_DIR/skills"
AGENT="all"; SCOPE="user"; MODE="copy"; UNINSTALL=0; FILTERS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project) SCOPE="project" ;;
    --agent) AGENT="${2:?--agent needs claude|codex|all}"; shift ;;
    --link) MODE="link" ;;
    --uninstall) UNINSTALL=1 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) FILTERS+=("$1") ;;
  esac
  shift
done

targets=()
base_claude="$HOME/.claude/skills"; base_codex="${CODEX_HOME:-$HOME/.codex}/skills"
if [[ $SCOPE == project ]]; then base_claude="$PWD/.claude/skills"; base_codex="$PWD/.codex/skills"; fi
[[ $AGENT == all || $AGENT == claude ]] && targets+=("$base_claude")
[[ $AGENT == all || $AGENT == codex  ]] && targets+=("$base_codex")

match() {
  [[ ${#FILTERS[@]} -eq 0 ]] && return 0
  for f in "${FILTERS[@]}"; do [[ $1 == *"$f"* ]] && return 0; done
  return 1
}

count=0
for dir in "$SRC"/*/; do
  name="$(basename "$dir")"
  match "$name" || continue
  for t in "${targets[@]}"; do
    dest="$t/$name"
    if [[ $UNINSTALL -eq 1 ]]; then
      rm -rf "$dest" && echo "  removed  $dest"
      continue
    fi
    mkdir -p "$t"; rm -rf "$dest"
    if [[ $MODE == link ]]; then ln -s "$dir" "$dest"; else cp -R "$dir" "$dest"; fi
    echo "  ✓ $name → $t"
  done
  count=$((count+1))
done

if [[ $UNINSTALL -eq 1 ]]; then echo "Uninstalled $count skill(s)."; else
  echo; echo "⚓ Installed $count skill(s). Restart Claude Code / Codex to load them."
fi
