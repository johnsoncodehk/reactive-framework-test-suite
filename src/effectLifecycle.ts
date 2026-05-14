import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest, hasEffectCleanup } from "./framework.js";

/**
 * Effect Lifecycle
 *
 * Tests the full lifecycle of effects: creation, re-execution on
 * dependency changes, cleanup functions, disposal (including self-
 * disposal and double-disposal), and interactions between disposal
 * and the reactive graph (computed-triggered disposal, inner
 * computed recreation, subscription leaks).
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 *   dispose  effect disposal call
 */
export const section = "Effect Lifecycle";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ← E(eff)
   *
   * Effect callback executes synchronously upon creation.
   */
  "#35 effect runs callback immediately on creation"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let runs = 0;
    fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);
  },

  /**
   *  S(a) ← E(eff)
   *
   * Effect re-runs each time its signal dependency changes.
   */
  "#36 effect re-runs when dependency changes"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const values: string[] = [];
    fw.effect(() => {
      values.push(a.read());
    });
    expect(values).toEqual(["a"]);

    a.write("b");
    expect(values).toEqual(["a", "b"]);

    a.write("c");
    expect(values).toEqual(["a", "b", "c"]);
  },

  /**
   *  S(a) ← E(eff → cleanup)
   *
   * The cleanup function returned by an effect runs before each
   * subsequent re-execution of that effect.
   */
  "#38 effect cleanup fn called before each re-run"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const log: string[] = [];
    fw.effect(() => {
      const v = a.read();
      log.push("run:" + v);
      return () => {
        log.push("cleanup:" + v);
      };
    });
    expect(log).toEqual(["run:0"]);

    a.write(1);
    expect(log).toEqual(["run:0", "cleanup:0", "run:1"]);

    a.write(2);
    expect(log).toEqual(["run:0", "cleanup:0", "run:1", "cleanup:1", "run:2"]);
  },

  /**
   *  S(a) ← E(eff → cleanup) → dispose
   *
   * The cleanup function runs when the effect is disposed.
   */
  "#39 effect cleanup fn called on disposal"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    let cleanupCalled = false;
    const dispose = fw.effect(() => {
      a.read();
      return () => {
        cleanupCalled = true;
      };
    });
    expect(cleanupCalled).toBe(false);

    dispose();
    expect(cleanupCalled).toBe(true);
  },

  /**
   *  S(a) ← E(eff → cleanup reads S(b))
   *
   * Cleanup runs outside the tracking context, so reading a signal
   * inside cleanup must NOT create a dependency on that signal.
   */
  "#40 effect cleanup runs outside reactive evaluation context"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const b = fw.signal(100);
    let effectRuns = 0;

    fw.effect(() => {
      a.read();
      effectRuns++;
      return () => {
        // Reading b in cleanup should NOT create a dependency
        b.read();
      };
    });
    expect(effectRuns).toBe(1);

    a.write(1);
    expect(effectRuns).toBe(2);

    // b is only read in cleanup — should not trigger re-run
    b.write(200);
    expect(effectRuns).toBe(2);
  },

  /**
   *  batch { S(a).write; E(eff).dispose }
   *
   * An effect disposed inside a batch that also writes to its
   * dependency must NOT execute when the batch flushes.
   */
  "#42 effect not executed if disposed during pending batch"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let runs = 0;
    const dispose = fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(1);
      dispose();
    });
    expect(runs).toBe(1);
  },

  /**
   *  S(a) ← E(eff) → self-dispose on 2nd run
   *
   * An effect that calls its own dispose function during execution
   * must not crash and must stop future re-runs.
   */
  "#108 effect self-dispose during execution is safe"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let runs = 0;
    let dispose: (() => void) | undefined;

    dispose = fw.effect(() => {
      runs++;
      a.read();
      if (runs === 2) {
        dispose?.();
      }
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);

    a.write(2);
    expect(runs).toBe(2);
  },

  /**
   *  S(a) ← E(eff → cleanup) → dispose → dispose
   *
   * Calling dispose twice must not throw and cleanup must not run
   * more than twice total (once per dispose at most).
   */
  "#110 double-dispose is safe"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    let cleanupCount = 0;
    const dispose = fw.effect(() => {
      a.read();
      return () => {
        cleanupCount++;
      };
    });

    dispose();
    expect(cleanupCount).toBe(1);

    expect(() => dispose()).not.toThrow();
    expect(cleanupCount).toBeLessThanOrEqual(2);
  },

  /**
   *  S(a) ← E(eff → cleanup calls dispose)
   *
   * Cleanup itself calls dispose. The effect must not re-run after
   * the cleanup-triggered disposal.
   */
  "#111 cleanup-triggered dispose prevents re-run"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    let runs = 0;
    let dispose: (() => void) | undefined;

    dispose = fw.effect(() => {
      runs++;
      a.read();
      return () => {
        dispose?.();
      };
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBeLessThanOrEqual(2);

    a.write(2);
    expect(runs).toBeLessThanOrEqual(2);
  },

  /**
   *  S(a)  S(b) ← E(eff) → self-dispose mid-run
   *
   * Effect reads a, self-disposes when a===1, then continues to
   * read b. After disposal, neither a nor b changes trigger re-run.
   */
  "#141 dispose during execution then continue: no re-run"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    let runs = 0;
    let dispose: (() => void) | undefined;

    dispose = fw.effect(() => {
      runs++;
      const va = a.read();
      if (va === 1) {
        dispose?.();
      }
      b.read();
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);

    b.write(1);
    expect(runs).toBe(2);

    a.write(2);
    expect(runs).toBe(2);
  },


  /**
   *  S(a)  S(b) ← E(eff) → dispose
   *
   * After disposal, multiple writes to both dependencies must
   * never re-schedule the effect.
   */
  "#143 destroyed effect not re-scheduled on later updates"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    let runs = 0;

    const dispose = fw.effect(() => {
      a.read();
      b.read();
      runs++;
    });
    expect(runs).toBe(1);

    dispose();

    a.write(1);
    b.write(1);
    a.write(2);
    b.write(2);
    expect(runs).toBe(1);
  },


  /**
   *  S(a) ← E(inner → cleanup reads S(b))
   *  S(a) ← E(outer disposes inner when a===1)
   *
   * Inner effect's cleanup reads b. When outer disposes inner,
   * b must NOT become a dependency of the outer effect.
   */
  "#178 dispose cleanup reads don't leak to parent tracking context"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const b = fw.signal(100);
    let outerRuns = 0;

    const disposeInner = fw.effect(() => {
      a.read();
      return () => {
        b.read();
      };
    });

    fw.effect(() => {
      a.read();
      outerRuns++;
      if (a.read() === 1) {
        disposeInner();
      }
    });
    outerRuns = 0;

    a.write(1);
    expect(outerRuns).toBe(1);

    outerRuns = 0;
    b.write(200);
    expect(outerRuns).toBe(0);
  },

  /**
   *  S(a) ← E(eff creates C(c) reading a)
   *
   * Effect creates an inner computed each run. After re-run the
   * new computed must read the latest signal value.
   */
  "#214 parent disposes and recreates child: downstream sees correct value"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(1);
    let innerComputed: { read(): number } | undefined;

    fw.effect(() => {
      const c = fw.computed(() => a.read());
      a.read();
      innerComputed = c;
    });

    expect(innerComputed!.read()).toBe(1);

    a.write(2);
    expect(innerComputed!.read()).toBe(2);

    a.write(3);
    expect(innerComputed!.read()).toBe(3);
  },

  /**
   *  S(s) → C(a) ← E(e1) [disposed by a when s===1]
   *                ← E(e2) [keeps a alive]
   *
   * Computed a disposes e1 during its own evaluation. e1 must not
   * re-run and must leave no subscription leak.
   */
  "#201 computed-triggered disposal: effect skipped and no subscription leak"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    let dispose1!: () => void;
    let e1runs = 0;

    const a = fw.computed(() => {
      if (s.read() === 1) dispose1();
      return s.read();
    });

    dispose1 = fw.effect(() => {
      a.read();
      e1runs++;
    });
    fw.effect(() => {
      a.read();
    }); // keep `a` alive

    expect(e1runs).toBe(1);
    s.write(1);
    expect(e1runs).toBe(1); // disposed during propagation, should not re-run

    s.write(2);
    s.write(3);
    expect(e1runs).toBe(1); // no subscription leak
  },

  /**
   *  S(s) → C(a) ← E(e1) [disposed by a when s===1]
   *                ← E(e2) [must still see a's new value]
   *
   * Computed a disposes e1 during evaluation. Sibling effect e2
   * must still receive the updated value.
   */
  "#202 computed-triggered disposal: sibling effects still notified"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    let dispose1!: () => void;
    let e2Value = -1;

    const a = fw.computed(() => {
      if (s.read() === 1) dispose1();
      return s.read();
    });

    dispose1 = fw.effect(() => {
      a.read();
    });
    fw.effect(() => {
      e2Value = a.read();
    });

    expect(e2Value).toBe(0);
    s.write(1);
    expect(e2Value).toBe(1);
  },

  /**
   *  S(s) → *C(a)  [always returns 0]
   *  S(s) →  C(a2) [disposes eff when s truthy]
   *    {a, a2} → C(b) ← E(eff)
   *
   * a2 disposes the effect during propagation while sibling a
   * returns an unchanged value. Must not crash.
   */
  "#203 computed disposal with unchanged-value sibling computed"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    let dispose!: () => void;

    const a = fw.computed(() => {
      s.read();
      return 0; // value never changes
    });
    const a2 = fw.computed(() => {
      if (s.read()) dispose();
      return s.read();
    });
    const b = fw.computed(() => {
      a.read();
      a2.read();
      return 0;
    });

    dispose = fw.effect(() => {
      b.read();
    });

    s.write(1); // should not crash
  },

  /**
   *  S(a) ← E(eff1)
   *       ← E(eff2)
   *       ← E(eff3)
   *
   * Three effects subscribe to the same signal. On signal change
   * they must fire in subscription (creation) order.
   */
  "#216 effects fire in creation order on shared signal"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const order: number[] = [];

    fw.effect(() => {
      a.read();
      order.push(1);
    });
    fw.effect(() => {
      a.read();
      order.push(2);
    });
    fw.effect(() => {
      a.read();
      order.push(3);
    });
    order.length = 0;

    a.write(1);
    expect(order).toEqual([1, 2, 3]);

    order.length = 0;
    a.write(2);
    expect(order).toEqual([1, 2, 3]);
  },

  /**
   *  S(a) ← E1 → dispose
   *       ← E2  (created after E1 disposed)
   *
   * After an effect is disposed, creating a new effect on the
   * same signal must work normally — fresh subscription, normal
   * re-runs. Confirms dispose doesn't poison the signal's
   * subscriber set.
   */
  "#217 new effect after dispose works normally"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let e1Runs = 0;
    let e2Runs = 0;

    const dispose1 = fw.effect(() => {
      a.read();
      e1Runs++;
    });
    expect(e1Runs).toBe(1);

    dispose1();
    a.write(1);
    expect(e1Runs).toBe(1);

    fw.effect(() => {
      a.read();
      e2Runs++;
    });
    expect(e2Runs).toBe(1);

    a.write(2);
    expect(e2Runs).toBe(2);
    expect(e1Runs).toBe(1);
  },

  /**
   *  S(a) ← E_outer (→ cleanup creates E_inner ← S(b))
   *
   * A common debounce-like pattern: an effect's cleanup creates a
   * fresh effect that subscribes to a different signal. The newly
   * created inner effect must run once on creation and react to
   * subsequent writes to its own dependency.
   */
  "#222 effect created inside cleanup tracks its own deps"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let innerRuns = 0;

    fw.effect(() => {
      a.read();
      return () => {
        fw.effect(() => {
          b.read();
          innerRuns++;
        });
      };
    });
    expect(innerRuns).toBe(0);

    // Trigger cleanup once — the cleanup-created effect should
    // run initially.
    a.write(1);
    expect(innerRuns).toBe(1);

    // The cleanup-created effect must track b independently.
    b.write(1);
    expect(innerRuns).toBe(2);
  },

  /**
   *  S(a) → C(c) reads S(a)
   *  S(a) → E(eff → cleanup reads C(c))
   *
   * Cleanup reads a computed whose source has just changed. The
   * cleanup must observe the up-to-date computed value, not the
   * stale value captured before the write.
   */
  "#229 cleanup reads computed: sees fresh value"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const c = fw.computed(() => a.read() * 10);
    const seen: number[] = [];

    fw.effect(() => {
      a.read();
      return () => {
        seen.push(c.read());
      };
    });

    a.write(1);
    expect(seen).toEqual([10]);

    a.write(2);
    expect(seen).toEqual([10, 20]);
  },

  /**
   *  S(a) → E1(eff → cleanup writes S(b))
   *  S(b) → E2(eff observes S(b))
   *
   * E1's cleanup writes to a signal observed by E2, all wrapped in
   * a batch. After the batch completes, E2 must reflect the value
   * produced by the cleanup.
   */
  "#230 cleanup writes signal inside batch propagates after flush"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let e2Value = -1;

    fw.effect(() => {
      a.read();
      return () => {
        b.write(b.read() + 1);
      };
    });
    fw.effect(() => {
      e2Value = b.read();
    });
    expect(e2Value).toBe(0);

    fw.batch(() => {
      a.write(1);
    });
    expect(e2Value).toBe(1);
  },

  /**
   *  S(a) → E(eff → cleanup{ untracked{ S(b).read } })
   *
   * Cleanup wraps a signal read in untracked. Since cleanup already
   * runs outside any tracking context (#40), this should also leave
   * no subscription. Tests that untracked composes correctly with
   * cleanup rather than producing a spurious dependency.
   */
  "#231 untracked inside cleanup: still no tracking"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.signal(100);
    let runs = 0;

    fw.effect(() => {
      a.read();
      runs++;
      return () => {
        fw.untracked!(() => {
          b.read();
        });
      };
    });
    expect(runs).toBe(1);

    // b read only via untracked inside cleanup — must not retrigger.
    b.write(200);
    expect(runs).toBe(1);

    // a is still a real dep.
    a.write(1);
    expect(runs).toBe(2);
  },

  /**
   *  S(a) → E(eff → cleanup{ S(b).write; read C(c) where C(c) reads S(b) })
   *
   * Inside cleanup we write to b, then read computed c which depends
   * on b. c must reflect the just-written value of b — the write must
   * propagate to c before the cleanup's read in the same tick.
   */
  "#233 cleanup write then read of dependent computed: sees new value"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.computed(() => b.read());
    const seen: number[] = [];

    fw.effect(() => {
      a.read();
      return () => {
        b.write(99);
        seen.push(c.read());
      };
    });
    expect(seen).toEqual([]);

    a.write(1);
    expect(seen).toEqual([99]);
  },

  /**
   *  S(a) → E1{ batch{ S(b).write, S(b).write } }
   *  S(b) → E2
   *
   * E1's body opens a batch and writes b twice. E2 (observer of b)
   * must run exactly once per E1 run, seeing only the final batched
   * value of b — not each intermediate write.
   */
  "#235 batch inside effect body coalesces writes"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let observerRuns = 0;
    let observerLast = -1;

    fw.effect(() => {
      a.read();
      fw.batch!(() => {
        b.write(b.read() + 10);
        b.write(b.read() + 1);
      });
    });
    fw.effect(() => {
      observerLast = b.read();
      observerRuns++;
    });
    // After setup: b = 11; observer ran once with b=11
    expect(observerLast).toBe(11);

    observerRuns = 0;
    a.write(1);
    // E1 re-runs, batch writes b: 11 → 21 → 22
    // Observer should fire exactly once with b=22
    expect(observerRuns).toBe(1);
    expect(observerLast).toBe(22);
  },

  /**
   *  S(a) → E(eff → cleanup writes S(a))
   *
   * Cleanup writes the effect's own dep, which would normally re-
   * trigger the same effect. User code bounds the recursion with a
   * counter; framework must execute this without unbounded looping
   * or stack overflow.
   */
  "#236 cleanup write to own dep: bounded recursion completes"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      a.read();
      runs++;
      return () => {
        if (runs < 5) {
          a.write(a.read() + 1);
        }
      };
    });
    expect(runs).toBe(1);

    a.write(1);
    // User-bounded by `runs < 5`. Framework must complete without
    // infinite looping or stack overflow. Final run count is bounded.
    expect(runs).toBeLessThanOrEqual(20);
  },
};
