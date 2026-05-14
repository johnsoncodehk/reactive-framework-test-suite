import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const resultDir = join(root, ".test-results");

const sectionOrder = [
  "Graph Propagation",
  "Dynamic Dependencies",
  "Computed Evaluation",
  "Equality & Same-Value Optimization",
  "Effect Lifecycle",
  "Nested Effects & Ordering",
  "Inner Write",
  "Cycle & Infinite Loop Detection",
  "Batching / Transaction",
  "Untracked / Unsampled Reads",

  "Error Handling",
  "Stale Evaluation Order",
  "Memory & GC",
  "Behavioral Differences",
];

const files = readdirSync(resultDir).filter((f) => f.endsWith(".json"));
const sections = files.map((f) =>
  JSON.parse(readFileSync(join(resultDir, f), "utf-8"))
);

sections.sort((a, b) => {
  const ai = sectionOrder.indexOf(a.section);
  const bi = sectionOrder.indexOf(b.section);
  return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
});

const fwNames = Object.keys(sections[0].results);

let totalTests = 0;
let totalPass = 0;
let totalFail = 0;
let totalSkip = 0;

for (const s of sections) {
  if (s.section === "Behavioral Differences") continue;
  for (const fw of fwNames) {
    for (const t of s.testNames) {
      const v = s.results[fw]?.[t] || "⏭";
      totalTests++;
      if (v === "✅") totalPass++;
      else if (v === "❌") totalFail++;
      else if (v === "⬜") totalSkip++;
    }
  }
}

