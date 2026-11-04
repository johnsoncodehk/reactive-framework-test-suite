import type { ReactiveFramework } from "../../src/framework.ts";
// Pota's main entry loads CustomElement.js which references HTMLElement at
// module load. Import from the reactive submodule to keep this Node-friendly.
// @ts-ignore — types only resolve from the main entry
import * as pota from "pota/src/lib/reactivity/primitives/solid.js";
const { signal: createSignal, memo, renderEffect, batch, root, cleanup, untrack } = pota as any;

let effectDepth = 0;
let runDisposers: (() => void)[] | null = null;

export const potaFramework: ReactiveFramework = {
  name: "pota",
  effectCleanup: true,
  signal(initialValue) {
    const [read, write] = createSignal(initialValue);
    return { read, write };
  },
  computed(fn) {
    return { read: memo(fn) };
  },
  effect(fn) {
    const body = () => {
      effectDepth++;
      try {
        const cl = fn();
        if (typeof cl === "function") {
          cleanup(cl);
        }
      } finally {
        effectDepth--;
      }
    };
    // An effect created inside another effect becomes a child computation,
    // so pota's own ownership disposes it when the parent re-runs or is disposed.
    if (effectDepth > 0) {
      renderEffect(body);
      return () => {
        throw new Error(
          "pota has no public API to dispose a child computation on its own; it is disposed with its parent"
        );
      };
    }
    let dispose!: () => void;
    root((d: () => void) => {
      dispose = d;
      renderEffect(body);
    });
    runDisposers?.push(dispose);
    return dispose;
  },
  run(fn) {
    // Not run inside root(): solid-js (which pota wraps) defers render
    // effects queued during a root's initialization until it returns,
    // which would hold back every effect re-run for the whole test.
    const disposers: (() => void)[] = [];
    runDisposers = disposers;
    try {
      fn();
    } finally {
      runDisposers = null;
      for (const d of disposers) d();
    }
  },
  batch(fn) {
    batch(fn);
  },
  untracked(fn) {
    return untrack(fn);
  },
};
