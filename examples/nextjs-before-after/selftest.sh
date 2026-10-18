#!/usr/bin/env bash
# Proves the graders are fair: the untouched app must FAIL them, the reference fixes must PASS them.
# No AI agent involved. Usage: ./selftest.sh
set -euo pipefail
# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
make_template "$tmp/template"

fail=0
expect() { # expect <outDir> <check-path> <true|false>
  local got
  got="$(node -e 'const r=require(process.argv[1]);console.log(String(process.argv[2].split(".").reduce((o,k)=>o[k],r)))' \
    "$(native_path "$1/result.json")" "$2")"
  if [[ $got == "$3" ]]; then echo "  ✓ $2 = $got"; else echo "  ✗ $2 = $got (expected $3)"; fail=1; fi
}

for task in 1 2; do
  for variant in untouched reference; do
    log "task $task · $variant"
    ws="$tmp/task$task-$variant"
    out="$tmp/out/task$task-$variant"
    cp -R "$tmp/template" "$ws"
    [[ $variant == reference ]] && (cd "$ws" && git apply "$(native_path "$DEMO_DIR/reference/task$task.patch")")
    write_meta "$out" "$task" "$variant" selftest "" 1
    grade_workspace "$ws" "$out" "$task"

    expected=$([[ $variant == reference ]] && echo true || echo false)
    if [[ $task == 1 ]]; then checks=(fixed root-cause sibling); else checks=(works authn authz revalidate sibling); fi
    for c in "${checks[@]}"; do
      expect "$out" "checks.$c" "$expected"
    done
    expect "$out" process.ownTestsPass true
    expect "$out" process.buildPasses true
    expect "$out" process.addedTests "$expected"
  done
done

if [[ $fail -eq 0 ]]; then echo; echo "✓ graders are sound"; else echo; echo "✗ grader self-test failed"; exit 1; fi
