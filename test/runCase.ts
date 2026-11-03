import type { ReactiveFramework } from "../src/framework.js";
import { SkipTest } from "../src/framework.js";
import type { TestSection } from "../src/index.js";

export function runCase(
  fw: ReactiveFramework,
  fn: (fw: ReactiveFramework) => any,
  type: TestSection["type"]
): string {
  try {
    let result: any;
    fw.run(() => {
      result = fn(fw);
    });
    return type === "behavioral" ? result : "✅";
  } catch (e) {
    if (e instanceof SkipTest) return "⬜";
    return type === "behavioral" ? "error" : "❌";
  }
}

/** The result recorded for a case whose process died (out of memory, crash). */
export function crashResult(type: TestSection["type"]): string {
  return type === "behavioral" ? "error" : "❌";
}
