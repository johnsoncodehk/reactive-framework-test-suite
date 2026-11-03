import { describe, test, beforeAll, afterAll } from "vitest";
import { spawn } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { frameworks } from "./frameworks/index.js";
import { testSuite, type TestSection } from "../src/index.js";
import { runCase, crashResult } from "./runCase.js";

const root = join(import.meta.dirname, "..");
const resultDir = join(root, ".test-results");

// Fixed rather than the machine-dependent V8 default, so a case that
// exhausts memory does so at the same point everywhere.
const ISOLATED_HEAP_MB = 1024;

function runIsolatedOnce(
  section: string,
  fwName: string,
  names: string[]
): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        `--max-old-space-size=${ISOLATED_HEAP_MB}`,
        join(root, "node_modules", "vite-node", "vite-node.mjs"),
        "--config",
        join(root, "vitest.config.ts"),
        join(root, "test", "isolated.ts"),
        section,
        fwName,
        ...names,
      ],
      { cwd: root, stdio: ["ignore", "ignore", "pipe", "pipe"] }
    );
    const results: Record<string, string> = {};
    let ready = false;
    let buffered = "";
    let stderr = "";
    child.stdio[3]!.on("data", (chunk) => {
      buffered += chunk;
      const lines = buffered.split("\n");
      buffered = lines.pop()!;
      for (const line of lines) {
        if (line === "ready") {
          ready = true;
          continue;
        }
        const [name, result] = JSON.parse(line);
        results[name] = result;
      }
    });
    child.stderr!.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", () => {
      // Dying before any case ran is a harness failure, not a result.
      if (!ready) {
        reject(new Error(`isolated runner failed to start for ${fwName}:\n${stderr}`));
        return;
      }
      resolve(results);
    });
  });
}

/**
 * Runs each case in a child process. A case whose process dies without
 * reporting is recorded as crashed; the remaining cases run in a new one.
 */
async function runIsolated(
  { section, cases, type }: TestSection,
  fwName: string
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  let pending = Object.keys(cases);
  while (pending.length) {
    Object.assign(results, await runIsolatedOnce(section, fwName, pending));
    const crashed = pending.find((name) => !(name in results));
    if (crashed === undefined) break;
    results[crashed] = crashResult(type);
    pending = pending.slice(pending.indexOf(crashed) + 1);
  }
  return results;
}

for (const suiteSection of testSuite) {
  const { section, cases, type, mayNotTerminate } = suiteSection;
  const testNames = Object.keys(cases);
  const results: Record<string, Record<string, string>> = {};

  describe(section, () => {
    if (mayNotTerminate) {
      beforeAll(async () => {
        await Promise.all(
          frameworks.map(async (fw) => {
            results[fw.name!] = await runIsolated(suiteSection, fw.name!);
          })
        );
      }, 300_000);
    }

    for (const fw of frameworks) {
      const fwName = fw.name!;
      if (!mayNotTerminate) results[fwName] = {};
      for (const [name, fn] of Object.entries(cases)) {
        test(`${fwName} > ${name}`, () => {
          if (!mayNotTerminate) results[fwName][name] = runCase(fw, fn, type);
        });
      }
    }

    afterAll(() => {
      mkdirSync(resultDir, { recursive: true });
      const data: any = { section, testNames, results };
      if (type) data.type = type;
      writeFileSync(
        join(resultDir, `${section.replace(/[^a-zA-Z0-9]+/g, "_")}.json`),
        JSON.stringify(data)
      );
    });
  });
}
