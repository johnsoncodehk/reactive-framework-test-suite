import type { ReactiveFramework } from "../../src/framework.ts";
// @ts-ignore
import * as $ from "svelte/internal/client";

export const svelteFramework: ReactiveFramework = {
  name: "svelte",
  effectCleanup: true,
  signal(initialValue) {
    const s = $.state(initialValue);
    return {
      read: () => $.get(s),
      write: (v) => {
        $.set(s, v);
        $.flush();
      },
    };
  },
  computed(fn) {
    const c = $.derived(() => fn());
    return { read: () => $.get(c) };
  },
  effect(fn) {
    let dispose!: () => void;
    const destroy = $.effect_root(() => {
      $.render_effect(fn);
    });
    return destroy;
  },
  run(fn) {
    const destroy = $.effect_root(() => {
      fn();
    });
    $.flush();
    destroy();
  },
  untracked(fn) {
    return $.untrack(fn);
  },
};
