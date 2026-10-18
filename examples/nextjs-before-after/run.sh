#!/usr/bin/env bash
# Runs the same tasks with and without Shipwright skills and scores both with hidden graders.
# Usage:
#   ./run.sh                       # Claude Code, both tasks, 1 run each
#   ./run.sh --runs 3              # repeat to smooth out randomness (recommended: 3+)
#   ./run.sh --agent codex         # Codex CLI instead of Claude Code
#   ./run.sh --task 2 --model X    # one task, specific model
set -euo pipefail
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

AGENT=claude; RUNS=1; TASKS=(1 2); MODEL=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent) AGENT="${2:?claude|codex}"; shift ;;
    --runs) RUNS="${2:?number}"; shift ;;
    --task) TASKS=("${2:?1|2}"); shift ;;
    --model) MODEL="${2:?model id}"; shift ;;
    -h|--help) sed -n '2,8p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done
[[ $AGENT == claude || $AGENT == codex ]] || { echo "--agent must be claude or codex" >&2; exit 2; }

for bin in "$AGENT" node npm git tar; do
  command -v "$bin" >/dev/null || { echo "missing required command: $bin" >&2; exit 1; }
done

# User-level Shipwright skills would leak into the baseline and make the comparison meaningless.
if [[ $AGENT == claude ]]; then user_skills="$HOME/.claude/skills"; else user_skills="${CODEX_HOME:-$HOME/.codex}/skills"; fi
for d in "$REPO_DIR"/skills/*/; do
  if [[ -e "$user_skills/$(basename "$d")" ]]; then
    echo "Shipwright skills are installed user-wide in $user_skills, so the baseline would use them too." >&2
    echo "Temporarily remove them:  $REPO_DIR/install.sh --uninstall --agent $AGENT   (reinstall afterwards)" >&2
    exit 1
  fi
done

run_agent() { # run_agent <workspace> <prompt> <transcript>
  local ws="$1" prompt="$2" transcript="$3"
  # Workspaces are throwaway copies in a temp dir, so permission prompts are skipped.
  if [[ $AGENT == claude ]]; then
    (cd "$ws" && claude -p "$prompt" --output-format stream-json --verbose --dangerously-skip-permissions \
      ${MODEL:+--model "$MODEL"} </dev/null >"$transcript" 2>"$transcript.err") || true
  else
    (cd "$ws" && codex exec --json --full-auto ${MODEL:+-m "$MODEL"} "$prompt" </dev/null >"$transcript" 2>"$transcript.err") || true
  fi
}

stamp="$(date +%Y%m%d-%H%M%S)"
results="$DEMO_DIR/results/$stamp-$AGENT"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
make_template "$tmp/template"

for task in "${TASKS[@]}"; do
  prompt="$(cat "$DEMO_DIR"/tasks/"$task"-*.md)"
  for run in $(seq "$RUNS"); do
    # Alternate order so neither variant always goes first.
    if (( run % 2 )); then variants=(baseline shipwright); else variants=(shipwright baseline); fi
    for variant in "${variants[@]}"; do
      log "task $task · run $run/$RUNS · $variant"
      ws="$tmp/task$task-$variant-$run"
      out="$results/task$task/$variant-$run"
      cp -R "$tmp/template" "$ws"
      if [[ $variant == shipwright ]]; then
        (cd "$ws" && "$REPO_DIR/install.sh" --project --agent "$AGENT" >/dev/null)
        git_commit "$ws" "Install Shipwright skills"
      fi
      write_meta "$out" "$task" "$variant" "$AGENT" "$MODEL" "$run"
      start=$SECONDS
      run_agent "$ws" "$prompt" "$out/transcript.jsonl"
      log "agent finished in $((SECONDS - start))s, grading"
      grade_workspace "$ws" "$out" "$task"
    done
  done
done

node "$(native_path "$DEMO_DIR/score.mjs")" summary "$(native_path "$results")"
log "results: $results/summary.md"
