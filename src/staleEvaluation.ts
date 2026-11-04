import { expect } from "./assert.ts";
import type { ReactiveFramework } from "./framework.ts";
import type { TestCase } from "./suite.ts";

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
export const name = "Stale Evaluation Order";
export const cases: TestCase[] = [
  /**
   *  S(a) ─→ C(b) ─→ C(d)
   *  S(a) ─→ C(c) ─→ C(d)
   *
   * Diamond dependency: both C(b) and C(c) depend on S(a),
   * and C(d) depends on both. After a single write to S(a),
   * C(b) should re-evaluate exactly once and C(d) exactly once.
   */
  {
    id: 94,
    title: "stale invocation does not trigger pending computations",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c)
   *
   * Linear chain: after S(a) changes, C(b) must be
   * re-evaluated before C(c) so that C(c) never sees a
   * stale intermediate value.
   */
  {
    id: 95,
    title: "stale computations evaluated before their dependees",
    run(fw: ReactiveFramework) {
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
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d)
   *           +1       +1       +1
   *
   * After writing S(a)=10, reading any node in the chain
   * (b, c, d) must return the fully updated value — no
   * stale intermediate results.
   */
  {
    id: 158,
    title: "stale chained computed accessed after update: values fresh",
    run(fw: ReactiveFramework) {
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
  {
    id: 159,
    title: "pending computation created after dirty signal still updates",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => a.read() * 2);

      a.write(5);

      const c = fw.computed(() => b.read() + 1);
      expect(c.read()).toBe(11);

      a.write(10);
      expect(c.read()).toBe(21);
    },
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
  {
    id: 97,
    title: "flags indirectly updated during dirty-checking",
    run(fw: ReactiveFramework) {
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
  },
];
