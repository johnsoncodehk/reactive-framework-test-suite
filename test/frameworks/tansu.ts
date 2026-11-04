import type { ReactiveFramework } from "../../src/framework.ts";
import { writable, computed, derived, get, batch, untrack } from "@amadeus-it-group/tansu";

export const tansuFramework: ReactiveFramework = {
  name: "tansu",
  signal(initialValue) {
    const w = writable(initialValue);
    return {
      read: () => get(w),
      write: (v) => w.set(v),
    };
  },
  computed(fn) {
    const d = computed(fn);
    return { read: () => get(d) };
  },
  effect(fn) {
    const d = computed(fn);
    const unsub = d.subscribe(() => {});
    return unsub;
  },
  run(fn) {
    fn();
  },
  batch(fn) {
    batch(fn);
  },
  untracked(fn) {
    return untrack(fn);
  },
};