function buildTable(section) {
  const { testNames, results } = section;
  const isBehavioral = section.type === "behavioral";

  // Build column signatures and group ALL identical columns (not just adjacent)
  const cols = testNames.map((t) => {
    const match = t.match(/^#(\d+)/);
    const short = match ? `#${match[1]}` : t.slice(0, 8);
    const sig = fwNames.map((fw) => results[fw]?.[t] || "⏭").join("|");
    return { testName: t, short, sig };
  });

  // Group by signature, preserving first-occurrence order
  const sigMap = new Map();
  for (const col of cols) {
    if (sigMap.has(col.sig)) {
      sigMap.get(col.sig).shorts.push(col.short);
      sigMap.get(col.sig).testNames.push(col.testName);
    } else {
      sigMap.set(col.sig, {
        shorts: [col.short],
        testNames: [col.testName],
        sig: col.sig,
      });
    }
  }
  const merged = [...sigMap.values()];

  const maxFwLen = Math.max(9, ...fwNames.map((n) => n.length));

  // Build header labels from merged test IDs using compact range notation
  const headers = merged.map((g) => {
    if (g.shorts.length === 1) return g.shorts[0];
    // Extract numeric IDs and build contiguous sub-ranges
    const ids = g.shorts.map((s) => parseInt(s.slice(1), 10));
    const ranges = [];
    let start = ids[0], end = ids[0];
    for (let i = 1; i < ids.length; i++) {
      if (ids[i] === end + 1) {
        end = ids[i];
      } else {
        ranges.push(start === end ? `#${start}` : `#${start}..#${end}`);
        start = end = ids[i];
      }
    }
    ranges.push(start === end ? `#${start}` : `#${start}..#${end}`);
    const full = ranges.join(",");
    if (full.length <= 16) return full;
    // Truncate: show first 2-3 ranges + "..." + total count
    let truncated = ranges[0];
    for (let i = 1; i < ranges.length; i++) {
      const next = truncated + "," + ranges[i];
      if (next.length > 12) {
        return truncated + ",... ×" + ids.length;
      }
      truncated = next;
    }
    return truncated;
  });

  const colWidths = headers.map((h, i) => {
    let max = h.length;
    if (isBehavioral) {
      // For behavioral tables, cell text can be wider than header
      const firstTestName = merged[i].testNames[0];
      for (const fw of fwNames) {
        const v = results[fw]?.[firstTestName] || "";
        if (v.length > max) max = v.length;
      }
    }
    return max;
  });

  const lines = [];
  lines.push(
    "| " +
      "Framework".padEnd(maxFwLen) +
      " | " +
      headers.map((s, i) => s.padEnd(colWidths[i])).join(" | ") +
      " |"
  );
  lines.push(
    "| " +
      "-".repeat(maxFwLen) +
      " | " +
      colWidths.map((w) => "-".repeat(w)).join(" | ") +
      " |"
  );

  for (const fw of fwNames) {
    const cells = merged.map((g, i) => {
      const v = results[fw]?.[g.testNames[0]] || "⏭";
      return isBehavioral ? v.padEnd(colWidths[i]) : v.padStart(colWidths[i]);
    });
    lines.push(
      "| " +
        fw.padEnd(maxFwLen) +
        " | " +
        cells.join(" | ") +
        " |"
    );
  }

  return lines.join("\n");
}

function buildSummaryTable() {
  const fwStats = {};
  for (const fw of fwNames) {
    fwStats[fw] = { pass: 0, fail: 0, skip: 0 };
  }
  for (const s of sections) {
    if (s.section === "Behavioral Differences") continue;
    for (const fw of fwNames) {
      for (const t of s.testNames) {
        const v = s.results[fw]?.[t] || "⏭";
        if (v === "✅") fwStats[fw].pass++;
        else if (v === "❌") fwStats[fw].fail++;
        else if (v === "⬜") fwStats[fw].skip++;
      }
    }
  }

  const totalCases = sections.filter((s) => s.section !== "Behavioral Differences").reduce((a, s) => a + s.testNames.length, 0);
  const maxFwLen = Math.max(9, ...fwNames.map((n) => n.length));
  const lines = [];
  lines.push(
    `| ${"Framework".padEnd(maxFwLen)} | Pass | Fail | Skip | Total |`
  );
  lines.push(`| ${"-".repeat(maxFwLen)} | ---- | ---- | ---- | ----- |`);

  const sorted = [...fwNames].sort(
    (a, b) => fwStats[b].pass - fwStats[a].pass
  );
  for (const fw of sorted) {
    const { pass, fail, skip } = fwStats[fw];
    lines.push(
      `| ${fw.padEnd(maxFwLen)} | ${String(pass).padStart(4)} | ${String(fail).padStart(4)} | ${String(skip).padStart(4)} | ${String(totalCases).padStart(5)} |`
    );
  }

  return lines.join("\n");
}

const totalCases = sections.filter((s) => s.section !== "Behavioral Differences").reduce((a, s) => a + s.testNames.length, 0);

let readme = `# Reactive Framework Test Suite

Cross-library test suite for comparing reactive signal behavior across **${fwNames.length} frameworks** with **${totalCases} test cases**.

> ${totalPass} passed, ${totalFail} failed, ${totalSkip} skipped out of ${totalTests} total runs

Test cases are collected and adapted from the test suites of all participating frameworks — thanks to every project for their thorough testing work. This suite focuses on **reactive semantics** (propagation, batching, disposal, edge cases), not API completeness. Tests that require an optional capability (e.g. \`batch\`) are skipped (⬜) for frameworks that don't expose it, rather than marked as failures.

- ✅ Pass — correct behavior
- ❌ Fail — incorrect behavior or crash
- ⬜ Skip — required API not available

The **Behavioral Differences** section is separate — those tests reflect design choices (e.g. \`Object.is\` vs \`===\` equality, whether effects re-run, immediate vs deferred inner writes) where different answers are all valid.

## Frameworks

| Framework | Package | Version | Published |
|-----------|---------|---------|-----------|
`;

const fwPackages = {
  "alien-signals": "alien-signals",
  "@preact/signals-core": "@preact/signals-core",
  "@reactively/core": "@reactively/core",
  tansu: "@amadeus-it-group/tansu",
  "signal-polyfill (TC39)": "signal-polyfill",
  "@vue/reactivity": "@vue/reactivity",
  mobx: "mobx",
  svelte: "svelte",
  "solid-js": "solid-js",
  "@solidjs/signals": "@solidjs/signals",
  "S.js": "s-js",
  pota: "pota",
  "@angular/core": "@angular/core",
  anod: "anod",
};

function getPkgVersion(pkg) {
  try {
    const p = join(root, "node_modules", pkg, "package.json");
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8")).version;
  } catch {}
  try {
    const p = join(root, "node_modules", ...pkg.split("/"), "package.json");
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf-8")).version;
  } catch {}
  return "?";
}

function isGitInstall(pkg) {
  try {
    const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf-8"));
    const entry = lock.packages?.["node_modules/" + pkg];
    return entry?.resolved?.startsWith("git+") ?? false;
  } catch {
    return false;
  }
}

function getPkgDate(pkg, ver) {
  if (isGitInstall(pkg)) return "github";
  try {
    const json = execSync(`npm view ${pkg}@${ver} time --json 2>/dev/null`, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    });
    const date = JSON.parse(json)[ver];
    return date ? date.slice(0, 10) : "?";
  } catch {
    return "?";
  }
}

