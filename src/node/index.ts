import { spawn } from "node:child_process";
import { extname } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactiveFramework } from "../framework.ts";
import type { CaseResult, ProbeResult, Section, TestCase, Probe } from "../suite.ts";
import { correctness, behaviors, runCase, runProbe } from "../index.ts";
import { loadAdapter } from "./load.ts";

/** Fixed rather than V8's machine-dependent default, so results don't depend on the machine. */
const ISOLATED_HEAP_MB = 1024;

export interface AdapterModule {
  /** Module that exports the adapter, e.g. `new URL("./adapter.ts", import.meta.url)`. */
  module: string | URL;
  /** Name of the export holding the `ReactiveFramework`. */
  export: string;
  /**
   * Node flags the module needs to load (loaders, `--conditions`). Applies
   * to the separate processes `mayNotTerminate` sections run in.
   * Defaults to `process.execArgv`.
   */
  execArgv?: readonly string[];
}

export interface CaseRecord {
  section: string;
  id: number;
  result: CaseResult;
}

export interface ProbeRecord {
  section: string;
  id: number;
  result: ProbeResult;
}

export interface SuiteResults {
  correctness: CaseRecord[];
  behaviors: ProbeRecord[];
}

export async function runSuite(adapter: AdapterModule): Promise<SuiteResults> {
  const fw = await loadAdapter(adapter);
  const results: SuiteResults = { correctness: [], behaviors: [] };
  for (const section of correctness) {
    results.correctness.push(...(await runSection(adapter, fw, section, runCase)));
  }
  results.behaviors.push(...(await runSection(adapter, fw, behaviors, runProbe)));
  return results;
}

async function runSection<C extends TestCase | Probe, R extends CaseResult | ProbeResult>(
  adapter: AdapterModule,
  fw: ReactiveFramework,
  section: Section<C>,
  run: (fw: ReactiveFramework, c: C) => R
): Promise<{ section: string; id: number; result: R }[]> {
  if (!section.mayNotTerminate) {
    return section.cases.map((c) => ({ section: section.name, id: c.id, result: run(fw, c) }));
  }
  const results = new Map<number, R>();
  let pending = section.cases.map((c) => c.id);
  while (pending.length) {
    for (const [id, result] of await runIsolated<R>(adapter, section.name, pending)) {
      results.set(id, result);
    }
    const crashed = pending.find((id) => !results.has(id));
    if (crashed === undefined) break;
    results.set(crashed, { status: "fail", error: "process died (out of memory or crash)" } as R);
    pending = pending.slice(pending.indexOf(crashed) + 1);
  }
  return section.cases.map((c) => ({ section: section.name, id: c.id, result: results.get(c.id)! }));
}

/**
 * Runs cases in one child process. Results arrive one line per case on
 * fd 3, since libraries under test may print to stdout. Results before
 * the child dies are kept.
 */
function runIsolated<R>(
  adapter: AdapterModule,
  section: string,
  ids: number[]
): Promise<[number, R][]> {
  const self = new URL(import.meta.url);
  const child = fileURLToPath(new URL(`./child${extname(self.pathname)}`, self));
  const module = adapter.module instanceof URL ? adapter.module.href : adapter.module;
  return new Promise((resolve, reject) => {
    const proc = spawn(
      process.execPath,
      [
        ...(adapter.execArgv ?? process.execArgv),
        `--max-old-space-size=${ISOLATED_HEAP_MB}`,
        child,
        JSON.stringify({ module, export: adapter.export, section, ids }),
      ],
      { stdio: ["ignore", "ignore", "pipe", "pipe"] }
    );
    const results: [number, R][] = [];
    let ready = false;
    let buffered = "";
    let stderr = "";
    proc.stdio[3]!.on("data", (chunk) => {
      buffered += chunk;
      const lines = buffered.split("\n");
      buffered = lines.pop()!;
      for (const line of lines) {
        if (line === "ready") ready = true;
        else results.push(JSON.parse(line));
      }
    });
    proc.stderr!.on("data", (chunk) => {
      stderr += chunk;
    });
    proc.on("error", reject);
    proc.on("close", () => {
      if (!ready) reject(new Error(`isolated runner failed to start for ${module}:\n${stderr}`));
      else resolve(results);
    });
  });
}
