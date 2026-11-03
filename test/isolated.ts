// Child process entry for sections declaring `mayNotTerminate`.
// Usage: isolated.ts <section> <framework> <case>...
// Writes "ready" once loaded, then one JSON line [case, result] per finished
// case, synchronously, so results before a crash are not lost. Uses fd 3:
// libraries under test print to stdout.
import { writeSync } from "fs";
import { frameworks } from "./frameworks/index.js";
import { testSuite } from "../src/index.js";
import { runCase } from "./runCase.js";

const RESULT_FD = 3;

const [sectionName, fwName, ...caseNames] = process.argv.slice(2);
const section = testSuite.find((s) => s.section === sectionName);
const fw = frameworks.find((f) => f.name === fwName);
if (!section || !fw) {
  throw new Error(`unknown section or framework: ${sectionName} / ${fwName}`);
}

writeSync(RESULT_FD, "ready\n");

for (const name of caseNames) {
  const fn = section.cases[name];
  if (!fn) throw new Error(`unknown case: ${name}`);
  writeSync(RESULT_FD, JSON.stringify([name, runCase(fw, fn, section.type)]) + "\n");
}

// Some adapters leave handles open; the parent waits for exit.
process.exit(0);
