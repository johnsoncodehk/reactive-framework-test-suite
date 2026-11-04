import { test, expect } from "vitest";
import { runSuite } from "../src/node/index.ts";

test("alien-signals passes every correctness case", async () => {
  const results = await runSuite({
    module: new URL("./frameworks/alienSignals.ts", import.meta.url),
    export: "alienSignalsFramework",
  });
  const failed = results.correctness.filter((r) => r.result.status === "fail");
  expect(failed).toEqual([]);
}, 300_000);
