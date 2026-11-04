import type { ReactiveFramework } from "../../src/framework.ts";
import { reactive, stabilize } from "@reactively/core";

let tracked: any[] = [];
let stabilizing = false;

// stabilize() is not reentrant: a nested call re-runs the effect that is
// currently executing. Effects queued during a pass are run by that pass.
function flush() {
  if (stabilizing) return;
  stabilizing = true;
  try {
    stabilize();
  } finally {
    stabilizing = false;
  }
}

export const reactivelyFramework: ReactiveFramework = {
  name: "@reactively/core",
  signal(initialValue) {
    const r = reactive(initialValue);
    tracked.push(r);
    return {
      read: () => r.value,
      write: (v) => {
        r.value = v;
        flush();
      },
    };
  },
  computed(fn) {
    const r = reactive(fn);
    tracked.push(r);
    return { read: () => r.value };
  },
  effect(fn) {
    const r = reactive(fn, { effect: true });
    tracked.push(r);
    flush();
    return () => {
      (r as any).effect = false;
      (r as any).removeParentObservers();
    };
  },
  run(fn) {
    try {
      fn();
    } finally {
      for (const r of tracked) {
        (r as any).effect = false;
        (r as any).state = 0;
        try { (r as any).removeParentObservers(); } catch {}
      }
      tracked = [];
      stabilizing = false;
      try { stabilize(); } catch {}
    }
  },
};
