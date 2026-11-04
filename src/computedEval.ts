import { expect } from "./assert.ts";
import type { ReactiveFramework } from "./framework.ts";
import type { TestCase } from "./suite.ts";
import { SkipTest } from "./framework.ts";

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
export const name = "Computed Evaluation";
export const cases: TestCase[] = [
  /**
   *  S(a) → C(b)
   *
   * Reading a computed twice without changing its dep must not
   * re-evaluate the compute function (result is cached).
   */
  {
    id: 18,
    title: "cached — not re-evaluated if deps unchanged",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(b)
   *
   * After the source signal changes, the computed must return the
   * new derived value on the next read.
   */
  {
    id: 19,
    title: "returns updated value after dep change",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => a.read() * 2);

      expect(b.read()).toBe(0);
      a.write(1);
      expect(b.read()).toBe(2);
      a.write(5);
      expect(b.read()).toBe(10);
    },
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
  {
    id: 21,
    title: "chained computed dirty reallocation after trigger",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(b) → C(c) → C(d)
   *
   * Linear chain with call counters. After one source change,
   * each computed in the chain must re-evaluate exactly once.
   */
  {
    id: 22,
    title: "chained computed avoids redundant re-compute",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(b) → C(c)
   *                  |
   *                E(eff)
   *
   * An effect subscribes to the tail of a chain. A synchronous
   * read of c after writing a must trigger the effect.
   */
  {
    id: 23,
    title: "sync access of invalidated chained computed runs effect",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *       S(a)
   *      /    \
   *    C(b)  C(c)
   *
   * Two computeds share one source. After a write, both must
   * re-evaluate (order is implementation-defined but both must run).
   */
  {
    id: 24,
    title: "dependency evaluation order consistent with last access",
    run(fw: ReactiveFramework) {
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
      expect(bIdx).toBeLessThan(cIdx);
    },
  },

  /**
   *  C(a)   (no deps)
   *
   * A computed with no signal dependencies. After the initial
   * evaluation it must never re-compute.
   */
  {
    id: 25,
    title: "no re-compute if zero dependencies",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(b)
   *           |
   *         E(eff) → dispose
   *
   * A computed is subscribed by an effect, then the effect disposes.
   * The computed must still return correct values on direct read.
   */
  {
    id: 26,
    title: "computed remains live after losing all subscribers",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(c)
   *
   * Computed returns undefined when a===0, else returns a.
   * undefined must be treated as a legitimate cached value,
   * not confused with an uninitialized state.
   */
  {
    id: 145,
    title: "undefined is a valid computed value (not uninitialized)",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) → C(b) → C(c)
   *                  |
   *                E(eff)
   *
   * Inside a batch that writes a, the subsequent propagation must
   * evaluate b before c (topological order preserved).
   */
  {
    id: 149,
    title: "batch preserves correct evaluation order",
    run(fw: ReactiveFramework) {
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

      expect(order.indexOf("b")).toBeGreaterThanOrEqual(0);
      expect(order.indexOf("c")).toBeGreaterThanOrEqual(0);
      expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
    },
  },

  /**
   *  S(a) → C(c)
   *           |
   *         S(inner)  ← created inside c's compute function
   *
   * Creating a new signal inside a computed body must not throw.
   * The computed derives its value through the inner signal.
   */
  {
    id: 115,
    title: "signal creation inside computed is allowed",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);

      const c = fw.computed(() => {
        const inner = fw.signal(a.read() * 10);
        return inner.read();
      });

      expect(c.read()).toBe(0);
      a.write(3);
      expect(c.read()).toBe(30);
    },
  },

  /**
   *  S(a) → C(b) → C(c)
   *
   * b clamps a to [0, 10]. When a changes but b's clamped output
   * stays the same, c must NOT re-evaluate (value-equality cut).
   */
  {
    id: 27,
    title: "downstream not re-evaluated unless value changed",
    run(fw: ReactiveFramework) {
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
  },
];
