export type { ReactiveFramework, Signal, Computed } from "./framework.js";
export { SkipTest, detectCapabilities, hasEffectCleanup, hasComputedThrows } from "./framework.js";
export { expect, setExpect } from "./assert.js";

import type { ReactiveFramework } from "./framework.js";

import * as graphPropagation from "./graphPropagation.js";
import * as dynamicDeps from "./dynamicDeps.js";
import * as computedEval from "./computedEval.js";
import * as equality from "./equality.js";
import * as effectLifecycle from "./effectLifecycle.js";
import * as nestedEffects from "./nestedEffects.js";
import * as innerWrite from "./innerWrite.js";
import * as cycleDetection from "./cycleDetection.js";
import * as batching from "./batching.js";
import * as untracked from "./untracked.js";
import * as errorHandling from "./errorHandling.js";
import * as staleEvaluation from "./staleEvaluation.js";
import * as memoryGc from "./memoryGc.js";
import * as behaviorDifferences from "./behaviorDifferences.js";

export interface TestSection {
  section: string;
  cases: Record<string, (fw: ReactiveFramework) => any>;
  type?: "behavioral";
}

export const testSuite: TestSection[] = [
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
  { ...behaviorDifferences, type: "behavioral" },
];
