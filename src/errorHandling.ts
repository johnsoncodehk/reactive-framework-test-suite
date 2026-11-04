import { expect } from "./assert.ts";
import type { ReactiveFramework } from "./framework.ts";
import type { TestCase } from "./suite.ts";
import { SkipTest } from "./framework.ts";

/**
 * Error Handling
 *
 * Tests that exceptions thrown inside computeds, effects, or
 * cleanup functions do not corrupt the reactive graph. After an
 * error the framework must remain consistent: recovery writes
 * produce correct values, unrelated branches stay intact, and
 * no stale scheduled work leaks across updates.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 *   ⚡       node that may throw
 */
export const name = "Error Handling";
export const cases: TestCase[] = [
  /**
   *  S(a) → C(b) ⚡ throws when a===0
   *
   * Computed throws on its initial evaluation. After fixing the
   * signal, the computed must return the correct value.
   */
  {
    id: 84,
    title: "graph stays consistent after error in initial computed",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => {
        if (a.read() === 0) throw new Error("initial error");
        return a.read();
      });

      expect(() => b.read()).toThrow("initial error");

      a.write(1);
      expect(b.read()).toBe(1);
    },
  },

  /**
   *  S(a) ← E(eff ⚡ throws when a===1, → cleanup)
   *
   * Effect throws on re-run. The cleanup from the previous
   * successful run must still be called.
   */
  {
    id: 89,
    title: "effect cleanup reset when effect throws",
    run(fw: ReactiveFramework) {
      if (!fw.effectCleanup) throw new SkipTest("no effectCleanup");
      const a = fw.signal(0);
      let cleanupCalled = false;

      try {
        fw.effect(() => {
          a.read();
          if (a.read() === 1) {
            throw new Error("effect error");
          }
          return () => {
            cleanupCalled = true;
          };
        });
      } catch {}

      try {
        a.write(1);
      } catch {}

      // Cleanup from previous successful run should have been called
      expect(cleanupCalled).toBe(true);
    },
  },

  /**
   *  S(a) ← E(eff → cleanup ⚡ throws)
   *
   * Cleanup itself throws. The effect must not enter an infinite
   * loop; subsequent updates must be bounded.
   */
  {
    id: 90,
    title: "effect disposed when cleanup throws",
    run(fw: ReactiveFramework) {
      if (!fw.effectCleanup) throw new SkipTest("no effectCleanup");
      const a = fw.signal(0);
      let effectRuns = 0;

      let dispose = () => {};
      try {
        dispose = fw.effect(() => {
          effectRuns++;
          a.read();
          return () => {
            throw new Error("cleanup error");
          };
        });
      } catch {}

      try {
        a.write(1);
      } catch {}

      const runsAfterError = effectRuns;

      try {
        a.write(2);
      } catch {}

      // Effect should be bounded — not infinite loop due to cleanup error
      expect(effectRuns).toBeLessThanOrEqual(runsAfterError + 1);

      // Disposal runs the throwing cleanup once more; that is not under test.
      try {
        dispose();
      } catch {}
    },
  },

  /**
   *  S(a) → C(bad) ⚡     S(b) → C(good)
   *
   * After an exception in bad, the good branch must still
   * re-evaluate normally on subsequent writes to b.
   */
  {
    id: 91,
    title: "exception halts propagation but other branches remain intact",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(10);

      const bad = fw.computed(() => {
        if (a.read() > 0) throw new Error("branch error");
        return a.read();
      });

      let goodCalls = 0;
      const good = fw.computed(() => {
        goodCalls++;
        return b.read() * 2;
      });

      expect(good.read()).toBe(20);

      a.write(1);
      try {
        bad.read();
      } catch {}

      // Good branch should still work
      goodCalls = 0;
      b.write(20);
      expect(good.read()).toBe(40);
      expect(goodCalls).toBe(1);
    },
  },

  /**
   *  S(a) → C(b) ⚡ throws when a===1
   *
   * After error and recovery, no stale scheduled state remains.
   * Subsequent writes produce correct values without ghost re-runs.
   */
  {
    id: 92,
    title: "no stale scheduled updates left after exception",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => {
        if (a.read() === 1) throw new Error("stale error");
        return a.read() * 2;
      });

      expect(b.read()).toBe(0);

      a.write(1);
      expect(() => b.read()).toThrow("stale error");

      // After recovery, no stale state should remain
      a.write(2);
      expect(b.read()).toBe(4);

      a.write(3);
      expect(b.read()).toBe(6);
    },
  },

  /**
   *  batch { S(a).write; throw } ← E(eff)
   *
   * User code throws inside a batch. The batch's signal write
   * must still flush, the effect must fire, and the graph must
   * remain consistent after the throw.
   */
  {
    id: 154,
    title: "batch throw: effects survive, graph consistent",
    run(fw: ReactiveFramework) {
      if (!fw.batch) throw new SkipTest("no batch");
      const a = fw.signal(0);
      let runs = 0;

      fw.effect(() => {
        a.read();
        runs++;
      });
      expect(runs).toBe(1);

      try {
        fw.batch(() => {
          a.write(1);
          throw new Error("batch boom");
        });
      } catch {}

      expect(runs).toBeGreaterThanOrEqual(2);

      a.write(2);
      expect(runs).toBeGreaterThanOrEqual(3);
      expect(a.read()).toBe(2);
    },
  },

  /**
   *  S(a) → C(c) ⚡ throws when a===0 ← E(eff)
   *
   * Computed throws while being watched by an effect. Re-reading
   * the computed must not recompute excessively (error is cached).
   * After recovery write, the computed returns normally.
   */
  {
    id: 155,
    title: "errors cached when watched by effect (live caching)",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let computeCalls = 0;
      const c = fw.computed(() => {
        computeCalls++;
        if (a.read() === 0) throw new Error("live error");
        return a.read();
      });

      let effectError: any = null;
      try {
        fw.effect(() => {
          try {
            c.read();
          } catch (e) {
            effectError = e;
          }
        });
      } catch {}

      const callsAfter = computeCalls;

      try {
        c.read();
      } catch {}

      expect(computeCalls).toBeLessThanOrEqual(callsAfter + 1);

      a.write(1);
      expect(c.read()).toBe(1);
    },
  },

  /**
   *  S(a)  S(b)  S(c) → C(d)
   *  E1 reads a; E2 ⚡ reads a; E3 reads a,d
   *
   * E2 throws when a===2. After the failed flush, writing to
   * unrelated signal b must NOT re-trigger E3.
   */
  {
    id: 177,
    title: "skipped effects from failed flush not re-triggered by unrelated signal",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);
      const c = fw.signal(0);
      const d = fw.computed(() => c.read());

      fw.effect(() => {
        a.read();
      });

      try {
        fw.effect(() => {
          if (a.read() === 2) throw new Error("effect2 error");
        });
      } catch {}

      let effect3Runs = 0;
      fw.effect(() => {
        a.read();
        d.read();
        effect3Runs++;
      });
      effect3Runs = 0;

      try {
        a.write(2);
      } catch {}
      effect3Runs = 0;

      b.write(1);
      expect(effect3Runs).toBe(0);
    },
  },

  /**
   *  S(a) → C(b) ⚡ → C(c)
   *
   * b throws, causing downstream c to also throw. After recovery
   * both b and c must return correct values.
   */
  {
    id: 211,
    title: "computed error chain: downstream computed also throws",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => {
        if (a.read() === 1) throw new Error("source error");
        return a.read();
      });
      const c = fw.computed(() => b.read() * 2);

      expect(c.read()).toBe(0);

      a.write(1);
      expect(() => c.read()).toThrow();

      // Recovery: both b and c return to normal
      a.write(2);
      expect(b.read()).toBe(2);
      expect(c.read()).toBe(4);
    },
  },

  /**
   *  S(a) ← E(e1)
   *  S(a) ← E(e2 ⚡ throws when a===1)
   *  S(a) ← E(e3)
   *  S(b) ← E(e4)
   *
   * e2 throws during propagation of a(1), which may halt the
   * flush. On a subsequent write to unrelated signal b, only
   * b-dependent effects must run — a-dependent effects skipped
   * by the earlier halt must NOT leak into the new flush.
   */
  {
    id: 247,
    title: "flush queue consistent after effect throw",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);
      let e3Runs = 0;

      fw.effect(() => {
        a.read();
      });
      try {
        fw.effect(() => {
          if (a.read() === 1) throw new Error("e2 error");
        });
      } catch {}
      fw.effect(() => {
        a.read();
        e3Runs++;
      });
      fw.effect(() => {
        b.read();
      });

      e3Runs = 0;
      try {
        a.write(1);
      } catch {}
      e3Runs = 0;

      try {
        b.write(1);
      } catch {}
      expect(e3Runs).toBe(0);
    },
  },

  /**
   *  S(a) → C(b) ⚡ throws when a is true
   *
   * Computed alternates between throwing and returning "ok".
   * Each transition must work correctly in both directions.
   */
  {
    id: 93,
    title: "exception recovery in computed",
    run(fw: ReactiveFramework) {
      const a = fw.signal(true);
      const b = fw.computed(() => {
        if (a.read()) throw new Error("fail");
        return "ok";
      });

      expect(() => b.read()).toThrow("fail");

      a.write(false);
      expect(b.read()).toBe("ok");

      a.write(true);
      expect(() => b.read()).toThrow("fail");
    },
  },
];
