import type { ReactiveFramework } from "../../src/framework.ts";
import {
  signal as createSignal,
  c as globalFactory,
  root,
  batch as anodBatch,
} from "anod";

let currentCtx: { val: (s: any) => any } | undefined = undefined;
let currentFactory: any = globalFactory;

export const anodFramework: ReactiveFramework = {
  name: "anod",
  effectCleanup: true,
  signal(initialValue) {
    const s = createSignal(initialValue);
    return {
      read: () => (currentCtx ? currentCtx.val(s) : s.get()),
      write: (v) => s.set(v),
    };
  },
  computed(fn) {
    const comp = currentFactory.compute((ctx: any) => {
      const prevCtx = currentCtx;
      currentCtx = ctx;
      try {
        return fn();
      } finally {
        currentCtx = prevCtx;
      }
    });
    return {
      read: () => {
        if (currentCtx) return currentCtx.val(comp);
        const val = comp.get();
        if (comp.error) throw (val as any).error;
        return val;
      },
    };
  },
  effect(fn) {
    const eff = currentFactory.effect((ctx: any) => {
      const prevCtx = currentCtx;
      const prevFactory = currentFactory;
      currentCtx = ctx;
      currentFactory = ctx;
      try {
        const cleanup = fn();
        if (typeof cleanup === "function") {
          ctx.cleanup(cleanup);
        }
      } finally {
        currentCtx = prevCtx;
        currentFactory = prevFactory;
      }
    });
    return () => eff.dispose();
  },
  run(fn) {
    root((ctx) => {
      const prevFactory = currentFactory;
      currentFactory = ctx;
      try {
        fn();
      } finally {
        currentFactory = prevFactory;
      }
    });
  },
  batch(fn) {
    anodBatch(fn);
  },
  untracked(fn) {
    const prevCtx = currentCtx;
    currentCtx = undefined;
    try {
      return fn();
    } finally {
      currentCtx = prevCtx;
    }
  },
};
