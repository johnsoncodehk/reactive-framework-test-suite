import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";

/**
 * Stale Evaluation Order
 *
 * Tests that computeds are re-evaluated in topological
 * (dependency-respecting) order after a source signal changes.
 * A correct framework must never evaluate a downstream computed
 * before its upstream dependency has been refreshed.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 */
export const section = "Stale Evaluation Order";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ─→ C(b) ─→ C(d)
   *  S(a) ─→ C(c) ─→ C(d)
   *
   * Diamond dependency: both C(b) and C(c) depend on S(a),
   * and C(d) depends on both. After a single write to S(a),
   * C(b) should re-evaluate exactly once and C(d) exactly once.
   */
  "#94 stale invocation does not trigger pending computations"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let bCalls = 0;
    const b = fw.computed(() => {
      bCalls++;
      return a.read();
    });
    const c = fw.computed(() => {
      a.read();
      return "c";
    });
    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return b.read() + " " + c.read();
    });

    expect(d.read()).toBe("0 c");
    bCalls = 0;
    dCalls = 0;

    a.write(1);
    expect(d.read()).toBe("1 c");
    expect(bCalls).toBe(1);
    expect(dCalls).toBe(1);
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c)
   *
   * Linear chain: after S(a) changes, C(b) must be
   * re-evaluated before C(c) so that C(c) never sees a
   * stale intermediate value.
   */
  "#95 stale computations evaluated before their dependees"(
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
      return b.read();
    });

    expect(c.read()).toBe(0);
    order.length = 0;

    a.write(1);
    expect(c.read()).toBe(1);
    expect(order.indexOf("b")).toBeLessThan(order.indexOf("c"));
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d)
   *
   * Three-level computed chain: after each write to S(a),
   * the staleness flag must propagate all the way down to
   * C(d) so that reading C(d) returns the fresh value.
   */
  "#96 downstream correctly marked stale on dep change"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => b.read());
    const d = fw.computed(() => c.read());

    expect(d.read()).toBe("a");
    a.write("b");
    expect(d.read()).toBe("b");
    a.write("c");
    expect(d.read()).toBe("c");
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d)
   *           +1       +1       +1
   *
   * After writing S(a)=10, reading any node in the chain
   * (b, c, d) must return the fully updated value — no
   * stale intermediate results.
   */
  "#158 stale chained computed accessed after update: values fresh"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() + 1);
    const c = fw.computed(() => b.read() + 1);
    const d = fw.computed(() => c.read() + 1);

    expect(d.read()).toBe(3);

    a.write(10);

    expect(b.read()).toBe(11);
    expect(c.read()).toBe(12);
    expect(d.read()).toBe(13);
  },

  /**
   *  S(a) ─→ C(b)
   *     (write a=5)
   *  S(a) ─→ C(b) ─→ C(c)   (c created after write)
   *
   * A computed created after its upstream signal has already
   * been written must still pick up the dirty value on first
   * read and remain reactive to further writes.
   */
  "#159 pending computation created after dirty signal still updates"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);

    a.write(5);

    const c = fw.computed(() => b.read() + 1);
    expect(c.read()).toBe(11);

    a.write(10);
    expect(c.read()).toBe(21);
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c)
   *    │               │
   *    └───────────────→ C(d) = a + c
   *
   * C(d) depends on both S(a) directly and C(c) transitively.
   * During dirty-checking of C(d), the framework must first
   * refresh the indirect path (b → c) so that C(d) sees
   * consistent values from both branches.
   */
  "#97 flags indirectly updated during dirty-checking"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => b.read());
    const d = fw.computed(() => {
      // d depends on both a and c
      return a.read() + c.read();
    });

    expect(d.read()).toBe(0);
    a.write(1);
    // a=1, b=1, c=1, d=1+1=2
    expect(d.read()).toBe(2);
  },
};
