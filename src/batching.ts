import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest, hasEffectCleanup } from "./framework.js";

/**
 * Batching / Transaction
 *
 * Tests that writes inside a batch (transaction) are deferred:
 * effects and computed nodes only re-evaluate once when the
 * outermost batch completes, intermediate values are never
 * observed by effects, and value-equality elision still applies.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   *C       computed that always returns a constant (value-equality cut)
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 */
export const section = "Batching / Transaction";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) → E(eff)
   *
   * Nested batch: inner batch completes but outer is still open.
   * Effect fires only once when the outermost batch ends.
   */
  "#66 nested batches: outer completion triggers propagation"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let runs = 0;
    fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(1);
      fw.batch!(() => {
        a.write(2);
      });
      // Inner batch complete but outer still open
      expect(runs).toBe(1);
      a.write(3);
    });
    expect(runs).toBe(2);
    expect(a.read()).toBe(3);
  },

  /**
   *  S(a)
   *
   * Signal reads inside a batch reflect the latest written value
   * immediately (write-then-read consistency within the batch).
   */
  "#67 signals readable with updated value inside batch"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    fw.batch(() => {
      a.write(1);
      expect(a.read()).toBe(1);
      a.write(2);
      expect(a.read()).toBe(2);
    });
  },

  /**
   *  S(a) → C(b)
   *
   * Computed reads inside a batch re-evaluate eagerly when pulled,
   * reflecting the latest source value (b.read() === 10 after a.write(5)).
   */
  "#68 computed readable with updated sources inside batch"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);
    fw.batch(() => {
      a.write(5);
      expect(b.read()).toBe(10);
    });
  },

  /**
   *  S(a) → E(eff)
   *
   * Batch callback throws after writing. Pending effects must still
   * run with the updated value despite the exception.
   */
  "#69 pending effects run even if batch callback throws"(
    fw: ReactiveFramework
  ) {
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
        throw new Error("batch error");
      });
    } catch {}

    // Effect should still have run with the updated value
    expect(runs).toBe(2);
    expect(a.read()).toBe(1);
  },

  /**
   *  S(a) → E(eff)  [created inside batch]
   *
   * An effect created inside a batch runs its initial execution
   * immediately (synchronously), not deferred to batch end.
   */
  "#70 effect first run is immediate even inside batch"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let runs = 0;

    fw.batch(() => {
      fw.effect(() => {
        a.read();
        runs++;
      });
      expect(runs).toBe(1);
    });
  },

  /**
   *  S(a) → E(eff)
   *
   * batch { a.write(1); a.write(2); a.write(3) } — effect observes
   * [0, 3] only; intermediate values 1 and 2 are never seen.
   */
  "#72 intermediate values skipped (only final value observed)"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const values: number[] = [];
    fw.effect(() => {
      values.push(a.read());
    });
    expect(values).toEqual([0]);

    fw.batch(() => {
      a.write(1);
      a.write(2);
      a.write(3);
    });
    expect(values).toEqual([0, 3]);
  },

  /**
   *  S(a) ─→ C(c) → E(eff)
   *  S(b) ─→ /
   *
   * batch { a.write(1); b.write(-1) } — c = a+b still equals 0.
   * Effect must NOT re-run (computed value unchanged).
   */
  "#119 batch: computed same result despite source change — no effect run"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.computed(() => a.read() + b.read());
    let runs = 0;
    fw.effect(() => {
      c.read();
      runs++;
    });
    expect(runs).toBe(1);
    expect(c.read()).toBe(0);

    fw.batch(() => {
      a.write(1);
      b.write(-1);
    });

    expect(c.read()).toBe(0);
    expect(runs).toBe(1);
  },

  /**
   *  S(a) → E(eff1)  cleanup: b.write(a.read())
   *  S(b) → E(eff2)
   *
   * When eff1's cleanup writes to b, that write is implicitly batched
   * so eff2 sees the final value in a single notification.
   */
  "#120 cleanup writes inside effect are implicitly batched"(
    fw: ReactiveFramework
  ) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
    const a = fw.signal(0);
    const b = fw.signal(0);
    const log: string[] = [];

    fw.effect(() => {
      a.read();
      return () => {
        b.write(a.read());
      };
    });

    fw.effect(() => {
      log.push("b:" + b.read());
    });

    log.length = 0;
    a.write(1);

    expect(log.length).toBeGreaterThanOrEqual(1);
    expect(log[log.length - 1]).toBe("b:1");
  },

  /**
   *  S(a) → E(good)
   *  S(a) → E(bad)   ← throws when a > 0
   *
   * One effect throws during batch flush. The other (good) effect
   * must still run with the updated value.
   */
  "#121 pending effects run even if some effects throw during batch"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let goodRuns = 0;

    fw.effect(() => {
      a.read();
      goodRuns++;
    });

    try {
      fw.effect(() => {
        if (a.read() > 0) throw new Error("bad effect");
      });
    } catch {}

    expect(goodRuns).toBe(1);

    try {
      fw.batch(() => {
        a.write(1);
      });
    } catch {}

    expect(goodRuns).toBeGreaterThanOrEqual(2);
  },

  /**
   *  S(a) → E(eff)
   *
   * After a batch completes, subsequent writes propagate normally
   * (one write = one effect run), verifying batch state is fully reset.
   */
  "#122 post-batch writes work normally"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let runs = 0;
    fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(1);
    });
    expect(runs).toBe(2);

    a.write(2);
    expect(runs).toBe(3);
    expect(a.read()).toBe(2);
  },

  /**
   *  S(a) → E(eff)
   *
   * Multiple consecutive batches that each write then revert to the
   * original value. Effect must never re-run (all batches are no-ops).
   */
  "#123 repeated no-op batches don't re-trigger effects"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let runs = 0;
    fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(1);
      a.write(0);
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(2);
      a.write(0);
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(3);
      a.write(0);
    });
    expect(runs).toBe(1);
  },

  /**
   *  S(a) → E(eff) → dispose
   *
   * batch { a.write(1); dispose(); a.write(2) } — effect is disposed
   * mid-batch. It must NOT run at batch end despite pending notification.
   */
  "#124 trigger+dispose+retrigger in batch = no run"(fw: ReactiveFramework) {
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
      a.write(2);
    });
    expect(runs).toBe(1);
  },

  /**
   *  S(a) → C(c) → E(eff)
   *
   * batch { a.write(5); a.write(0) } — source reverts to original.
   * Computed and effect must NOT re-evaluate.
   */
  "#125 batch: source reverts → computed not notified"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const c = fw.computed(() => a.read() * 2);
    let runs = 0;
    fw.effect(() => {
      c.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(5);
      a.write(0);
    });
    expect(runs).toBe(1);
    expect(c.read()).toBe(0);
  },

  /**
   *  S(a) → E(eff)  [created inside batch after write]
   *
   * batch { a.write(42); effect(...) } — effect created after the
   * write sees the updated value 42 on its initial run.
   */
  "#126 new effect inside batch after write sees updated value"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let seen = -1;

    fw.batch(() => {
      a.write(42);
      fw.effect(() => {
        seen = a.read();
      });
    });

    expect(seen).toBe(42);
  },

  /**
   *  S(a) → E(eff) → dispose
   *
   * batch { a.write(1); dispose() } — effect is disposed inside the
   * batch. It must NOT run when the batch completes.
   */
  "#127 unsubscribe inside batch: not called at end"(fw: ReactiveFramework) {
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
   *  S(a) → C(b) → C(c)
   *
   * batch { a.write(5); c.read() } — pulling c inside the batch
   * forces eager evaluation of the entire upstream chain (b and c).
   */
  "#128 reading computed in batch forces upstream evaluation"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() + 1);
    const c = fw.computed(() => b.read() * 2);

    fw.batch(() => {
      a.write(5);
      expect(c.read()).toBe(12);
      expect(b.read()).toBe(6);
    });
  },

  /**
   *      S(a)
   *     /    \
   *   C(c1)  C(c2) → E(eff)
   *
   * batch { a.write(5); c1.read() } — reading sibling c1 inside
   * the batch must NOT trigger c2's effect early; effect fires
   * only when the batch completes.
   */
  "#129 reading one computed doesn't notify sibling effect early"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const c1 = fw.computed(() => a.read() + 1);
    const c2 = fw.computed(() => a.read() * 2);
    let c2Runs = 0;

    fw.effect(() => {
      c2.read();
      c2Runs++;
    });
    expect(c2Runs).toBe(1);

    fw.batch(() => {
      a.write(5);
      c1.read();
      expect(c2Runs).toBe(1);
    });
    expect(c2Runs).toBe(2);
  },

  /**
   *  S(a) → E(eff1)  writes: b.write(a+1), c.write(a+2)
   *  S(b) ─→ E(eff2)
   *  S(c) ─→ /
   *
   * Writes inside an effect body are implicitly batched. eff2
   * sees both b and c updated in a single notification.
   */
  "#130 effect inner writes are implicitly batched"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.signal(0);
    const log: string[] = [];

    fw.effect(() => {
      const v = a.read();
      b.write(v + 1);
      c.write(v + 2);
    });

    fw.effect(() => {
      log.push(b.read() + "," + c.read());
    });

    log.length = 0;
    a.write(10);

    expect(log[log.length - 1]).toBe("11,12");
  },

  /**
   *  S(a) → C(c1) → C(c2) → E(eff)
   *  S(b) ────────→ /
   *
   * batch { a.write(5); a.write(0); b.write(20) } — a reverts but b
   * changes. c2 = c1 + b must still update because b changed.
   */
  "#131 derived-of-derived: source reverts in batch"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.signal(10);
    const c1 = fw.computed(() => a.read() * 2);
    const c2 = fw.computed(() => c1.read() + b.read());
    let runs = 0;
    fw.effect(() => {
      c2.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(5);
      a.write(0);
      b.write(20);
    });

    expect(c2.read()).toBe(20);
    expect(runs).toBe(2);
  },

  /**
   *  S(a) → C(c) → E(eff)
   *
   * batch { a.write(5); a.write(0) } — source reverts. Computed c
   * must NOT recompute at all (zero calls), not just produce the
   * same value.
   */
  "#132 batch: computed not recomputed if dep reverts"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read() * 2;
    });

    fw.effect(() => {
      c.read();
    });
    cCalls = 0;

    fw.batch(() => {
      a.write(5);
      a.write(0);
    });

    c.read();
    expect(cCalls).toBe(0);
  },

  /**
   *  S(a) ─→ E(eff)
   *  S(b) ─→ /
   *
   * Two independent signals change inside one batch. Effect fires
   * exactly once and both signals have their final values.
   */
  "#74 multiple signals grouped in single update"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let runs = 0;
    fw.effect(() => {
      a.read();
      b.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      a.write(1);
      b.write(1);
    });
    expect(runs).toBe(2);
    expect(a.read()).toBe(1);
    expect(b.read()).toBe(1);
  },
};
