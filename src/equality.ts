import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Equality & Same-Value Optimization
 *
 * Tests that the framework skips propagation when a signal is
 * written with the same value, or when a computed re-evaluates
 * but returns an identical result. Downstream nodes must not
 * re-evaluate when their inputs have not actually changed.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   *C       computed that always returns a constant (value-equality cut)
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 */
export const section = "Equality & Same-Value Optimization";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) → C(c)
   *
   * Writing the same primitive value to a signal must not cause
   * its downstream computed to re-evaluate.
   */
  "#28 same primitive value — no propagation"(fw: ReactiveFramework) {
    const a = fw.signal(1);

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read();
    });

    expect(c.read()).toBe(1);
    expect(cCalls).toBe(1);

    // Write same value
    a.write(1);
    expect(c.read()).toBe(1);
    expect(cCalls).toBe(1);
  },

  /**
   *  S(a) → *C(b) → C(c) → C(d)
   *
   * b clamps to 0 or 1. Once b stabilizes at 1, further changes
   * to a must not propagate past b — c and d stay untouched.
   */
  "#34 pruning stops at first unchanged node"(fw: ReactiveFramework) {
    // A → B → C → D
    // B always returns constant after first change
    const a = fw.signal(0);
    const b = fw.computed(() => (a.read() > 0 ? 1 : 0));

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return b.read();
    });

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return c.read();
    });

    expect(d.read()).toBe(0);
    cCalls = 0;
    dCalls = 0;

    a.write(1);
    expect(d.read()).toBe(1);
    cCalls = 0;
    dCalls = 0;

    // a changes but b still returns 1
    a.write(2);
    expect(d.read()).toBe(1);
    expect(cCalls).toBe(0);
    expect(dCalls).toBe(0);
  },

  /**
   *  S(s) → C(c1) → *C(c2) → E(eff)
   *
   * c2 always returns 5 regardless of c1. Even with an active
   * effect subscription, the effect must not re-run when s changes
   * because c2's value never changes.
   */
  "#169 live pruning: effect not re-run when intermediate computed returns same"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    const c1 = fw.computed(() => s.read());
    const c2 = fw.computed(() => {
      c1.read();
      return 5;
    });

    let runs = 0;
    fw.effect(() => {
      c2.read();
      runs++;
    });
    expect(runs).toBe(1);

    s.write(1);
    expect(runs).toBe(1);

    s.write(2);
    expect(runs).toBe(1);
  },

  /**
   *  S(a) → *C(b) → C(c)
   *
   * b always returns the same object reference regardless of a.
   * Existing equality tests (#28/#34) use primitive values; this
   * verifies the same value-cut behaviour for non-primitive output.
   * c must NOT re-evaluate because b's reference is unchanged.
   */
  "#220 computed same object reference — no downstream propagation"(
    fw: ReactiveFramework
  ) {
    const obj = { x: 1 };
    const a = fw.signal(0);
    const b = fw.computed(() => {
      a.read();
      return obj;
    });

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return b.read();
    });

    expect(c.read()).toBe(obj);
    cCalls = 0;

    a.write(1);
    expect(c.read()).toBe(obj);
    expect(cCalls).toBe(0);
  },
};
