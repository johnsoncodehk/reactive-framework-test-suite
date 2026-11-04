import { test, expect, afterAll } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { adapters } from "./frameworks/index.ts";
import { correctness, behaviors, type Section } from "../src/index.ts";
import { runSuite, type SuiteResults } from "../src/node/index.ts";

const resultDir = join(import.meta.dirname, "..", ".test-results");
const byFramework: Record<string, SuiteResults> = {};

test("case ids are unique across the suite", () => {
  const ids = [...correctness, behaviors].flatMap((s) => s.cases.map((c) => c.id));
  expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);
});

for (const adapter of adapters) {
  test.concurrent(adapter.export, async () => {
    const fw = (await import((adapter.module as URL).href))[adapter.export];
    byFramework[fw.name] = await runSuite(adapter);
  }, 300_000);
}

afterAll(() => {
  mkdirSync(resultDir, { recursive: true });
  const write = (
    kind: "correctness" | "behaviors",
    section: Section<{ id: number; title: string; variants?: readonly string[] }>
  ) => {
    const results: Record<string, Record<number, unknown>> = {};
    for (const [fw, r] of Object.entries(byFramework)) {
      results[fw] = {};
      for (const rec of r[kind]) {
        if (rec.section === section.name) results[fw][rec.id] = rec.result;
      }
    }
    const cases = section.cases.map(({ id, title, variants }) => ({ id, title, variants }));
    writeFileSync(
      join(resultDir, `${section.name.replace(/[^a-zA-Z0-9]+/g, "_")}.json`),
      JSON.stringify({ section: section.name, kind, cases, results })
    );
  };
  for (const s of correctness) write("correctness", s);
  write("behaviors", behaviors);
});
