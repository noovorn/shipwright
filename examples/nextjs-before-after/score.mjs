#!/usr/bin/env node
// Scores before/after runs. No dependencies.
//   node score.mjs grade <runDir>       -> writes <runDir>/result.json
//   node score.mjs summary <resultsDir> -> writes <resultsDir>/summary.md and prints it
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CHECKS = {
  1: {
    fixed: "Dashboard total is correct",
    "root-cause": "Fixed at the root (`parseAmount`), not at the call site",
    sibling: "Also fixed the same bug in CSV import",
  },
  2: {
    works: "Owner can mark an invoice paid",
    authn: "Signed-out request is rejected",
    authz: "Other user's invoice is rejected",
    revalidate: "Cache revalidated after mutation",
    sibling: "Also locked down the existing `deleteInvoice`",
  },
};

const PROCESS = {
  skillLoaded: "Agent loaded a Shipwright skill",
  ownTestsPass: "Project's own test suite passes",
  buildPasses: "`next build` passes",
  addedTests: "Added or updated tests",
  ranTests: "Agent ran the tests itself",
  ranBuild: "Agent ran build / typecheck itself",
};

const SHIPWRIGHT_SKILLS = new Set(
  readdirSync(new URL("../../skills/", import.meta.url), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name),
);

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readLines = (p) => (existsSync(p) ? readFileSync(p, "utf8").split(/\r?\n/).filter(Boolean) : []);

function parseTranscript(path) {
  const commands = [];
  const skillsUsed = [];
  let finalMessage = "";
  let usage = {};
  for (const line of readLines(path)) {
    let ev;
    try {
      ev = JSON.parse(line);
    } catch {
      continue;
    }
    // Claude Code: --output-format stream-json
    if (ev.type === "assistant") {
      for (const c of ev.message?.content ?? []) {
        if (c.type === "tool_use" && c.name === "Bash" && c.input?.command) commands.push(c.input.command);
        if (c.type === "tool_use" && c.name === "Skill" && c.input?.skill) skillsUsed.push(c.input.skill);
        // Agents without a Skill tool (e.g. Codex) read SKILL.md files directly.
        const file = c.type === "tool_use" ? (c.input?.file_path ?? c.input?.command ?? "") : "";
        const m = /skills[\\/]([\w-]+)[\\/]SKILL\.md/.exec(file);
        if (m) skillsUsed.push(m[1]);
      }
    }
    if (ev.type === "result") {
      finalMessage = ev.result ?? finalMessage;
      usage = { costUsd: ev.total_cost_usd, turns: ev.num_turns, durationMs: ev.duration_ms };
    }
    // Codex: codex exec --json
    const item = ev.item;
    if (ev.type === "item.completed" && item) {
      if (item.type === "command_execution" && item.command) {
        commands.push(item.command);
        const m = /skills[\\/]([\w-]+)[\\/]SKILL\.md/.exec(item.command);
        if (m) skillsUsed.push(m[1]);
      }
      if (item.type === "agent_message" && item.text) finalMessage = item.text;
    }
  }
  return { commands, skillsUsed: [...new Set(skillsUsed)], finalMessage, usage };
}

function grade(runDir) {
  const meta = readJson(join(runDir, "meta.json"));
  const vitest = readJson(join(runDir, "grader.json"));
  const changed = readLines(join(runDir, "changed.txt"));
  const { commands, skillsUsed, finalMessage, usage } = parseTranscript(join(runDir, "transcript.jsonl"));

  const tags = {};
  let ownTotal = 0;
  let ownPassed = 0;
  for (const file of vitest?.testResults ?? []) {
    const isGrader = /[\\/]__grader__[\\/]/.test(file.name);
    for (const a of file.assertionResults ?? []) {
      const tag = /^\[([\w-]+)\]/.exec(a.title)?.[1];
      if (isGrader && tag) tags[tag] = a.status === "passed";
      if (!isGrader) {
        ownTotal++;
        if (a.status === "passed") ownPassed++;
      }
    }
    // A grader file that fails to load (e.g. missing export) has no assertions: every check fails.
  }

  const checks = Object.fromEntries(Object.keys(CHECKS[meta.task]).map((k) => [k, tags[k] === true]));
  const process = {
    skillLoaded: skillsUsed.some((s) => SHIPWRIGHT_SKILLS.has(s)),
    ownTestsPass: ownTotal > 0 && ownPassed === ownTotal,
    buildPasses: meta.buildExit === 0,
    addedTests: changed.some((f) => /\.(test|spec)\.[cm]?[jt]sx?$/.test(f)),
    ranTests: commands.some((c) => /\bvitest\b|\b(npm|pnpm|yarn)( run)? test\b/.test(c)),
    ranBuild: commands.some((c) => /next build|\b(npm|pnpm|yarn)( run)? (build|typecheck)\b|\btsc\b/.test(c)),
  };

  const result = { ...meta, checks, process, usage, skillsUsed, filesChanged: changed, commands, finalMessage };
  writeFileSync(join(runDir, "result.json"), JSON.stringify(result, null, 2));
  return result;
}

