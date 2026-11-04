import type { ReactiveFramework } from "../../src/framework.ts";
import {
  observable,
  computed,
  autorun,
  runInAction,
  transaction,
  untracked,
} from "mobx";

export const mobxFramework: ReactiveFramework = {
  name: "mobx",
  signal(initialValue) {
    const o = observable.box(initialValue);
    return {
      read: () => o.get(),
      write: (v) => runInAction(() => o.set(v)),
    };
  },
  computed(fn) {
    const c = computed(fn);
    return { read: () => c.get() };
  },
  effect(fn) {
    return autorun(fn);
  },
  run(fn) {
    fn();
  },
  batch(fn) {
    transaction(fn);
  },
  untracked(fn) {
    return untracked(fn);
  },
};
