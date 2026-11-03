import type { ReactiveFramework } from "../../src/framework.js";
import S from "s-js";

let effectDepth = 0;

export const sjsFramework: ReactiveFramework = {
  name: "S.js",
  signal(initialValue) {
    const s = S.data(initialValue);
    return {
      read: () => s(),
      write: (v) => s(v),
    };
  },
  computed(fn) {
    const c = S(fn);
    return { read: () => c() };
  },
  effect(fn) {
    const body = () => {
      effectDepth++;
      try {
        const cleanup = fn();
        if (typeof cleanup === "function") {
          S.cleanup(cleanup);
        }
      } finally {
        effectDepth--;
      }
    };
    // An effect created inside another effect becomes a child computation,
    // so S.js's own ownership disposes it when the parent re-runs or is disposed.
    if (effectDepth > 0) {
      S(body);
      return () => {
        throw new Error(
          "S.js has no public API to dispose a child computation on its own; it is disposed with its parent"
        );
      };
    }
    let dispose!: () => void;
    S.root((d: () => void) => {
      dispose = d;
      S(body);
    });
    return dispose;
  },
  run(fn) {
    S.root((dispose: () => void) => {
      fn();
      dispose();
    });
  },
  batch(fn) {
    S.freeze(fn);
  },
  untracked(fn) {
    return S.sample(fn);
  },
};
