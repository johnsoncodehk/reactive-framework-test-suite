import type { ReactiveFramework } from "./framework.ts";
import { SkipTest } from "./framework.ts";

/** Asserts one behavior every valid design shares; throws when it doesn't hold. */
export interface TestCase {
  id: number;
  title: string;
  run(fw: ReactiveFramework): void;
}

/** Reports which of several valid designs a framework implements. */
export interface Probe {
  id: number;
  title: string;
  variants: readonly string[];
  run(fw: ReactiveFramework): string;
}

export interface Section<C> {
  name: string;
  cases: readonly C[];
  /**
   * Cases may run until their own guard trips, or exhaust memory first, in
   * a library that doesn't bound the behavior under test. `runSuite` from
   * `reactive-framework-test-suite/node` runs them in a separate process.
   */
  mayNotTerminate?: true;
}

export type CaseResult =
  | { status: "pass" }
  | { status: "fail"; error: string }
  | { status: "skip"; reason: string };

export type ProbeResult =
  | { status: "variant"; variant: string }
  | { status: "fail"; error: string }
  | { status: "skip"; reason: string };

export function runCase(fw: ReactiveFramework, c: TestCase): CaseResult {
  try {
    fw.run(() => c.run(fw));
  } catch (e) {
    return caught(e);
  }
  return { status: "pass" };
}

/** A value outside the probe's declared variants is a failure. */
export function runProbe(fw: ReactiveFramework, p: Probe): ProbeResult {
  let result: unknown;
  try {
    fw.run(() => {
      result = p.run(fw);
    });
  } catch (e) {
    return caught(e);
  }
  if (typeof result !== "string" || !p.variants.includes(result)) {
    return { status: "fail", error: `undeclared variant: ${JSON.stringify(result)}` };
  }
  return { status: "variant", variant: result };
}

function caught(e: unknown): Exclude<CaseResult, { status: "pass" }> {
  if (e instanceof SkipTest) return { status: "skip", reason: e.reason };
  return { status: "fail", error: e instanceof Error ? e.message : String(e) };
}