for (const fw of fwNames) {
  const pkg = fwPackages[fw] || fw;
  const moduleName = pkg.startsWith("github:") ? pkg.split("/").pop() : pkg;
  const ver = getPkgVersion(moduleName);
  const date = getPkgDate(moduleName, ver);
  readme += `| ${fw} | \`${pkg}\` | ${ver} | ${date} |\n`;
}

readme += `
## Summary

${buildSummaryTable()}

## Results

`;

// --- Extract JSDoc from source files ---

const srcDir = join(root, "src");

function stripJsDoc(raw) {
  return raw
    .replace(/^[\s]*\* ?/gm, "")
    .replace(/^\s*\n/, "")
    .replace(/\s+$/, "");
}

function parseSourceDocs(filePath) {
  let content;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return { sectionDoc: "", testDocs: {} };
  }

  // Section-level JSDoc: the one right before `export const section`
  let sectionDoc = "";
  const secMatch = content.match(
    /\/\*\*([\s\S]*?)\*\/\s*\nexport const section/
  );
  if (secMatch) {
    const stripped = stripJsDoc(secMatch[1]);
    // Drop the first line (section title, same as heading)
    const lines = stripped.split("\n");
    const rest = lines.slice(1).join("\n").replace(/^\s*\n/, "");
    sectionDoc = rest;
  }

  // Per-test JSDoc: /** ... */ right before "#N ..."
  // Use [^*]|(\*(?!/)) to prevent matching across */ boundaries
  const testDocs = {};
  const testRe = /\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*\n\s*"(#\d+[^"]*?)"/g;
  let m;
  while ((m = testRe.exec(content)) !== null) {
    testDocs[m[2]] = stripJsDoc(m[1]);
  }

  return { sectionDoc, testDocs };
}

// Map section names to source files
const sectionSourceMap = {};
for (const f of readdirSync(srcDir).filter(
  (f) => f.endsWith(".ts") && !["assert.ts", "framework.ts", "index.ts"].includes(f)
)) {
  const content = readFileSync(join(srcDir, f), "utf-8");
  const m = content.match(/export const section = "(.+?)"/);
  if (m) sectionSourceMap[m[1]] = join(srcDir, f);
}

