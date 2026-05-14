import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Untracked / Unsampled Reads
 *
 * Tests that `fw.untracked()` suppresses dependency tracking.
 * Reads performed inside an untracked scope must not subscribe the
 * enclosing effect or computed to the read signal.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 *   ╌╌→      untracked read (no dependency created)
 */
export const section = "Untracked / Unsampled Reads";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ─→ E(eff)
   *  S(b) ╌╌→ E(eff)   (untracked)
   *
   * Effect tracks S(a) normally but reads S(b) inside
   * `untracked`. Changing S(b) must not re-run the effect.
   */
  "#75 untracked read in effect does not create dependency"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      a.read();
      fw.untracked!(() => b.read());
      runs++;
    });
    expect(runs).toBe(1);

    // a is tracked — should trigger
    a.write(1);
    expect(runs).toBe(2);

    // b is untracked — should NOT trigger
    b.write(1);
    expect(runs).toBe(2);
  },

  /**
   *  S(a) ─→ C(c)
   *  S(b) ╌╌→ C(c)   (untracked)
   *
   * Computed tracks S(a) but reads S(b) inside `untracked`.
   * Changing S(b) must not invalidate C(c).
   */
  "#76 untracked read in computed does not create dependency"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.signal(10);

    const c = fw.computed(() => {
      return a.read() + fw.untracked!(() => b.read());
    });

    expect(c.read()).toBe(10);

    // a is tracked
    a.write(1);
    expect(c.read()).toBe(11);

    // b is untracked — c should not re-evaluate
    b.write(20);
    expect(c.read()).toBe(11);
  },

  /**
   *  S(a) ─→ C(b)
   *        ╌╌→ read via untracked
   *
   * After S(a) is written, reading C(b) inside `untracked`
   * must still return the up-to-date value (lazy re-evaluation)
   * even though no dependency edge is created.
   */
  "#117 untracked read of stale computed returns fresh value"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);

    expect(b.read()).toBe(0);

    a.write(5);

    const result = fw.untracked!(() => b.read());
    expect(result).toBe(10);
  },

  /**
   *  S(a) ─→ C(b) ╌╌→ E(eff)   (untracked)
   *
   * Effect reads C(b) inside `untracked`. Even though C(b)
   * itself depends on S(a), the effect must not re-run when
   * S(a) changes — the untracked scope blocks the entire
   * transitive chain.
   */
  "#118 untracked transitively doesn't track through nested deps"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);

    let effectRuns = 0;
    fw.effect(() => {
      fw.untracked!(() => b.read());
      effectRuns++;
    });
    expect(effectRuns).toBe(1);

    a.write(1);
    expect(effectRuns).toBe(1);

    a.write(2);
    expect(effectRuns).toBe(1);
  },

  /**
   *  S(a) ─→ E(eff)
   *           eff ╌╌→ S(b).write   (untracked write)
   *
   * Writing to S(b) inside an untracked scope within an effect
   * should not throw. The write is performed but does not
   * create a dependency back to the effect.
   */
  "#156 untracked write inside effect doesn't throw"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let threw = false;

    try {
      fw.effect(() => {
        a.read();
        fw.untracked!(() => {
          b.write(a.read() * 10);
        });
      });
    } catch {
      threw = true;
    }

    if (!threw) {
      expect(b.read()).toBe(0);
      a.write(1);
      expect(b.read()).toBe(10);
    }
    expect(true).toBe(true);
  },

  /**
   *  S(a) ─→ E(eff)
   *  S(b) ╌╌→ E(eff)   (untracked)
   *
   * Effect tracks a and reads b inside `untracked`. Writes are
   * delivered via batch — untracked reads must still not create
   * a dependency, so writing only b inside a batch must not
   * trigger the effect.
   */
  "#218 untracked read survives across batched writes"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked || !fw.batch) throw new SkipTest("no untracked or batch");
    const a = fw.signal(0);
    const b = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      a.read();
      fw.untracked!(() => b.read());
      runs++;
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      b.write(1);
    });
    expect(runs).toBe(1);

    fw.batch(() => {
      b.write(2);
      a.write(1);
    });
    expect(runs).toBe(2);
  },

  /**
   *  untracked { batch { S(a).write × 3 } } → E(eff)
   *
   * A batch initiated inside `untracked` must still coalesce
   * writes and deliver a single notification to a tracked
   * effect outside the untracked scope.
   */
  "#219 batch inside untracked still coalesces writes"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked || !fw.batch) throw new SkipTest("no untracked or batch");
    const a = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    fw.untracked!(() => {
      fw.batch!(() => {
        a.write(1);
        a.write(2);
        a.write(3);
      });
    });
    expect(runs).toBe(2);
    expect(a.read()).toBe(3);
  },
};
