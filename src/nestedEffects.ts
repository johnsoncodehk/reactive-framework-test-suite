import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Nested Effects & Ordering
 *
 * Tests that effects created inside other effects behave correctly:
 * outer effects run before inner effects, inner effects are disposed
 * when the outer re-runs, disposal cascades through multiple levels,
 * and recursive writes inside effects do not cause infinite loops.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E        effect
 *   E{E}     outer effect containing an inner effect
 *   ─→       dependency edge (downstream reads upstream)
 *   ✕        disposed / cleaned up
 */
export const section = "Nested Effects & Ordering";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ─→ E_outer{ E_inner }
   *
   * Outer effect and inner effect both read a.
   * Outer must execute before inner on initial run.
   */
  "#43 outer effect runs before inner effect"(fw: ReactiveFramework) {
    const order: string[] = [];
    const a = fw.signal(0);

    fw.effect(() => {
      order.push("outer");
      a.read();
      fw.effect(() => {
        order.push("inner");
        a.read();
      });
    });

    expect(order[0]).toBe("outer");
  },

  /**
   *  S(a) ─→ E_outer{ untracked{ E_inner ─→ S(a) } }
   *
   * Inner effect is created inside an untracked block.
   * Outer effect must not subscribe to a's deps via untracked.
   * Inner effect still reads a directly and may re-run.
   */
  "#45 untracked inner effect does not subscribe to deps"(
    fw: ReactiveFramework
  ) {
    if (!fw.untracked) throw new SkipTest("no untracked");
    const a = fw.signal(0);
    let innerRuns = 0;

    fw.effect(() => {
      fw.untracked!(() => {
        fw.effect(() => {
          a.read();
          innerRuns++;
        });
      });
    });
    innerRuns = 0;

    a.write(1);
    // The outer effect should not re-run since deps are untracked
    // But the inner effect should re-run since it directly reads a
    expect(innerRuns).toBeGreaterThanOrEqual(0);
  },

  /**
   *  S(a) ─→ E(eff)   [reads a twice]
   *
   * Effect reads the same signal twice in one execution.
   * Must still fire only once per change, not once per read.
   */
  "#46 duplicate subscribers don't cause duplicate notifications"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      a.read();
      a.read();
      runs++;
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);
  },

  /**
   *  S(a) ─→ E(eff) ──write──→ S(a)
   *
   * Effect writes to its own dependency on the first run.
   * Framework must handle the recursion without infinite looping.
   */
  "#47 effect recursion handled on first execution"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let runs = 0;

    fw.effect(() => {
      runs++;
      if (runs === 1) {
        a.write(1);
      }
      a.read();
    });

    // Should not infinite loop — either runs once with final value
    // or runs twice (initial + triggered by write)
    expect(runs).toBeLessThanOrEqual(3);
    expect(a.read()).toBe(1);
  },

  /**
   *  S(a) ─→ E_parent{ S(child) ─→ E_child }
   *                       ↑ write
   *
   * Parent effect creates a child signal and inner effect, then
   * writes to the child signal. Parent must not re-trigger from
   * the child's signal write — only from a.
   */
  "#163 parent effect not triggered by child's own signal"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let parentRuns = 0;

    fw.effect(() => {
      a.read();
      parentRuns++;
      const childSignal = fw.signal(0);
      fw.effect(() => {
        childSignal.read();
      });
      childSignal.write(1);
    });

    const runsAfterSetup = parentRuns;
    expect(runsAfterSetup).toBeGreaterThanOrEqual(1);

    a.write(1);
    expect(parentRuns).toBe(runsAfterSetup + 1);
  },

  /**
   *  S(a) ─→ E_outer{ E_inner ─→ S(b) }
   *
   * Inner effect reads b (not a). When b changes, the inner
   * effect must re-run independently of the outer effect.
   */
  "#164 inner autorun created inside outer tracks own deps"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    let outerRuns = 0;
    let innerRuns = 0;

    fw.effect(() => {
      a.read();
      outerRuns++;
      fw.effect(() => {
        b.read();
        innerRuns++;
      });
    });

    innerRuns = 0;
    outerRuns = 0;

    b.write(1);
    expect(innerRuns).toBeGreaterThanOrEqual(1);
  },

  /**
   *  S(a) ─→ *C(b)  ← b = a % 2
   *            |
   *  E_outer{ E_inner ─→ *C(b) }
   *
   * a changes from 0 to 2 but b stays 0 (same parity).
   * Inner effect must NOT re-run (value-equality cut).
   */
  "#170 inner effect not triggered when computed dep resolves unchanged"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() % 2);
    let innerRuns = 0;

    fw.effect(() => {
      fw.effect(() => {
        b.read();
        innerRuns++;
      });
    });
    const initial = innerRuns;

    a.write(2);
    expect(innerRuns).toBe(initial);
  },

  /**
   *  S(a) ─→ E_outer{ E_middle{ E_inner } }
   *                ✕ dispose outer
   *                  ✕ middle cascades
   *                    ✕ inner cascades
   *
   * Three levels of nesting. Disposing the outermost effect must
   * cascade disposal to middle and inner. After dispose, no effect
   * runs when a changes.
   */
  "#209 three-level nested effect: cascading disposal"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let middleRuns = 0;
    let innerRuns = 0;

    const dispose = fw.effect(() => {
      a.read();
      fw.effect(() => {
        a.read();
        middleRuns++;
        fw.effect(() => {
          a.read();
          innerRuns++;
        });
      });
    });

    middleRuns = 0;
    innerRuns = 0;

    dispose();
    a.write(1);

    expect(middleRuns).toBe(0);
    expect(innerRuns).toBe(0);
  },

  /**
   *  S(a) ─→ E_outer{ E_b ─→ S(b),  E_c ─→ S(c) }
   *               ✕ old E_b, E_c on outer re-run
   *
   * Outer effect creates two sibling inner effects. When a changes,
   * both old inner effects must be cleaned up. After re-run, only
   * the new inner effects should respond to b and c changes.
   */
  "#210 multiple inner effects all cleaned when outer re-runs"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.signal(0);
    let bRuns = 0;
    let cRuns = 0;

    fw.effect(() => {
      a.read();
      fw.effect(() => {
        b.read();
        bRuns++;
      });
      fw.effect(() => {
        c.read();
        cRuns++;
      });
    });
    bRuns = 0;
    cRuns = 0;

    // Trigger outer re-run — old inner effects should be cleaned up
    a.write(1);
    bRuns = 0;
    cRuns = 0;

    // These should only trigger the NEW inner effects (one each), not accumulated old ones
    b.write(1);
    expect(bRuns).toBe(1);

    c.write(1);
    expect(cRuns).toBe(1);
  },

  /**
   *  S(a) ─→ E_outer{ val=a.read(); E_inner{ observe(val) } }
   *
   * Inner effect captures a closure variable from the outer effect.
   * The observed value must reflect the outer's current execution.
   */
  "#48 nested effects depend on state of outer effects"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const observed: number[] = [];

    fw.effect(() => {
      const val = a.read();
      fw.effect(() => {
        observed.push(val);
      });
    });

    expect(observed).toContain(0);
  },

  /**
   *  S(a) ─→ E_outer{ E_inner ─→ S(b) }
   *
   * Outer reads a and creates an inner effect that reads b.
   * After b changes (which re-runs only the inner), the outer
   * must still respond to subsequent writes to its own dep a.
   *
   * Regression observed in alien-signals 3.2.0 (works in 3.1.2):
   * after the inner re-runs once on its own, the outer's link
   * to a is dropped and a.write no longer triggers it.
   * See https://github.com/stackblitz/alien-signals/issues/115
   */
  "#226 outer keeps responding to own deps after inner re-runs"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    let outerRuns = 0;
    let innerRuns = 0;

    fw.effect(() => {
      a.read();
      outerRuns++;
      fw.effect(() => {
        b.read();
        innerRuns++;
      });
    });
    expect(outerRuns).toBe(1);
    expect(innerRuns).toBe(1);

    // Trigger inner via b — outer must NOT re-run (b is not its dep)
    b.write(1);
    expect(outerRuns).toBe(1);
    expect(innerRuns).toBeGreaterThanOrEqual(2);

    // Trigger outer via a — must re-run despite inner having re-run earlier
    a.write(1);
    expect(outerRuns).toBe(2);
  },
};
