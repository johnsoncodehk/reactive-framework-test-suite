export type { ReactiveFramework, Signal, Computed } from "./framework.ts";
export { SkipTest } from "./framework.ts";
export type { TestCase, Probe, Section, CaseResult, ProbeResult } from "./suite.ts";
export { runCase, runProbe } from "./suite.ts";

import type { Section, TestCase, Probe } from "./suite.ts";
import * as graphPropagation from "./graphPropagation.ts";
import * as dynamicDeps from "./dynamicDeps.ts";
import * as computedEval from "./computedEval.ts";
import * as equality from "./equality.ts";
import * as effectLifecycle from "./effectLifecycle.ts";
import * as nestedEffects from "./nestedEffects.ts";
import * as innerWrite from "./innerWrite.ts";
import * as cycleDetection from "./cycleDetection.ts";
import * as batching from "./batching.ts";
import * as untracked from "./untracked.ts";
import * as errorHandling from "./errorHandling.ts";
import * as staleEvaluation from "./staleEvaluation.ts";
import * as memoryGc from "./memoryGc.ts";
import * as behaviorDifferences from "./behaviorDifferences.ts";

export const correctness: readonly Section<TestCase>[] = [
  graphPropagation,
  dynamicDeps,
  computedEval,
  equality,
  effectLifecycle,
  nestedEffects,
  innerWrite,
  cycleDetection,
  batching,
  untracked,
  errorHandling,
  staleEvaluation,
  memoryGc,
];

export const behaviors: Section<Probe> = behaviorDifferences;
