import type { ReactiveFramework } from "../../src/framework.js";
import { signal, computed, untracked } from "@angular/core";
import { createWatch, type Watch } from "@angular/core/primitives/signals";

let queue = new Set<Watch>();

function flushEffects(): void {
  for (const watch of queue) {
    queue.delete(watch);
    watch.run();
  }
}

export const angularSignalsFramework: ReactiveFramework = {
  name: "@angular/core",
  signal(initialValue) {
    const s = signal(initialValue);
    return {
      read: () => s(),
      write: (v) => {
        s.set(v);
        flushEffects();
      },
    };
  },
  computed(fn) {
    const c = computed(fn);
    return { read: () => c() };
  },
  effect(fn) {
    let cleanup: (() => void) | void;
    const w = createWatch(
      () => {
        if (typeof cleanup === "function") cleanup();
        cleanup = fn() as (() => void) | void;
      },
      () => {
        queue.add(w);
      },
      true
    );
    w.run();
    return () => {
      w.destroy();
      const c = cleanup;
      cleanup = undefined;
      if (typeof c === "function") c();
    };
  },
  run(fn) {
    fn();
  },
  untracked(fn) {
    return untracked(fn);
  },
};
