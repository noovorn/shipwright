# Shared helpers for run.sh and selftest.sh. Source, don't execute.
# shellcheck shell=bash

DEMO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC2034  # used by run.sh
REPO_DIR="$(cd "$DEMO_DIR/../.." && pwd)"

declare -A TASK_TITLE=(
  [1]="Wrong dashboard total (bug fix)"
  [2]="Mark invoice as paid (feature)"
)

# Paths handed to node must be native on Windows (Git Bash /c/... paths are not).
native_path() { if command -v cygpath >/dev/null 2>&1; then cygpath -m "$1"; else printf '%s\n' "$1"; fi; }

log() { printf '\033[1;34m▸\033[0m %s\n' "$*" >&2; }

# make_template <dir>: fresh copy of the app with dependencies installed and one git commit.
make_template() {
  local dir="$1"
  mkdir -p "$dir"
  (cd "$DEMO_DIR/app" && tar --exclude=node_modules --exclude=.next --exclude='*.tsbuildinfo' -cf - .) | (cd "$dir" && tar xf -)
  log "installing app dependencies (once)"
  (cd "$dir" && npm ci --no-audit --no-fund --loglevel=error >/dev/null)
  git_commit "$dir" "Ledgerly demo app"
}

git_commit() {
  local dir="$1" msg="$2"
  (
    cd "$dir" || exit
    [[ -d .git ]] || git init -q
    git config core.autocrlf false
    git config user.email demo@shipwright.local
    git config user.name "Shipwright demo"
    git add -A
    git commit -qm "$msg"
  )
}

# grade_workspace <workspace> <outDir> <task>: snapshot the diff, run hidden graders + build, write result.json.
# Expects <outDir>/meta.json to exist already.
grade_workspace() {
  local ws="$1" out="$2" task="$3" build_exit=0
  mkdir -p "$out"

  (cd "$ws" && git add -A && git diff --cached HEAD --name-only -- . ':!.claude' ':!.codex' >"$out/changed.txt" &&
    git diff --cached HEAD -- . ':!.claude' ':!.codex' >"$out/diff.patch")

  mkdir -p "$ws/__grader__"
  cp "$DEMO_DIR/grader/task$task.test.ts" "$ws/__grader__/"
  (cd "$ws" && npx vitest run --reporter=json --outputFile="$(native_path "$out/grader.json")") >"$out/vitest.log" 2>&1 || true
  rm -rf "$ws/__grader__"

  (cd "$ws" && npm run build) >"$out/build.log" 2>&1 || build_exit=$?

  node -e 'const fs=require("fs");const [f,code]=process.argv.slice(1);const m=JSON.parse(fs.readFileSync(f,"utf8"));m.buildExit=Number(code);fs.writeFileSync(f,JSON.stringify(m,null,2))' \
    "$(native_path "$out/meta.json")" "$build_exit"
  node "$(native_path "$DEMO_DIR/score.mjs")" grade "$(native_path "$out")"
}

# write_meta <outDir> <task> <variant> <agent> <model> <run>
write_meta() {
  local out="$1"
  mkdir -p "$out"
  node -e 'const [f,task,variant,agent,model,run,title]=process.argv.slice(1);require("fs").writeFileSync(f,JSON.stringify({task:Number(task),title,variant,agent,model:model||null,run:Number(run)},null,2))' \
    "$(native_path "$out/meta.json")" "$2" "$3" "$4" "$5" "$6" "${TASK_TITLE[$2]}"
}
