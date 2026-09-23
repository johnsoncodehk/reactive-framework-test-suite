import type { ReactiveFramework } from "../../src/framework.js";
import {
  abortVar,
  atom,
  batch,
  computed,
  context,
  effect,
  peek,
} from "@reatom/core";

export const reatomFramework: ReactiveFramework = {
  name: "@reatom/core",
  signal<T>(initialValue: T) {
    const stateAtom = atom(initialValue);
    return {
      read() {
        return stateAtom();
      },
      write(next: T) {
        batch(() => stateAtom.set(next), true);
      },
    };
  },
  computed<T>(fn: () => T) {
    const derived = computed(() => batch(fn));
    return { read: derived };
  },
  effect(fn: () => void | (() => void)) {
    const instance = effect(() => {
      const maybeCleanup = batch(fn);
      if (typeof maybeCleanup === "function") {
        // Reatom runs cleanups as AbortSignal listeners, so a throwing cleanup
        // never reaches the caller; Node would instead report it as an
        // uncaught exception after the test has finished.
        abortVar.subscribe(() => {
          try {
            maybeCleanup();
          } catch (e) {
            console.error(e);
          }
        });
      }
    });

    return instance.unsubscribe;
  },
  batch(fn: () => void) {
    batch(fn, true);
  },
  run(fn) {
    try {
      context.start(fn);
    } finally {
      context.reset();
    }
  },
  untracked: peek,
};
