import type { ReactiveFramework } from "../../src/framework.js";
import {
  createSignal,
  createMemo,
  createEffect,
  createRoot,
  flushSync,
  untrack,
} from "@solidjs/signals";

let batchDepth = 0;

function safeFlush() {
  if (batchDepth > 0) return;
  try {
    flushSync();
  } catch {}
}

export const xReactivityFramework: ReactiveFramework = {
  name: "@solidjs/signals",
  signal(initialValue) {
    const [read, write] = createSignal(initialValue as any);
    return {
      read: read as () => typeof initialValue,
      write: (v) => {
        (write as any)(v);
        safeFlush();
      },
    };
  },
  computed(fn) {
    return { read: createMemo(fn) as () => ReturnType<typeof fn> };
  },
  effect(fn) {
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      // @ts-ignore — runtime accepts 1 arg, types require 2
      createEffect(fn);
      safeFlush();
    });
    return dispose;
  },
  run(fn) {
    createRoot((dispose) => {
      fn();
      safeFlush();
      dispose();
    });
  },
  batch(fn) {
    batchDepth++;
    try {
      fn();
    } finally {
      batchDepth--;
      safeFlush();
    }
  },
  untracked(fn) {
    return untrack(fn);
  },
};
