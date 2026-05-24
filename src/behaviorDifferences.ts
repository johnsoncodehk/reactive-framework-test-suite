import type { ReactiveFramework } from "./framework.js";
import { SkipTest, hasEffectCleanup } from "./framework.js";

/**
 * Behavioral Differences
 *
 * Tests that probe framework-specific semantics where reactive
 * libraries legitimately diverge. Each test returns a descriptive
 * string (e.g. "lazy" / "eager") rather than asserting a single
 * correct answer — useful for characterizing a framework's design
 * choices.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 */
export const section = "Behavioral Differences";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ─→ C(b)
   *
   * Determines whether creating a computed eagerly evaluates
   * its body or defers until the first `.read()` call.
   * Returns "lazy" or "eager".
   */
  "#17 computed evaluation timing"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(b)
   *  S(a) ─→ C(c)   (c is never read)
   *
   * Determines whether a computed that is created but never
   * read still subscribes to its source and re-evaluates
   * when the source changes.
   * Returns "no subscription" or "subscribes eagerly".
   */
  "#15 unread computed subscription"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(c)
   *  S(b) ─→ C(c)
   *
   * Two sources are written before C(c) is read. Checks
   * whether the framework coalesces into a single
   * re-evaluation or evaluates once per dirty source.
   * Returns "single recompute" or "N recomputes".
   */
  "#146 recompute count on multiple dep changes"(fw: ReactiveFramework) {
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
    return cCalls <= 1 ? "single recompute" : `${cCalls} recomputes`;
  },

  /**
   *  S(a) ─→ C(c)
   *  a.write(NaN) when a already holds NaN
   *
   * Checks whether the framework uses Object.is (NaN === NaN)
   * or strict === (NaN !== NaN) to decide if a signal value
   * has changed.
   * Returns "Object.is" or "===".
   */
  "#29 NaN equality semantics"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(c) ─→ C(d)
   *
   * C(c) returns NaN on consecutive evaluations.
   * Similar to #29, but tests equality semantics at the
   * computed-to-computed boundary. If C(c) returns NaN twice,
   * does C(d) skip re-evaluation (Object.is) or re-evaluate
   * (===)?
   * Returns "Object.is" or "===".
   */
  "#167 computed NaN downstream propagation"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(c)
   *
   * Writes the same object reference back to a signal
   * (`a.write(obj)` where `obj` is already held).
   * Checks whether the framework treats it as a no-op
   * (skipped) or as a change that triggers downstream
   * re-evaluation.
   * Returns "skips" or "propagates".
   */
  "#30 same-reference signal write"(fw: ReactiveFramework) {
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

  /**
   * Calls `fw.batch(() => 42)` and checks whether `batch`
   * forwards the return value of its callback to the caller.
   * Returns "returns value" or "returns void".
   */
  "#176 batch return value"(fw: ReactiveFramework) {
    if (!fw.batch) throw new SkipTest("no batch");
    const result = (fw.batch as Function)(() => 42);
    return result === 42 ? "returns value" : "returns void";
  },

  /**
   *  S(a) ─→ E(eff1)          eff1: if a, b.write(1)
   *  S(a) ─→ E(eff2)          eff2: if a, read b
   *  S(b)  ─→ E(eff2)
   *
   * Two effects share S(a). When S(a) is set to true, eff1
   * writes to S(b). Does eff2 see the pre-write value of
   * S(b) (isolation) or the post-write value?
   * Returns "pre-write", "post-write", or "throws".
   */
  "#173 mid-propagation read isolation"(fw: ReactiveFramework) {
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
      return "unknown";
    } catch {
      return "throws";
    }
  },

  /**
   *  S(a) ─→ E(eff)
   *  S(b)
   *  eff: b.write(1); then b.read()
   *
   * Inside a single effect run, a signal is written and then
   * immediately read back. Does the read return the old value
   * (pre-write) or the just-written value (post-write)?
   * Returns "pre-write", "post-write", or "throws".
   */
  "#174 intra-run read-after-write"(fw: ReactiveFramework) {
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
      return "unknown";
    } catch {
      return "throws";
    }
  },

  /**
   *  S(a) ─→ E(eff)   (eff throws on first run)
   *
   * An effect reads S(a) then throws during its initial
   * execution. Checks whether the framework unsubscribes
   * the effect or keeps it subscribed for future writes.
   * Returns "unsubscribes" or "keeps subscribed".
   */
  "#88 effect subscription after first-run throw"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ E(eff1)
   *  S(a) ─→ E(eff2)   (eff2 throws when a===1)
   *  S(a) ─→ E(eff3)
   *
   * Three effects subscribe to S(a). The middle one throws
   * on update. Checks whether the framework continues
   * flushing the remaining effects or halts the entire flush.
   * Returns "continues" or "halts flush".
   */
  "#106 effect throw isolation in flush"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(b)   (b throws when a===0)
   *
   * A computed throws on first evaluation. On the second read
   * (with deps unchanged), does the framework cache the error,
   * re-evaluate the body, or return a stale value?
   * Returns "caches error", "re-evaluates", or "returns stale".
   */
  "#86 computed error caching"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ C(b)   (b throws a string when a===0)
   *
   * Same as #86 but the thrown value is a plain string instead
   * of an Error instance. Tests whether non-Error throw values
   * are handled identically.
   * Returns "caches error", "re-evaluates", or "returns stale".
   */
  "#107 non-Error throw caching"(fw: ReactiveFramework) {
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

  /**
   *  S(s) ─→ C(c) ─→ E(eff)
   *  eff: if c > 0, s.write(0)   (self-correcting write)
   *
   * An effect reads a computed chain and writes back to the
   * root signal when the value is non-zero, creating a
   * feedback loop. Checks how the framework handles the
   * re-entry: number of re-runs per write and whether
   * subsequent writes are blocked.
   */
  "#49 inner write re-run through computed chain"(fw: ReactiveFramework) {
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

    if (run1 === 0) return "no re-run";
    if (val1 !== 0) return "broken";
    if (val2 !== 0 || run2 === 0) return `runs ${run1}x, then blocks`;
    return `runs ${run1}x per write`;
  },

  /**
   *  S(a) ─→ E(eff)
   *  eff: a.write(a.read() + 1)   (unconditional self-increment)
   *
   * An effect unconditionally reads and increments its source
   * signal, creating an infinite loop. Checks whether the
   * framework detects the cycle (throws), runs without
   * throwing, or requires a manual bail-out.
   * Returns "cycle detected", "no throw", or "manual bail (200+)".
   */
  "#62 infinite loop in effect"(fw: ReactiveFramework) {
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

  /**
   *  S(a) ─→ E(eff1)
   *  eff1: b.write(a+1); c.write(a+2)
   *  S(b) ─→ C(d)
   *  S(c) ─→ C(d) ─→ E(eff2)
   *
   * An effect writes to two signals that both feed into a
   * downstream computed. Checks whether the framework batches
   * the two writes so that E(eff2) runs only once.
   * Returns "batched" or "unbatched (N runs)".
   */
  "#175 effect multi-signal write batching"(fw: ReactiveFramework) {
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
    return runs <= 1 ? "batched" : `unbatched (${runs} runs)`;
  },

  /**
   *  run{ E(child ─→ S(source)); throw }
   *
   * A scope/root body creates a child effect then throws before
   * returning. Checks whether the framework disposes child
   * effects created before the throw or leaves them alive.
   * Returns "disposes children" or "children survive".
   */
  "#246 throwing run body child effect cleanup"(fw: ReactiveFramework) {
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

  /**
   *  E_outer{ E_inner1, E_inner2, E_inner3 } → dispose
   *
   * Probes the cleanup order of sibling effects when their owner
   * disposes. Frameworks with parent-child cascade tend to use
   * either LIFO (reverse creation) or FIFO (creation order). A
   * flat-effect framework (no cascade) reports "no cascade".
   */
  "#244 sibling cleanup order on dispose"(fw: ReactiveFramework) {
    if (!hasEffectCleanup(fw)) throw new SkipTest("no effectCleanup");
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
    if (order.length < 3) return `partial cascade (${order.join(",")})`;
    const asStr = order.join(",");
    if (asStr === "3,2,1") return "LIFO";
    if (asStr === "1,2,3") return "FIFO";
    return `other (${asStr})`;
  },
};
