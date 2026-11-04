import { expect } from "./assert.ts";
import type { ReactiveFramework } from "./framework.ts";
import type { Probe } from "./suite.ts";
import { SkipTest } from "./framework.ts";

/**
 * Behavioral Differences
 *
 * Probes of framework-specific semantics where reactive libraries
 * legitimately diverge. Each probe declares its valid variants
 * (e.g. "lazy" / "eager") and reports which one a framework
 * implements, rather than asserting a single correct answer.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 */
export const name = "Behavioral Differences";
export const cases: Probe[] = [
  /**
   *  S(a) ─→ C(b)
   *
   * Determines whether creating a computed eagerly evaluates
   * its body or defers until the first `.read()` call.
   */
  {
    id: 17,
    title: "computed evaluation timing",
    variants: ["lazy", "eager"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let calls = 0;
      const b = fw.computed(() => {
        calls++;
        return a.read();
      });
      const eagerCalls = calls;
      b.read();
      return eagerCalls === 0 ? "lazy" : "eager";
    },
  },

  /**
   *  S(a) ─→ C(b)
   *  S(a) ─→ C(c)   (c is never read)
   *
   * Determines whether a computed that is created but never
   * read still subscribes to its source and re-evaluates
   * when the source changes.
   */
  {
    id: 15,
    title: "unread computed subscription",
    variants: ["no subscription", "subscribes eagerly"],
    run(fw: ReactiveFramework) {
      const a = fw.signal("a");
      const b = fw.computed(() => a.read());

      let cCalls = 0;
      const c = fw.computed(() => {
        cCalls++;
        return a.read();
      });
      // c is never read
      b.read();
      const callsBefore = cCalls;
      a.write("aa");
      b.read();
      return cCalls === callsBefore ? "no subscription" : "subscribes eagerly";
    },
  },

  /**
   *  S(a) ─→ C(c)
   *  S(b) ─→ C(c)
   *
   * Two sources are written before C(c) is read. Checks
   * whether the framework coalesces into a single
   * re-evaluation or evaluates once per dirty source.
   */
  {
    id: 146,
    title: "recompute count on multiple dep changes",
    variants: ["single recompute", "multiple recomputes"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);
      let cCalls = 0;
      const c = fw.computed(() => {
        cCalls++;
        return a.read() + b.read();
      });
      c.read();
      cCalls = 0;
      a.write(1);
      b.write(1);
      c.read();
      return cCalls <= 1 ? "single recompute" : "multiple recomputes";
    },
  },

  /**
   *  S(a) ─→ C(c)
   *  a.write(NaN) when a already holds NaN
   *
   * Checks whether the framework uses Object.is (NaN === NaN)
   * or strict === (NaN !== NaN) to decide if a signal value
   * has changed.
   */
  {
    id: 29,
    title: "NaN equality semantics",
    variants: ["Object.is", "==="],
    run(fw: ReactiveFramework) {
      const a = fw.signal(NaN);
      let calls = 0;
      const c = fw.computed(() => {
        calls++;
        return a.read();
      });
      c.read();
      calls = 0;
      a.write(NaN);
      c.read();
      return calls === 0 ? "Object.is" : "===";
    },
  },

  /**
   *  S(a) ─→ C(c) ─→ C(d)
   *
   * C(c) returns NaN on consecutive evaluations.
   * Similar to #29, but tests equality semantics at the
   * computed-to-computed boundary. If C(c) returns NaN twice,
   * does C(d) skip re-evaluation (Object.is) or re-evaluate
   * (===)?
   */
  {
    id: 167,
    title: "computed NaN downstream propagation",
    variants: ["Object.is", "==="],
    run(fw: ReactiveFramework) {
      const a = fw.signal(1);
      let value: number = 5;
      const c = fw.computed(() => {
        a.read();
        return value;
      });
      let dCalls = 0;
      const d = fw.computed(() => {
        dCalls++;
        return c.read();
      });
      d.read();

      value = NaN;
      a.write(2);
      d.read();
      dCalls = 0;

      a.write(3);
      d.read();
      return dCalls === 0 ? "Object.is" : "===";
    },
  },

  /**
   *  S(a) ─→ C(c)
   *
   * Writes the same object reference back to a signal
   * (`a.write(obj)` where `obj` is already held).
   * Checks whether the framework treats it as a no-op
   * (skipped) or as a change that triggers downstream
   * re-evaluation.
   */
  {
    id: 30,
    title: "same-reference signal write",
    variants: ["skips", "propagates"],
    run(fw: ReactiveFramework) {
      const obj = { x: 1 };
      const a = fw.signal(obj);
      let calls = 0;
      const c = fw.computed(() => {
        calls++;
        return a.read();
      });
      c.read();
      calls = 0;
      a.write(obj);
      c.read();
      return calls === 0 ? "skips" : "propagates";
    },
  },

  /**
   * Calls `fw.batch(() => 42)` and checks whether `batch`
   * forwards the return value of its callback to the caller.
   */
  {
    id: 176,
    title: "batch return value",
    variants: ["returns value", "returns void"],
    run(fw: ReactiveFramework) {
      if (!fw.batch) throw new SkipTest("no batch");
      const result = (fw.batch as Function)(() => 42);
      return result === 42 ? "returns value" : "returns void";
    },
  },

  /**
   *  S(a) ─→ E(eff1)          eff1: if a, b.write(1)
   *  S(a) ─→ E(eff2)          eff2: if a, read b
   *  S(b)  ─→ E(eff2)
   *
   * Two effects share S(a). When S(a) is set to true, eff1
   * writes to S(b). Does eff2 see the pre-write value of
   * S(b) (isolation) or the post-write value?
   */
  {
    id: 173,
    title: "mid-propagation read isolation",
    variants: ["pre-write", "post-write", "throws"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(false);
      const b = fw.signal(0);
      let readerSaw: number | undefined;
      try {
        fw.effect(() => {
          if (a.read()) b.write(1);
        });
        fw.effect(() => {
          if (a.read()) readerSaw = b.read();
        });
        a.write(true);
        if (readerSaw === 0) return "pre-write";
        if (readerSaw === 1) return "post-write";
        throw new Error(`reader saw ${readerSaw}`);
      } catch {
        return "throws";
      }
    },
  },

  /**
   *  S(a) ─→ E(eff)
   *  S(b)
   *  eff: b.write(1); then b.read()
   *
   * Inside a single effect run, a signal is written and then
   * immediately read back. Does the read return the old value
   * (pre-write) or the just-written value (post-write)?
   */
  {
    id: 174,
    title: "intra-run read-after-write",
    variants: ["pre-write", "post-write", "throws"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(false);
      const b = fw.signal(0);
      let readAfterWrite: number | undefined;
      try {
        fw.effect(() => {
          if (a.read()) {
            b.write(1);
            readAfterWrite = b.read();
          }
        });
        a.write(true);
        if (readAfterWrite === 0) return "pre-write";
        if (readAfterWrite === 1) return "post-write";
        throw new Error(`read after write saw ${readAfterWrite}`);
      } catch {
        return "throws";
      }
    },
  },

  /**
   *  S(a) ─→ E(eff)   (eff throws on first run)
   *
   * An effect reads S(a) then throws during its initial
   * execution. Checks whether the framework unsubscribes
   * the effect or keeps it subscribed for future writes.
   */
  {
    id: 88,
    title: "effect subscription after first-run throw",
    variants: ["unsubscribes", "keeps subscribed"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let runs = 0;
      try {
        fw.effect(() => {
          runs++;
          a.read();
          throw new Error("first run error");
        });
      } catch {}
      runs = 0;
      try {
        a.write(1);
      } catch {}
      return runs === 0 ? "unsubscribes" : "keeps subscribed";
    },
  },

  /**
   *  S(a) ─→ E(eff1)
   *  S(a) ─→ E(eff2)   (eff2 throws when a===1)
   *  S(a) ─→ E(eff3)
   *
   * Three effects subscribe to S(a). The middle one throws
   * on update. Checks whether the framework continues
   * flushing the remaining effects or halts the entire flush.
   */
  {
    id: 106,
    title: "effect throw isolation in flush",
    variants: ["continues", "halts flush"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let runs1 = 0;
      let runs3 = 0;
      fw.effect(() => {
        a.read();
        runs1++;
      });
      try {
        fw.effect(() => {
          const v = a.read();
          if (v === 1) throw new Error("effect2 error");
        });
      } catch {}
      fw.effect(() => {
        a.read();
        runs3++;
      });
      runs1 = 0;
      runs3 = 0;
      try {
        a.write(1);
      } catch {}
      return runs1 > 0 && runs3 > 0 ? "continues" : "halts flush";
    },
  },

  /**
   *  S(a) ─→ C(b)   (b throws when a===0)
   *
   * A computed throws on first evaluation. On the second read
   * (with deps unchanged), does the framework cache the error,
   * re-evaluate the body, or return a stale value?
   */
  {
    id: 86,
    title: "computed error caching",
    variants: ["re-evaluates", "caches error", "returns stale"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let calls = 0;
      const b = fw.computed(() => {
        calls++;
        if (a.read() === 0) throw new Error("cached error");
        return a.read();
      });
      try {
        b.read();
      } catch {}
      const callsAfter = calls;
      let secondThrew = false;
      try {
        b.read();
      } catch {
        secondThrew = true;
      }
      if (calls > callsAfter) return "re-evaluates";
      if (secondThrew) return "caches error";
      return "returns stale";
    },
  },

  /**
   *  S(a) ─→ C(b)   (b throws a string when a===0)
   *
   * Same as #86 but the thrown value is a plain string instead
   * of an Error instance. Tests whether non-Error throw values
   * are handled identically.
   */
  {
    id: 107,
    title: "non-Error throw caching",
    variants: ["re-evaluates", "caches error", "returns stale"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let calls = 0;
      const b = fw.computed(() => {
        calls++;
        if (a.read() === 0) throw "string error";
        return a.read();
      });
      try {
        b.read();
      } catch {}
      const callsAfter = calls;
      let secondThrew = false;
      try {
        b.read();
      } catch {
        secondThrew = true;
      }
      if (calls > callsAfter) return "re-evaluates";
      if (secondThrew) return "caches error";
      return "returns stale";
    },
  },

  /**
   *  S(s) ─→ C(c) ─→ E(eff)
   *  eff: if c > 0, s.write(0)   (self-correcting write)
   *
   * An effect reads a computed chain and writes back to the
   * root signal when the value is non-zero, creating a
   * feedback loop. Whether the effect re-runs after its own
   * write varies; blocking later writes is a defect (#212).
   */
  {
    id: 49,
    title: "inner write re-run through computed chain",
    variants: ["runs once per write", "runs twice per write"],
    run(fw: ReactiveFramework) {
      const s = fw.signal(0);
      const c = fw.computed(() => s.read());
      let runs = 0;

      try {
        fw.effect(() => {
          runs++;
          if (runs > 20) throw new Error("bail");
          if (c.read() > 0) s.write(0);
        });
      } catch {}

      runs = 0;
      try { s.write(1); } catch {}
      const run1 = runs;
      const val1 = s.read();

      runs = 0;
      try { s.write(2); } catch {}
      const run2 = runs;
      const val2 = s.read();

      if (run1 === 0 || val1 !== 0 || run2 === 0 || val2 !== 0) {
        throw new Error("self-correcting write did not settle (see #212)");
      }
      if (run1 !== run2) throw new Error(`runs ${run1}x, then ${run2}x`);
      if (run1 === 1) return "runs once per write";
      if (run1 === 2) return "runs twice per write";
      throw new Error(`runs ${run1}x per write`);
    },
  },

  /**
   *  S(a) ─→ E(eff)
   *  eff: a.write(a.read() + 1)   (unconditional self-increment)
   *
   * An effect unconditionally reads and increments its source
   * signal, creating an infinite loop. Checks whether the
   * framework detects the cycle (throws), runs without
   * throwing, or requires a manual bail-out.
   */
  {
    id: 62,
    title: "infinite loop in effect",
    variants: ["cycle detected", "no throw", "manual bail (200+)"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let iterations = 0;
      try {
        fw.effect(() => {
          if (iterations++ > 200) throw new Error("bail");
          a.write(a.read() + 1);
        });
        return "no throw";
      } catch {
        return iterations <= 200 ? "cycle detected" : "manual bail (200+)";
      }
    },
  },

  /**
   *  S(a) ─→ E(eff1)
   *  eff1: b.write(a+1); c.write(a+2)
   *  S(b) ─→ C(d)
   *  S(c) ─→ C(d) ─→ E(eff2)
   *
   * An effect writes to two signals that both feed into a
   * downstream computed. Checks whether the framework batches
   * the two writes so that E(eff2) runs only once.
   */
  {
    id: 175,
    title: "effect multi-signal write batching",
    variants: ["batched", "unbatched"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);
      const c = fw.signal(0);
      fw.effect(() => {
        const v = a.read();
        b.write(v + 1);
        c.write(v + 2);
      });
      const d = fw.computed(() => b.read() + c.read());
      let runs = 0;
      fw.effect(() => {
        d.read();
        runs++;
      });
      runs = 0;
      a.write(10);
      return runs <= 1 ? "batched" : "unbatched";
    },
  },

  /**
   *  run{ E(child ─→ S(source)); throw }
   *
   * A scope/root body creates a child effect then throws before
   * returning. Checks whether the framework disposes child
   * effects created before the throw or leaves them alive.
   */
  {
    id: 246,
    title: "throwing run body child effect cleanup",
    variants: ["disposes children", "children survive"],
    run(fw: ReactiveFramework) {
      const source = fw.signal(0);
      let childRuns = 0;

      try {
        fw.run(() => {
          fw.effect(() => {
            childRuns++;
            source.read();
          });
          throw new Error("scope setup failed");
        });
      } catch {}

      childRuns = 0;
      try {
        source.write(1);
      } catch {}
      return childRuns === 0 ? "disposes children" : "children survive";
    },
  },

  /**
   *  E_outer{ E_inner1, E_inner2, E_inner3 } → dispose
   *
   * Probes the cleanup order of sibling effects when their owner
   * disposes. Frameworks with parent-child cascade tend to use
   * either LIFO (reverse creation) or FIFO (creation order). A
   * flat-effect framework (no cascade) reports "no cascade".
   */
  {
    id: 244,
    title: "sibling cleanup order on dispose",
    variants: ["LIFO", "FIFO", "partial cascade", "no cascade"],
    run(fw: ReactiveFramework) {
      if (!fw.effectCleanup) throw new SkipTest("no effectCleanup");
      const order: number[] = [];

      const dispose = fw.effect(() => {
        fw.effect(() => {
          return () => order.push(1);
        });
        fw.effect(() => {
          return () => order.push(2);
        });
        fw.effect(() => {
          return () => order.push(3);
        });
      });

      dispose();
      if (order.length === 0) return "no cascade";
      if (order.length < 3) return "partial cascade";
      const asStr = order.join(",");
      if (asStr === "3,2,1") return "LIFO";
      if (asStr === "1,2,3") return "FIFO";
      throw new Error(`unexpected cleanup order ${asStr}`);
    },
  },

  /**
   *  S(a) → C(c) ═→ S(a) [increments a]
   *
   * Computed writes to its own dependency. After the first read, c's
   * value and a agree, so caching c and re-evaluating it on the next
   * read are both consistent; forbidding the write is valid too.
   */
  {
    id: 172,
    title: "computed writing to own dep: next read",
    variants: ["re-evaluates", "caches", "throws"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let computeCalls = 0;
      try {
        const c = fw.computed(() => {
          computeCalls++;
          a.write(a.read() + 1);
          return a.read();
        });
        c.read();
        const callsAfterFirst = computeCalls;
        c.read();
        return computeCalls > callsAfterFirst ? "re-evaluates" : "caches";
      } catch {
        return "throws";
      }
    },
  },

  /**
   *  S(a) ─→ E_outer{ E_middle{ E_inner } }
   *                ✕ dispose outer
   *
   * Three levels of nesting, all reading a. Hierarchical ownership
   * disposes middle and inner with outer; a flat effect model keeps
   * them running (see #244).
   */
  {
    id: 209,
    title: "three-level nested effect: disposal",
    variants: ["cascades", "partial cascade", "no cascade"],
    run(fw: ReactiveFramework) {
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
      if (middleRuns === 0 || innerRuns === 0) {
        throw new Error("nested effects did not run");
      }

      dispose();
      middleRuns = 0;
      innerRuns = 0;
      a.write(1);

      if (middleRuns === 0 && innerRuns === 0) return "cascades";
      if (middleRuns === 0 || innerRuns === 0) return "partial cascade";
      return "no cascade";
    },
  },

  /**
   *  S(a) ─→ E_outer{ E_b ─→ S(b),  E_c ─→ S(c) }
   *
   * Outer effect creates two inner effects and then re-runs.
   * Hierarchical ownership replaces the old inner effects; a flat
   * effect model keeps them, so each change runs old and new ones.
   */
  {
    id: 210,
    title: "inner effects on outer re-run",
    variants: ["replaced", "accumulates"],
    run(fw: ReactiveFramework) {
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
      if (bRuns === 0 || cRuns === 0) {
        throw new Error("inner effects did not run");
      }

      a.write(1);
      bRuns = 0;
      cRuns = 0;
      b.write(1);
      c.write(1);

      if (bRuns === 1 && cRuns === 1) return "replaced";
      return "accumulates";
    },
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
   * b and c are only reachable through the effect. After it is
   * disposed, a write reaches them only under eager evaluation (see
   * #17).
   */
  {
    id: 187,
    title: "unsubscribed computed after write",
    variants: ["not evaluated", "evaluated"],
    run(fw: ReactiveFramework) {
      const a = fw.signal("a");
      let calls = 0;
      const b = fw.computed(() => {
        calls++;
        return a.read();
      });
      const c = fw.computed(() => {
        calls++;
        return b.read();
      });
      const d = fw.computed(() => a.read());

      let result = "";
      const dispose = fw.effect(() => {
        result = c.read();
      });
      expect(result).toBe("a");
      expect(d.read()).toBe("a");

      calls = 0;
      dispose();
      a.write("aa");
      expect(d.read()).toBe("aa");

      return calls === 0 ? "not evaluated" : "evaluated";
    },
  },

  /**
   *  S(a)  S(b)
   *    |     |
   *    |   C(c)  ← c reads b
   *     \  /
   *     C(d)     ← d reads c only when a === 0
   *
   * One batch makes c stale and unreachable. Lazy evaluation skips
   * it; eager evaluation (see #17) runs it before d drops the edge.
   */
  {
    id: 188,
    title: "batch + dynamic deps: stale unreachable computed",
    variants: ["skipped", "evaluated"],
    run(fw: ReactiveFramework) {
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

      return cCalls === 1 ? "skipped" : "evaluated";
    },
  },

  /**
   *  S(a)  S(b)  S(c)
   *    |           |
   *    |         C(d)  ← d reads c
   *    |          /
   *    C(e)      ← e reads b,d when a>0; only b when a≤0
   *
   * Unbatched writes to a, b, c after a≤0 makes d unreachable.
   * Whether d still runs depends on lazy vs eager evaluation (see
   * #17).
   */
  {
    id: 248,
    title: "multi-signal change: stale unreachable computed",
    variants: ["skipped", "evaluated"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(1);
      const b = fw.signal(1);
      const c = fw.signal(1);

      let dCalls = 0;
      const d = fw.computed(() => {
        dCalls++;
        return c.read();
      });
      const e = fw.computed(() => {
        b.read();
        if (a.read() > 0) d.read();
      });

      e.read();
      dCalls = 0;
      a.write(-1);
      b.write(-1);
      c.write(-1);
      e.read();

      return dCalls === 0 ? "skipped" : "evaluated";
    },
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c)
   *           C(b) ─→ C(d)
   *           C(c) ?─→ C(d)   (when b is truthy)
   *
   * a becomes null, so d skips c although c's dep b changed. A
   * sequential dirty check never reaches c; eager evaluation (see
   * #17) runs it.
   */
  {
    id: 193,
    title: "branch switch: stale unreachable computed",
    variants: ["skipped", "evaluated"],
    run(fw: ReactiveFramework) {
      let cCalls = 0;
      const a = fw.signal<{ v: number } | null>({ v: 1 });
      const b = fw.computed(() => a.read());
      const c = fw.computed(() => {
        cCalls++;
        return b.read()?.v;
      });
      const d = fw.computed(() => (b.read() ? c.read() : 0));

      expect(d.read()).toBe(1);
      expect(cCalls).toBe(1);

      a.write(null);
      expect(d.read()).toBe(0);

      return cCalls === 1 ? "skipped" : "evaluated";
    },
  },

  /**
   *  S(a) → C(c) → E(eff)
   *
   * batch { a.write(5); a.write(0) } — the source ends where it
   * started. Value-snapshot dirty checks see no change and skip c;
   * version-based checks (as in the TC39 polyfill's model) re-run it
   * and the equality cut-off stops propagation. Both are valid; the
   * final value is not a variant (see #125).
   */
  {
    id: 132,
    title: "batch revert: subscribed computed",
    variants: ["skipped", "recomputed"],
    run(fw: ReactiveFramework) {
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
      expect(c.read()).toBe(0);

      return cCalls === 0 ? "skipped" : "recomputed";
    },
  },

  /**
   *  S(a) → C(c)
   *
   * Same as #132 with no subscriber: c is only read directly.
   */
  {
    id: 147,
    title: "batch revert: unsubscribed computed",
    variants: ["skipped", "recomputed"],
    run(fw: ReactiveFramework) {
      if (!fw.batch) throw new SkipTest("no batch");
      const a = fw.signal(0);
      let cCalls = 0;
      const c = fw.computed(() => {
        cCalls++;
        return a.read();
      });
      c.read();
      cCalls = 0;

      fw.batch(() => {
        a.write(5);
        a.write(0);
      });
      expect(c.read()).toBe(0);

      return cCalls === 0 ? "skipped" : "recomputed";
    },
  },

  /**
   *  E_outer{ E_child{ E_grandchild } } → dispose
   *
   * Order of cleanups when the outer effect is disposed. Owner trees
   * may tear down children first (LIFO) or the owner first; flat
   * effect models don't cascade at all.
   */
  {
    id: 241,
    title: "nested cleanup order on dispose",
    variants: ["deepest first", "outermost first", "partial cascade", "no cascade"],
    run(fw: ReactiveFramework) {
      if (!fw.effectCleanup) throw new SkipTest("no effectCleanup");
      const log: string[] = [];

      const dispose = fw.effect(() => {
        fw.effect(() => {
          fw.effect(() => {
            return () => log.push("grandchild");
          });
          return () => log.push("child");
        });
        return () => log.push("outer");
      });
      dispose();

      const order = log.join(",");
      if (order === "grandchild,child,outer") return "deepest first";
      if (order === "outer,child,grandchild") return "outermost first";
      if (order === "outer") return "no cascade";
      if (!log.includes("outer")) {
        throw new Error("outer cleanup did not run (see #238)");
      }
      return "partial cascade";
    },
  },

  /**
   *  S(a) ← E(eff1)
   *       ← E(eff2)
   *       ← E(eff3)
   *
   * Order in which independent sibling effects run on two successive
   * writes. No library contract fixes it.
   */
  {
    id: 216,
    title: "sibling effect order on shared signal",
    variants: ["creation order", "varies"],
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const order: number[] = [];
      for (const i of [1, 2, 3]) {
        fw.effect(() => {
          a.read();
          order.push(i);
        });
      }

      order.length = 0;
      a.write(1);
      const first = order.join(",");
      order.length = 0;
      a.write(2);
      const second = order.join(",");

      if ([first, second].some((o) => o.split(",").sort().join(",") !== "1,2,3")) {
        throw new Error(`each effect must run once per write: ${first}; ${second}`);
      }
      if (first === "1,2,3" && second === "1,2,3") return "creation order";
      return "varies";
    },
  },
];
