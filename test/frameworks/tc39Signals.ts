import type { ReactiveFramework } from "../../src/framework.ts";
import { Signal } from "signal-polyfill";

let needsEnqueue = true;

const w = new Signal.subtle.Watcher(() => {
  if (needsEnqueue) {
    needsEnqueue = false;
    queueMicrotask(processPending);
  }
});

function processPending() {
  needsEnqueue = true;
  for (const s of w.getPending()) {
    try {
      s.get();
    } catch {}
  }
  w.watch();
}

export const tc39SignalsFramework: ReactiveFramework = {
  name: "signal-polyfill (TC39)",
  effectCleanup: true,
  signal(initialValue) {
    const s = new Signal.State(initialValue);
    return {
      read: () => s.get(),
      write: (v) => {
        s.set(v);
        processPending();
      },
    };
  },
  computed(fn) {
    const c = new Signal.Computed(fn);
    return { read: () => c.get() };
  },
  effect(fn) {
    let cleanup: (() => void) | void;
    const c = new Signal.Computed(() => {
      if (typeof cleanup === "function") cleanup();
      cleanup = fn() as (() => void) | void;
    });
    w.watch(c);
    c.get();
    return () => {
      w.unwatch(c);
      if (typeof cleanup === "function") cleanup();
    };
  },
  run(fn) {
    fn();
  },
  untracked(fn) {
    return Signal.subtle.untrack(fn);
  },
};