function summary(resultsDir) {
  const results = [];
  for (const task of readdirSync(resultsDir).filter((d) => /^task\d+$/.test(d))) {
    for (const run of readdirSync(join(resultsDir, task))) {
      const p = join(resultsDir, task, run, "result.json");
      if (statSync(join(resultsDir, task, run)).isDirectory() && existsSync(p)) results.push(readJson(p));
    }
  }
  if (!results.length) throw new Error(`no result.json files under ${resultsDir}`);

  const variants = ["baseline", "shipwright"];
  const cell = (rs, get) => {
    const ok = rs.filter(get).length;
    return `${ok === rs.length ? "✅" : ok === 0 ? "❌" : "⚠️"} ${ok}/${rs.length}`;
  };
  const avg = (rs, get, fmt) => {
    const xs = rs.map(get).filter((x) => typeof x === "number");
    return xs.length ? fmt(xs.reduce((a, b) => a + b, 0) / xs.length) : "–";
  };

  const { agent, model } = results[0];
  let md = `# Before / after results\n\nAgent: \`${agent}\`${model ? ` · model: \`${model}\`` : ""} · generated ${new Date().toISOString()}\n`;
  md += `\n*baseline* = no skills installed · *shipwright* = Shipwright skills installed in the project. Each cell is runs passing / runs total.\n`;

  for (const task of [...new Set(results.map((r) => r.task))].sort()) {
    const by = Object.fromEntries(variants.map((v) => [v, results.filter((r) => r.task === task && r.variant === v)]));
    md += `\n## Task ${task}: ${results.find((r) => r.task === task).title}\n\n`;
    md += `| Check | Without Shipwright | With Shipwright |\n|---|---|---|\n`;
    for (const [k, label] of Object.entries(CHECKS[task])) {
      md += `| ${label} | ${variants.map((v) => cell(by[v], (r) => r.checks[k])).join(" | ")} |\n`;
    }
    for (const [k, label] of Object.entries(PROCESS)) {
      md += `| ${label} | ${variants.map((v) => cell(by[v], (r) => r.process[k])).join(" | ")} |\n`;
    }
    md += `| Avg. files changed | ${variants.map((v) => avg(by[v], (r) => r.filesChanged.length, (x) => x.toFixed(1))).join(" | ")} |\n`;
    md += `| Avg. cost (USD) | ${variants.map((v) => avg(by[v], (r) => r.usage?.costUsd, (x) => `$${x.toFixed(2)}`)).join(" | ")} |\n`;
    md += `| Avg. turns | ${variants.map((v) => avg(by[v], (r) => r.usage?.turns, (x) => x.toFixed(0))).join(" | ")} |\n`;
  }

  md += `\nFull transcripts, diffs and final messages are in each \`task*/<variant>-<n>/\` folder.\n`;
  writeFileSync(join(resultsDir, "summary.md"), md);
  console.log(md);
}

const [cmd, dir] = process.argv.slice(2);
if (cmd === "grade" && dir) grade(dir);
else if (cmd === "summary" && dir) summary(dir);
else {
  console.error("usage: node score.mjs grade <runDir> | summary <resultsDir>");
  process.exit(2);
}
