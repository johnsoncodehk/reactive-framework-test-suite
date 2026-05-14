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
   *  S(a) ← E(eff) → dispose
   *
   * After disposal, the effect no longer re-runs on signal changes.
   */
  "#37 effect disposal stops re-runs"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let runs = 0;
    const dispose = fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    dispose();
    a.write(1);
    expect(runs).toBe(1);
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
   *  S(a) ← E(eff → cleanup_N)
   *
   * Each re-run replaces the cleanup. Only the most recent cleanup
   * function runs on the next re-run; stale cleanups are discarded.
   */
  "#109 only the most recent cleanup function runs"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const log: string[] = [];

    fw.effect(() => {
      const v = a.read();
      return () => {
        log.push("cleanup:" + v);
      };
    });

    a.write(1);
    a.write(2);

    expect(log).toEqual(["cleanup:0", "cleanup:1"]);

    const filtered = log.filter((x) => x === "cleanup:0");
    expect(filtered).toHaveLength(1);
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
   *  S(a) ← E(eff) → self-dispose when a >= 3
   *
   * "One-shot" pattern: effect auto-disposes once a condition is
   * met. Subsequent signal changes must not re-trigger the effect.
   */
  "#142 one-shot conditional effect (auto-dispose when condition met)"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let runs = 0;
    let dispose: (() => void) | undefined;

    dispose = fw.effect(() => {
      const v = a.read();
      runs++;
      if (v >= 3) {
        dispose?.();
      }
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);

    a.write(3);
    expect(runs).toBe(3);

    a.write(4);
    expect(runs).toBe(3);

    a.write(5);
    expect(runs).toBe(3);
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
   *  S(a) ← E(eff) → dispose
   *
   * After disposal, repeated writes to the signal must never
   * re-notify the disposed effect.
   */
  "#41 disposed effect never re-notified"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let runs = 0;
    const dispose = fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    dispose();

    a.write(1);
    a.write(2);
    a.write(3);
    expect(runs).toBe(1);
  },
};
