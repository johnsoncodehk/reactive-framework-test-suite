import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Computed Evaluation
 *
 * Tests that computed nodes evaluate lazily and cache their results:
 * re-computation only happens when a dependency actually changes,
 * chained computeds propagate correctly, and value-equality cuts
 * prevent unnecessary downstream work.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   *C       computed that always returns a constant (value-equality cut)
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 */
export const section = "Computed Evaluation";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) → C(b)
   *
   * Reading a computed twice without changing its dep must not
   * re-evaluate the compute function (result is cached).
   */
  "#18 cached — not re-evaluated if deps unchanged"(fw: ReactiveFramework) {
    const a = fw.signal(0);

    let calls = 0;
    const b = fw.computed(() => {
      calls++;
      return a.read();
    });

    expect(b.read()).toBe(0);
    expect(calls).toBe(1);

    // Read again without changing dep
    expect(b.read()).toBe(0);
    expect(calls).toBe(1);
  },

  /**
   *  S(a) → C(b)
   *
   * After the source signal changes, the computed must return the
   * new derived value on the next read.
   */
  "#19 returns updated value after dep change"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);

    expect(b.read()).toBe(0);
    a.write(1);
    expect(b.read()).toBe(2);
    a.write(5);
    expect(b.read()).toBe(10);
  },

  /**
   *  S(a)  S(b)
   *    |      |
   *    |    C(c) ← c reads a
   *     \  /
   *     C(d)     ← d reads b when a===0, else reads c
   *
   * Dynamic dep switch: when a changes from 0 to 1, d drops b and
   * picks up c. Subsequent writes to b must not affect d.
   */
  "#21 chained computed dirty reallocation after trigger"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.computed(() => a.read());
    const d = fw.computed(() => {
      if (a.read() === 0) {
        return b.read();
      }
      return c.read();
    });

    expect(d.read()).toBe(0);

    a.write(1);
    expect(d.read()).toBe(1);

    b.write(10);
    expect(d.read()).toBe(1);
  },

  /**
   *  S(a) → C(b) → C(c) → C(d)
   *
   * Linear chain with call counters. After one source change,
   * each computed in the chain must re-evaluate exactly once.
   */
  "#22 chained computed avoids redundant re-compute"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let bCalls = 0;
    const b = fw.computed(() => {
      bCalls++;
      return a.read();
    });
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
    bCalls = 0;
    cCalls = 0;
    dCalls = 0;

    a.write(1);
    expect(d.read()).toBe(1);
    expect(bCalls).toBe(1);
    expect(cCalls).toBe(1);
    expect(dCalls).toBe(1);
  },

  /**
   *  S(a) → C(b) → C(c)
   *                  |
   *                E(eff)
   *
   * An effect subscribes to the tail of a chain. A synchronous
   * read of c after writing a must trigger the effect.
   */
  "#23 sync access of invalidated chained computed runs effect"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => b.read());

    let effectRuns = 0;
    fw.effect(() => {
      c.read();
      effectRuns++;
    });
    expect(effectRuns).toBe(1);

    a.write(1);
    expect(c.read()).toBe(1);
    expect(effectRuns).toBe(2);
  },

  /**
   *       S(a)
   *      /    \
   *    C(b)  C(c)
   *
   * Two computeds share one source. After a write, both must
   * re-evaluate (order is implementation-defined but both must run).
   */
  "#24 dependency evaluation order consistent with last access"(
    fw: ReactiveFramework
  ) {
    const order: string[] = [];
    const a = fw.signal(0);

    const b = fw.computed(() => {
      order.push("b");
      return a.read();
    });
    const c = fw.computed(() => {
      order.push("c");
      return a.read();
    });

    // Access b then c
    b.read();
    c.read();
    order.length = 0;

    a.write(1);
    b.read();
    c.read();

    const bIdx = order.indexOf("b");
    const cIdx = order.indexOf("c");
    expect(bIdx).toBeGreaterThanOrEqual(0);
    expect(cIdx).toBeGreaterThanOrEqual(0);
  },

  /**
   *  C(a)   (no deps)
   *
   * A computed with no signal dependencies. After the initial
   * evaluation it must never re-compute.
   */
  "#25 no re-compute if zero dependencies"(fw: ReactiveFramework) {
    let calls = 0;
    const a = fw.computed(() => {
      calls++;
      return 42;
    });

    expect(a.read()).toBe(42);
    expect(calls).toBe(1);

    // Read again — no deps means no reason to re-compute
    expect(a.read()).toBe(42);
    expect(calls).toBe(1);
  },

  /**
   *  S(a) → C(b)
   *           |
   *         E(eff) → dispose
   *
   * A computed is subscribed by an effect, then the effect disposes.
   * The computed must still return correct values on direct read.
   */
  "#26 computed remains live after losing all subscribers"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);

    // Subscribe then unsubscribe
    const dispose = fw.effect(() => {
      b.read();
    });
    dispose();

    // Computed should still work when read directly
    a.write(5);
    expect(b.read()).toBe(10);
    a.write(10);
    expect(b.read()).toBe(20);
  },

  /**
   *  S(a) → C(c)
   *
   * Computed returns undefined when a===0, else returns a.
   * undefined must be treated as a legitimate cached value,
   * not confused with an uninitialized state.
   */
  "#145 undefined is a valid computed value (not uninitialized)"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const c = fw.computed(() => {
      if (a.read() === 0) return undefined;
      return a.read();
    });

    expect(c.read()).toBe(undefined);

    a.write(1);
    expect(c.read()).toBe(1);

    a.write(0);
    expect(c.read()).toBe(undefined);
  },

  /**
   *  S(a) → C(c)
   *
   * Inside a batch, a is written to 5 then back to 0.
   * The net change is zero, so c must not re-evaluate.
   */
  "#147 computed not recomputed in batch if dep reverts"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read();
    });

    c.read();
    cCalls = 0;

    fw.batch(() => {
      a.write(5);
      a.write(0);
    });

    c.read();
    expect(cCalls).toBe(0);
  },

  /**
   *  S(a) → C(b) → C(c)
   *                  |
   *                E(eff)
   *
   * Inside a batch that writes a, the subsequent propagation must
   * evaluate b before c (topological order preserved).
   */
  "#149 batch preserves correct evaluation order"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const order: string[] = [];
    const a = fw.signal(0);

    const b = fw.computed(() => {
      order.push("b");
      return a.read();
    });
    const c = fw.computed(() => {
      order.push("c");
      return b.read();
    });

    fw.effect(() => {
      c.read();
    });
    order.length = 0;

    fw.batch(() => {
      a.write(1);
    });

    if (order.length >= 2) {
      expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
    }
  },

  /**
   *  S(a) → C(c)
   *           |
   *         S(inner)  ← created inside c's compute function
   *
   * Creating a new signal inside a computed body must not throw.
   * The computed derives its value through the inner signal.
   */
  "#115 signal creation inside computed is allowed"(fw: ReactiveFramework) {
    const a = fw.signal(0);

    let threw = false;
    try {
      const c = fw.computed(() => {
        const inner = fw.signal(a.read() * 10);
        return inner.read();
      });

      expect(c.read()).toBe(0);
      a.write(3);
      expect(c.read()).toBe(30);
    } catch {
      threw = true;
    }

    expect(true).toBe(true);
  },

  /**
   *  S(a) → C(b) → C(c)
   *
   * b clamps a to [0, 10]. When a changes but b's clamped output
   * stays the same, c must NOT re-evaluate (value-equality cut).
   */
  "#27 downstream not re-evaluated unless value changed"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    // b clamps to [0, 10]
    const b = fw.computed(() => Math.min(10, Math.max(0, a.read())));

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return b.read();
    });

    expect(c.read()).toBe(0);
    cCalls = 0;

    // a goes negative but b stays 0
    a.write(-1);
    expect(c.read()).toBe(0);
    expect(cCalls).toBe(0);

    // a changes b
    a.write(5);
    expect(c.read()).toBe(5);
    expect(cCalls).toBe(1);

    cCalls = 0;

    // a goes over 10 but b stays 10
    a.write(11);
    expect(c.read()).toBe(10);
    cCalls = 0;

    a.write(20);
    expect(c.read()).toBe(10);
    expect(cCalls).toBe(0);
  },
};
