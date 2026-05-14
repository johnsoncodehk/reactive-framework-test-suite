import type { ReactiveFramework } from "../../src/framework.js";
import {
  ref,
  computed,
  ReactiveEffect,
  pauseTracking,
  resetTracking,
  onEffectCleanup,
} from "@vue/reactivity";

// @vue/reactivity has no public batch API — startBatch/endBatch exist
// internally but aren't exported. Implement batching here by intercepting
// each effect's scheduler: queue triggers while batch depth > 0, flush
// on the outermost batch end.
let batchDepth = 0;
const queued = new Set<ReactiveEffect>();

function flush() {
  if (queued.size === 0) return;
  const effects = [...queued];
  queued.clear();
  for (const e of effects) {
    if (e.dirty) e.run();
  }
}

export const vueReactivityFramework: ReactiveFramework = {
  name: "@vue/reactivity",
  signal(initialValue) {
    const r = ref(initialValue);
    return {
      read: () => r.value as typeof initialValue,
      write: (v) => {
        r.value = v as any;
      },
    };
  },
  computed(fn) {
    const c = computed(fn);
    return { read: () => c.value };
  },
  effect(fn) {
    const e = new ReactiveEffect(() => {
      const cleanup = fn();
      if (typeof cleanup === "function") {
        onEffectCleanup(cleanup);
      }
    });
    e.scheduler = () => {
      if (batchDepth > 0) {
        queued.add(e);
      } else if (e.dirty) {
        e.run();
      }
    };
    e.run();
    return () => e.stop();
  },
  run(fn) {
    fn();
  },
  untracked(fn) {
    pauseTracking();
    try {
      return fn();
    } finally {
      resetTracking();
    }
  },
  batch(fn) {
    batchDepth++;
    try {
      fn();
    } finally {
      batchDepth--;
      if (batchDepth === 0) {
        flush();
      }
    }
  },
};
