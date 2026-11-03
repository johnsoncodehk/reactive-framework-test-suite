import type { ReactiveFramework } from "../../src/framework.js";
// Must import from dist/solid.cjs to get the client reactive runtime.
// The default "solid-js" resolves to server build under Node condition,
// which lacks the reactive runtime.
// @ts-ignore
import {
  createSignal,
  createMemo,
  createComputed,
  createRoot,
  batch,
  untrack,
  onCleanup,
} from "solid-js/dist/solid.cjs";

let effectDepth = 0;

export const solidFramework: ReactiveFramework = {
  name: "solid-js",
  signal(initialValue) {
    const [read, write] = createSignal(initialValue);
    return {
      read: read as () => typeof initialValue,
      write,
    };
  },
  computed(fn) {
    return { read: createMemo(fn) };
  },
  effect(fn) {
    let disposed = false;
    const body = () => {
      if (disposed) return;
      effectDepth++;
      try {
        const cleanup = fn();
        if (typeof cleanup === "function") {
          onCleanup(cleanup);
        }
      } finally {
        effectDepth--;
      }
    };
    // An effect created inside another effect becomes a child computation,
    // so Solid's own ownership disposes it when the parent re-runs or is disposed.
    if (effectDepth > 0) {
      createComputed(body);
      return () => {
        disposed = true;
      };
    }
    let dispose!: () => void;
    createRoot((d: () => void) => {
      dispose = d;
      createComputed(body);
    });
    return dispose;
  },
  run(fn) {
    createRoot((dispose: () => void) => {
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
