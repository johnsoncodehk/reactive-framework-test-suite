import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Graph Propagation
 *
 * Tests that changes propagate correctly through dependency graphs:
 * each node evaluates at most once, topological order is respected,
 * and value-equality cuts propagation.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   *C       computed that always returns a constant (value-equality cut)
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 */
export const section = "Graph Propagation";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *     S(a)
   *    /    \
   *  C(b)  C(c)
   *    \    /
   *     C(d)
   *
   * Classic diamond. d must evaluate only once per update.
   */
  "#1 diamond"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => a.read());

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return b.read() + " " + c.read();
    });

    expect(d.read()).toBe("a a");
    expect(dCalls).toBe(1);

    a.write("aa");
    expect(d.read()).toBe("aa aa");
    expect(dCalls).toBe(2);
  },

  /**
   *     S(a)
   *    /    \
   *  C(b)  C(c)
   *    \    /
   *     C(d)
   *      |
   *     C(e)
   *
   * Diamond with a tail. e must evaluate only once.
   */
  "#2 diamond + tail"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => a.read());
    const d = fw.computed(() => b.read() + " " + c.read());

    let eCalls = 0;
    const e = fw.computed(() => {
      eCalls++;
      return d.read();
    });

    expect(e.read()).toBe("a a");
    expect(eCalls).toBe(1);

    a.write("aa");
    expect(e.read()).toBe("aa aa");
    expect(eCalls).toBe(2);
  },

  /**
   *       S(a)
   *      /    \
   *    C(b)  C(c)
   *     |      |
   *     |    C(d)
   *      \    /
   *       C(e)
   *      /    \
   *    C(f)  C(g)
   *
   * Asymmetric diamond (different depths) with fan-out at the bottom.
   * e, f, g each evaluate only once.
   */
  "#3 jagged diamond + tails"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => a.read());
    const d = fw.computed(() => c.read());

    let eCalls = 0;
    const e = fw.computed(() => {
      eCalls++;
      return b.read() + " " + d.read();
    });

    let fCalls = 0;
    const f = fw.computed(() => {
      fCalls++;
      return e.read();
    });

    let gCalls = 0;
    const g = fw.computed(() => {
      gCalls++;
      return e.read();
    });

    expect(f.read()).toBe("a a");
    expect(g.read()).toBe("a a");

    eCalls = 0;
    fCalls = 0;
    gCalls = 0;

    a.write("b");
    expect(e.read()).toBe("b b");
    expect(eCalls).toBe(1);
    expect(f.read()).toBe("b b");
    expect(fCalls).toBe(1);
    expect(g.read()).toBe("b b");
    expect(gCalls).toBe(1);
  },

  /**
   *    S(a)
   *    / |
   *  C(b)|
   *    \ |
   *    C(c)
   *      |
   *    C(d)
   *
   * Skip-connection: c reads both a and b (a's child).
   * d must evaluate only once despite two paths from a to c.
   */
  "#5 drop A→B→A updates"(fw: ReactiveFramework) {
    const a = fw.signal(2);
    const b = fw.computed(() => a.read() - 1);
    const c = fw.computed(() => a.read() + b.read());

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return "d: " + c.read();
    });

    expect(d.read()).toBe("d: 3");
    expect(dCalls).toBe(1);

    a.write(4);
    expect(d.read()).toBe("d: 7");
    expect(dCalls).toBe(2);
  },

  /**
   *      S(a)
   *     /    \
   *   C(b)  *C(c)  ← c always returns "c"
   *     \    /
   *      C(d)
   *
   * One branch unchanged. d must still update from b.
   */
  "#6 one unchanged dep does not block update from changed dep"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => {
      a.read();
      return "c";
    });

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return b.read() + " " + c.read();
    });

    expect(d.read()).toBe("a c");
    dCalls = 0;

    a.write("aa");
    expect(d.read()).toBe("aa c");
    expect(dCalls).toBe(1);
  },

  /**
   *      S(a)
   *     /    \
   *   *C(b)  *C(c)  ← both always return constants
   *     \    /
   *      C(d)
   *
   * Both branches unchanged. d must NOT re-evaluate (propagation cut).
   */
  "#7 unchanged computed values stop propagation to downstream"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal("a");
    const b = fw.computed(() => {
      a.read();
      return "b";
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

    expect(d.read()).toBe("b c");
    dCalls = 0;

    a.write("aa");
    expect(d.read()).toBe("b c");
    expect(dCalls).toBe(0);
  },

  /**
   *     S(a)
   *    /    \
   *  C(b)  C(c)
   *    \    /
   *     C(d)
   *
   * Diamond — verify evaluation order: d runs after both b and c.
   */
  "#8 topological order"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const order: string[] = [];

    const b = fw.computed(() => {
      const v = a.read();
      order.push("b");
      return v;
    });
    const c = fw.computed(() => {
      const v = a.read();
      order.push("c");
      return v;
    });
    const d = fw.computed(() => {
      const v = b.read() + c.read();
      order.push("d");
      return v;
    });

    expect(d.read()).toBe(0);
    order.length = 0;

    a.write(1);
    expect(d.read()).toBe(2);
    expect(order.indexOf("d")).toBeGreaterThan(order.indexOf("b"));
    expect(order.indexOf("d")).toBeGreaterThan(order.indexOf("c"));
    expect(order.filter((x) => x === "d")).toHaveLength(1);
  },

  /**
   *  S(a) → C(b)
   *    \    /
   *     C(c)
   *    /
   *  S(a) → C(d)  [same a]
   *
   *  a→b, {a,b}→c, {a,c}→d
   *
   * Increasing fan-in at each level. Each node evaluates once.
   */
  "#9 linear convergence"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read() + b.read();
    });

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return a.read() + c.read();
    });

    expect(d.read()).toBe(0);
    cCalls = 0;
    dCalls = 0;

    a.write(1);
    expect(d.read()).toBe(3);
    expect(cCalls).toBe(1);
    expect(dCalls).toBe(1);
  },

  /**
   *  a→b, {b,a}→c, {c,b}→d, {d,c}→e
   *
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d) ─→ C(e)
   *    \─────→ /  \─────→ /  \─────→ /
   *
   * Each level reads previous two. Naive impl is O(2^n).
   * Each node must evaluate exactly once.
   */
  "#10 exponential convergence"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return b.read() + a.read();
    });

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return c.read() + b.read();
    });

    let eCalls = 0;
    const e = fw.computed(() => {
      eCalls++;
      return d.read() + c.read();
    });

    expect(e.read()).toBe(0);
    cCalls = 0;
    dCalls = 0;
    eCalls = 0;

    a.write(1);
    expect(e.read()).toBe(5);
    expect(cCalls).toBe(1);
    expect(dCalls).toBe(1);
    expect(eCalls).toBe(1);
  },

  /**
   *  S(a) → C(c) ← E(e1)  [disposed]
   *                ← E(e2)  [still alive]
   *
   * Two effects share one computed. After e1 disposes,
   * e2 must still receive updates.
   */
  "#116 other listeners still notified after one disposes"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const c = fw.computed(() => a.read() * 2);
    let runs1 = 0;
    let runs2 = 0;

    const dispose1 = fw.effect(() => {
      c.read();
      runs1++;
    });

    fw.effect(() => {
      c.read();
      runs2++;
    });

    expect(runs1).toBe(1);
    expect(runs2).toBe(1);

    dispose1();

    a.write(1);
    expect(runs1).toBe(1);
    expect(runs2).toBe(2);

    a.write(2);
    expect(runs1).toBe(1);
    expect(runs2).toBe(3);
  },

  /**
   *       S(a)
   *      / |  \
   *   C(b) *C(c) *C(d)  ← c, d always return constants
   *      \ |  /
   *       C(e)
   *
   * Three-way diamond, two branches constant. e must still update from b.
   */
  "#157 three-way diamond: sub updates when two of three deps unmark"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal("a");
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => {
      a.read();
      return "c";
    });
    const d = fw.computed(() => {
      a.read();
      return "d";
    });

    let eCalls = 0;
    const e = fw.computed(() => {
      eCalls++;
      return b.read() + " " + c.read() + " " + d.read();
    });

    expect(e.read()).toBe("a c d");
    eCalls = 0;

    a.write("aa");
    expect(e.read()).toBe("aa c d");
    expect(eCalls).toBe(1);
  },

  /**
   *      S(a)
   *     /    \
   *   *C(b)   C(d)
   *     |
   *   *C(c)
   *     |
   *    E(eff) → dispose
   *
   * b, c only alive via effect. After disposing, a write must NOT
   * re-evaluate b or c (they have no subscribers left).
   */
  "#187 effect disposal deactivates upstream computed"(fw: ReactiveFramework) {
    const a = fw.signal("a");
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
    const d = fw.computed(() => a.read());

    let result = "";
    const dispose = fw.effect(() => {
      result = c.read();
    });

    expect(result).toBe("a");
    expect(d.read()).toBe("a");

    bCalls = 0;
    cCalls = 0;
    dispose();

    a.write("aa");

    expect(bCalls).toBe(0);
    expect(cCalls).toBe(0);
    expect(d.read()).toBe("aa");
  },

  /**
   *  S(a)  S(b)
   *    |     |
   *    |   C(c)  ← c reads b
   *     \  /
   *     C(d)     ← d reads c only when a === 0
   *
   * Batch: a=1 and b=1. After batch, a≠0 → d skips c.
   * c must NOT recompute (unreachable).
   */
  "#188 batch + dynamic deps: unnecessary recompute avoided"(
    fw: ReactiveFramework
  ) {
    if (!fw.batch) throw new SkipTest("no batch");
    let cCalls = 0;
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.computed(() => {
      b.read();
      cCalls++;
    });
    const d = fw.computed(() => {
      if (a.read() === 0) {
        c.read();
      }
    });
    d.read();
    expect(cCalls).toBe(1);

    fw.batch(() => {
      b.write(1);
      a.write(1);
    });
    d.read();
    expect(cCalls).toBe(1);
  },

  /**
   *  S(a)  S(b)  S(c)
   *    |           |
   *    |         C(d)  ← d reads c
   *    |          /
   *    C(e)      ← e reads b,d when a>0; only b when a≤0
   *
   * Three signals change. d recomputes once, e recomputes once.
   * When a≤0, d becomes unreachable → should NOT recompute.
   */
  "#189 multi-signal change: topological ordering preserved"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(1);
    const b = fw.signal(1);
    const c = fw.signal(1);

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return c.read();
    });

    const e = fw.computed(() => {
      if (a.read() > 0) {
        b.read();
        d.read();
      } else {
        b.read();
      }
    });

    e.read();
    dCalls = 0;

    a.write(2);
    b.write(2);
    c.write(2);
    e.read();
    expect(dCalls).toBe(1);

    dCalls = 0;
    a.write(-1);
    b.write(-1);
    c.write(-1);
    e.read();
    expect(dCalls).toBe(0);
  },

  /**
   *  S(a) → C(b) → C(c)
   *                  |
   *                 E(eff)  ← subscribes after c.read()
   *
   * Computed is read directly first, then an effect subscribes.
   * Effect must still be notified on subsequent changes.
   */
  "#190 computed notifies newly-subscribed effect after prior read"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => b.read());
    c.read();

    let runs = 0;
    fw.effect(() => {
      c.read();
      runs++;
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);
  },

  /**
   *  S(s) → C(c)
   *           |
   *         E(eff)  ← subscribes after s already changed
   *
   * Source changes before effect subscribes.
   * Effect must see the latest value, not stale.
   */
  "#191 effect sees latest computed value when subscribing after source change"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    const c = fw.computed(() => s.read());
    c.read();

    s.write(1);

    let seen: number | undefined;
    fw.effect(() => {
      seen = c.read();
    });
    expect(seen).toBe(1);
  },

  /**
   *    S(s)
   *      |
   *    *C(c)  ← always returns 0
   *      |
   *    E(eff)
   *
   * Computed value unchanged despite source change.
   * Effect must NOT re-run (propagation cut by value-equality).
   */
  "#192 effect not re-run when computed dep value unchanged"(
    fw: ReactiveFramework
  ) {
    const s = fw.signal(0);
    const c = fw.computed(() => {
      s.read();
      return 0;
    });
    let runs = 0;
    fw.effect(() => {
      c.read();
      runs++;
    });
    expect(runs).toBe(1);

    s.write(1);
    expect(runs).toBe(1);
  },

  /**
   *  S(a)  S(b)
   *    \    /
   *     C(c)
   *      |
   *    E(eff)
   *
   * Two independent signals feed one computed.
   * Both change — c and effect must evaluate only once each.
   */
  "#204 multi-source fan-in"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const a = fw.signal(1);
    const b = fw.signal(10);

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read() + b.read();
    });

    let runs = 0;
    fw.effect(() => {
      c.read();
      runs++;
    });
    expect(c.read()).toBe(11);
    expect(runs).toBe(1);
    cCalls = 0;
    runs = 0;

    fw.batch(() => {
      a.write(2);
      b.write(20);
    });
    expect(c.read()).toBe(22);
    expect(cCalls).toBe(1);
    expect(runs).toBe(1);
  },

  /**
   *  S(a)    S(b)
   *    | \  / |
   *    |  \/  |
   *    |  /\  |
   *    | /  \ |
   *  C(c)   C(d)
   *     \   /
   *      C(e)
   *
   * Two signals cross-feed two computeds joining at e.
   * Both signals change — c, d, e each evaluate once.
   */
  "#205 multi-source cross-diamond"(fw: ReactiveFramework) {
    const a = fw.signal(1);
    const b = fw.signal(10);

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return a.read() + b.read();
    });

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return a.read() * b.read();
    });

    let eCalls = 0;
    const e = fw.computed(() => {
      eCalls++;
      return c.read() + d.read();
    });

    expect(e.read()).toBe(21);
    cCalls = 0;
    dCalls = 0;
    eCalls = 0;

    a.write(2);
    b.write(20);
    expect(e.read()).toBe(62);
    expect(cCalls).toBe(1);
    expect(dCalls).toBe(1);
    expect(eCalls).toBe(1);
  },

  /**
   *       S(a)
   *      /    \
   *    C(b)  C(c)
   *      \    /
   *       C(d)
   *      /    \
   *    C(e)  C(f)
   *      \    /
   *       C(g)
   *
   * Two diamonds stacked. Each node evaluates once.
   */
  "#206 stacked diamonds"(fw: ReactiveFramework) {
    const a = fw.signal(1);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => a.read());

    let dCalls = 0;
    const d = fw.computed(() => {
      dCalls++;
      return b.read() + c.read();
    });

    const e = fw.computed(() => d.read());
    const f = fw.computed(() => d.read());

    let gCalls = 0;
    const g = fw.computed(() => {
      gCalls++;
      return e.read() + f.read();
    });

    expect(g.read()).toBe(4);
    dCalls = 0;
    gCalls = 0;

    a.write(2);
    expect(g.read()).toBe(8);
    expect(dCalls).toBe(1);
    expect(gCalls).toBe(1);
  },

  /**
   *             S(a)
   *       / / |  |  \ \
   *     C0 C1 C2 C3 C4 C5
   *      |  |  |  |  |  |
   *     E0 E1 E2 E3 E4 E5
   *
   * Wide fan-out: one signal, many computed+effect pairs.
   * All effects fire exactly once.
   */
  "#207 wide fan-out: all effects fire once"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const N = 6;
    const runs = new Array(N).fill(0);

    for (let i = 0; i < N; i++) {
      const c = fw.computed(() => a.read() + i);
      const idx = i;
      fw.effect(() => {
        c.read();
        runs[idx]++;
      });
    }

    for (let i = 0; i < N; i++) expect(runs[i]).toBe(1);

    a.write(1);
    for (let i = 0; i < N; i++) expect(runs[i]).toBe(2);

    a.write(2);
    for (let i = 0; i < N; i++) expect(runs[i]).toBe(3);
  },

  /**
   *  S(a) → C(b) → C(c) → C(d)
   *                         /
   *  S(a) → C(e) ─────────
   *
   *  depth-3 path and depth-1 path join at f.
   *  f must evaluate only once despite large depth difference.
   */
  "#208 deep asymmetric join (depth 3 vs 1)"(fw: ReactiveFramework) {
    const a = fw.signal(1);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => b.read());
    const d = fw.computed(() => c.read());
    const e = fw.computed(() => a.read());

    let fCalls = 0;
    const f = fw.computed(() => {
      fCalls++;
      return d.read() + e.read();
    });

    expect(f.read()).toBe(2);
    fCalls = 0;

    a.write(2);
    expect(f.read()).toBe(4);
    expect(fCalls).toBe(1);
  },
};
