// Entry of the process `runSuite` runs a `mayNotTerminate` section in.
// Argument: JSON { module, export, section, ids }. Writes "ready" once
// loaded, then one JSON line [id, result] per case, synchronously, so
// results before a crash are not lost.
import { writeSync } from "node:fs";
import { correctness, behaviors, runCase, runProbe } from "../index.ts";
import { loadAdapter } from "./load.ts";

const RESULT_FD = 3;

const { module, export: name, section: sectionName, ids } = JSON.parse(process.argv[2]!);
const fw = await loadAdapter({ module, export: name });
const section = correctness.find((s) => s.name === sectionName);
if (!section && sectionName !== behaviors.name) throw new Error(`unknown section: ${sectionName}`);
const run = section
  ? (id: number) => runCase(fw, find(section.cases, id))
  : (id: number) => runProbe(fw, find(behaviors.cases, id));

writeSync(RESULT_FD, "ready\n");
for (const id of ids as number[]) {
  writeSync(RESULT_FD, JSON.stringify([id, run(id)]) + "\n");
}

// Some libraries leave handles open; the parent waits for exit.
process.exit(0);

function find<C extends { id: number }>(cases: readonly C[], id: number): C {
  const c = cases.find((c) => c.id === id);
  if (!c) throw new Error(`unknown case: ${sectionName} #${id}`);
  return c;
}
