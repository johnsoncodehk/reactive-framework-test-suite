import type { ReactiveFramework } from "../../src/framework.ts";
import {
  signal,
  computed,
  effect,
  batch,
  untracked,
} from "@preact/signals-core";

export const preactSignalsFramework: ReactiveFramework = {
  name: "@preact/signals-core",
  effectCleanup: true,
  signal(initialValue) {
    const s = signal(initialValue);
    return {
      read: () => s.value,
      write: (v) => (s.value = v),
    };
  },
  computed(fn) {
    const c = computed(fn);
    return { read: () => c.value };
  },
  effect(fn) {
    return effect(fn);
  },
  run(fn) {
    fn();
  },
  batch(fn) {
    batch(fn);
  },
  untracked(fn) {
    return untracked(fn);
  },
};
