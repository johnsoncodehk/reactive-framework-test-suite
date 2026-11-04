import type { ReactiveFramework } from "../../src/framework.ts";
import {
  signal,
  computed,
  effect,
  effectScope,
  startBatch,
  endBatch,
  setActiveSub,
} from "alien-signals";
export const alienSignalsFramework: ReactiveFramework = {
  name: "alien-signals",
  effectCleanup: true,
  signal(initialValue) {
    const s = signal(initialValue);
    return {
      read: () => s(),
      write: (v) => s(v),
    };
  },
  computed(fn) {
    const c = computed(fn);
    return { read: () => c() };
  },
  effect(fn) {
    return effect(fn);
  },
  run(fn) {
    effectScope(fn)();
  },
  batch(fn) {
    startBatch();
    try {
      fn();
    } finally {
      endBatch();
    }
  },
  untracked(fn) {
    const prev = setActiveSub(undefined);
    try {
      return fn();
    } finally {
      setActiveSub(prev);
    }
  },
};
