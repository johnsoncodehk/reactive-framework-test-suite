import type { ReactiveFramework } from "../../src/framework.js";
// Pota's main entry loads CustomElement.js which references HTMLElement at
// module load. Import from the reactive submodule to keep this Node-friendly.
// @ts-ignore — types only resolve from the main entry
import * as pota from "pota/src/lib/reactivity/primitives/solid.js";
const { createSignal, memo, effect, batch, root, cleanup, untrack } = pota as any;

export const potaFramework: ReactiveFramework = {
  name: "pota",
  signal(initialValue) {
    const [read, write] = createSignal(initialValue);
    return { read, write };
  },
  computed(fn) {
    return { read: memo(fn) };
  },
  effect(fn) {
    effect(() => {
      const cl = fn();
      if (typeof cl === "function") {
        cleanup(cl);
      }
    });
    return () => {};
  },
  run(fn) {
    root((dispose: () => void) => {
      fn();
      dispose();
    });
  },
  batch(fn) {
    batch(fn);
  },
  untracked(fn) {
    return untrack(fn);
  },
};