function formatDoc(doc) {
  const blocks = doc.split(/\n\s*\n/).map((b) => b.replace(/^\n+|\n+$/g, ""));

  const diagramRe = /[─↔⟳✕]|[SCE]\(|\*C\(|\?─|<~~|═→|[/\\|]\s*$/;
  const structRe = /[─╌═⟳✕~]/;

  // Block-level: diagram if it has diagram chars and few prose lines
  function isBlockDiagram(block) {
    const lines = block.split("\n").filter((l) => l.trim());
    if (lines.length === 0) return false;
    if (!lines.some((l) => diagramRe.test(l) || /^\s{2,}[/\\|]/.test(l))) return false;
    const prose = lines.filter((l) => {
      const indent = l.length - l.trimStart().length;
      return indent <= 1 && l.trim().split(/\s+/).length >= 6 && !structRe.test(l);
    });
    return prose.length <= lines.length / 3;
  }

  // Line-level: for splitting mixed blocks where diagram and prose
  // aren't separated by blank lines in the source JSDoc
  function isDiagramLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;
    if (structRe.test(line) || /^\s{2,}[/\\|]/.test(line)) return true;
    const indent = line.length - line.trimStart().length;
    if (indent >= 4 && trimmed.split(/\s+/).length <= 4) return true;
    if (/[SCE]\(|\*C\(/.test(line)) {
      if (indent >= 2) return true;
      const stripped = trimmed.replace(/\*?[SCE]\([^)]*\)/g, "").replace(/[→←↔─╌═]/g, "").trim();
      return stripped.split(/\s+/).filter((w) => w.length > 0).length < 5;
    }
    return false;
  }

  const parts = [];
  for (const block of blocks) {
    if (!block) continue;
    if (isBlockDiagram(block)) {
      parts.push({ text: block, isDiagram: true });
      continue;
    }
    // Check if the block has mixed diagram+prose lines (no blank line separator in JSDoc)
    const lines = block.split("\n");
    const lineTypes = lines.map((l) => isDiagramLine(l));
    if (!lineTypes.some((t) => t === true)) {
      parts.push({ text: block, isDiagram: false });
      continue;
    }
    // Resolve blank lines: diagram between diagram lines, text otherwise
    const resolved = lineTypes.map((t, i) => {
      if (t !== null) return t;
      const prev = lineTypes.slice(0, i).reverse().find((x) => x !== null);
      const next = lineTypes.slice(i + 1).find((x) => x !== null);
      return prev === true && next === true;
    });
    // Split into consecutive same-type runs
    let run = [lines[0]];
    let runType = resolved[0];
    for (let i = 1; i < lines.length; i++) {
      if (resolved[i] !== runType) {
        const text = run.join("\n").replace(/^\n+|\n+$/g, "");
        if (text.trim()) parts.push({ text, isDiagram: runType });
        run = [];
        runType = resolved[i];
      }
      run.push(lines[i]);
    }
    const last = run.join("\n").replace(/^\n+|\n+$/g, "");
    if (last.trim()) parts.push({ text: last, isDiagram: runType });
  }

  // Merge adjacent diagram parts
  const merged = [];
  for (const item of parts) {
    const prev = merged[merged.length - 1];
    if (prev && prev.isDiagram && item.isDiagram) {
      prev.text += "\n\n" + item.text;
    } else {
      merged.push({ ...item });
    }
  }

  return merged
    .map((p) => (p.isDiagram ? "```\n" + p.text + "\n```" : p.text))
    .join("\n\n");
}

function buildTestDetails(section) {
  const { testNames, results } = section;
  const docs = parseSourceDocs(sectionSourceMap[section.section] || "");

  const failed = [];
  const passed = [];
  for (const t of testNames) {
    const hasNonPass = fwNames.some((fw) => {
      const v = results[fw]?.[t] || "⏭";
      return v !== "✅";
    });
    if (hasNonPass) failed.push(t);
    else passed.push(t);
  }

  function renderTests(tests, summary) {
    const withDocs = tests.filter((t) => docs.testDocs[t]);
    if (withDocs.length === 0 && tests.length === 0) return "";
    let out = `\n\n<details>\n<summary>${summary}</summary>\n\n`;
    for (const t of tests) {
      const doc = docs.testDocs[t];
      if (doc) {
        out += `#### ${t}\n\n${formatDoc(doc)}\n\n`;
      } else {
        out += `- ${t}\n`;
      }
    }
    out += "\n</details>\n";
    return out;
  }

  if (failed.length > 0) {
    const label = section.type === "behavioral" ? "Test descriptions" : "Tests with failures or skips";
    return renderTests(failed, label);
  }

  const withDocs = testNames.filter((t) => docs.testDocs[t]);
  if (withDocs.length === 0) return "";
  return renderTests(withDocs, "Test descriptions");
}

for (const section of sections) {
  readme += `### ${section.section}\n\n`;
  const docs = parseSourceDocs(sectionSourceMap[section.section] || "");
  if (docs.sectionDoc) {
    readme += formatDoc(docs.sectionDoc) + "\n\n";
  }
  readme += buildTable(section);
  readme += buildTestDetails(section);
  readme += "\n\n";
}

readme += `## Usage

### Test your own framework

Install the package:

\`\`\`sh
npm install reactive-framework-test-suite
\`\`\`

Implement the \`ReactiveFramework\` adapter:

\`\`\`ts
import type { ReactiveFramework } from "reactive-framework-test-suite";

const myFramework: ReactiveFramework = {
  name: "my-framework",
  signal(initialValue) { /* ... */ },
  computed(fn) { /* ... */ },
  effect(fn) { /* ... return dispose */ },
  run(fn) { /* ... */ },
  // Optional:
  batch(fn) { /* ... */ },
  untracked(fn) { /* ... */ },
};
\`\`\`

Wire it up with your test runner (vitest, jest, mocha, etc.):

\`\`\`ts
import { testSuite, SkipTest } from "reactive-framework-test-suite";

for (const { section, cases } of testSuite) {
  describe(section, () => {
    for (const [name, fn] of Object.entries(cases)) {
      test(name, () => {
        try {
          myFramework.run(() => fn(myFramework));
        } catch (e) {
          if (e instanceof SkipTest) return; // optional API not available
          throw e;
        }
      });
    }
  });
}
\`\`\`

### Run the cross-framework matrix locally

\`\`\`sh
npm install
npm test
\`\`\`
`;

writeFileSync(join(root, "README.md"), readme);
console.log(`README.md updated: ${totalCases} tests, ${fwNames.length} frameworks`);
