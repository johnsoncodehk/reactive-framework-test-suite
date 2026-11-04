import { expect } from "./assert.ts";
import type { ReactiveFramework } from "./framework.ts";
import type { TestCase } from "./suite.ts";
import { SkipTest } from "./framework.ts";

/**
 * Inner Write
 *
 * Tests signal writes that originate from inside effects or
 * computed callbacks ("inner writes" / "side-effect writes").
 * Covers write-back from effects, computed side-channel writes,
 * convergence behavior, and interactions with batching and
 * dynamic dependency switching.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 *   ═→       inner write (node writes to a signal during evaluation)
 */
export const name = "Inner Write";
export const cases: TestCase[] = [
  /**
   *  S(a) ← E(eff) ═→ S(b)
   *
   * Effect reads a and writes a*2 into b. b must reflect the
   * derived value after each change to a.
   */
  {
    id: 50,
    title: "effect writes back to signal",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);

      fw.effect(() => {
        b.write(a.read() * 2);
      });

      expect(b.read()).toBe(0);
      a.write(5);
      expect(b.read()).toBe(10);
    },
  },

  /**
   *  S(a) ← E(eff → cleanup ═→ S(a))
   *
   * Cleanup writes to the effect's own dependency. This must not
   * cause an infinite retrigger loop.
   */
  {
    id: 51,
    title: "effect cleanup modifying dependency does not retrigger",
    run(fw: ReactiveFramework) {
      if (!fw.effectCleanup) throw new SkipTest("no effectCleanup");
      const a = fw.signal(0);
      let runs = 0;

      fw.effect(() => {
        runs++;
        a.read();
        return () => {
          a.write(999);
        };
      });
      expect(runs).toBe(1);

      a.write(1);
      // cleanup runs (sets a=999), then effect re-runs with a=999 or 1
      // The key: cleanup should not cause infinite retrigger
      expect(runs).toBeGreaterThanOrEqual(2);
      expect(runs).toBeLessThanOrEqual(3);
    },
  },

  /**
   *  S(a) → C(c) ═→ S(sideChannel)
   *
   * Computed writes to a side-channel signal. Framework may
   * either allow it or throw (both are valid behaviors).
   */
  {
    id: 52,
    title: "computed writing to signal",
    run(fw: ReactiveFramework) {
      const a = fw.signal(3);
      const sideChannel = fw.signal(0);

      let c: { read(): number };
      let value: number;
      try {
        c = fw.computed(() => {
          const v = a.read();
          sideChannel.write(v * 10);
          return v;
        });
        value = c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      expect(value).toBe(3);
      expect(sideChannel.read()).toBe(30);

      a.write(4);
      expect(c.read()).toBe(4);
      expect(sideChannel.read()).toBe(40);
    },
  },

  /**
   *  S(a) ← E(eff)
   *
   * Multiple synchronous writes to a signal. The effect must
   * ultimately observe the final written value.
   */
  {
    id: 53,
    title: "inner write: only final value observed",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const values: number[] = [];

      fw.effect(() => {
        values.push(a.read());
      });
      expect(values).toEqual([0]);

      a.write(1);
      a.write(2);
      a.write(3);
      expect(values[values.length - 1]).toBe(3);
    },
  },

  /**
   *  S(a)  S(b) ← E(eff) ═→ S(b) when a>0 && b===0
   *
   * Effect conditionally writes to b. The inner write must
   * propagate so that b settles to a's value.
   */
  {
    id: 54,
    title: "inner mutations propagate until changes settle",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);

      fw.effect(() => {
        if (a.read() > 0 && b.read() === 0) {
          b.write(a.read());
        }
      });

      a.write(5);
      expect(b.read()).toBe(5);
    },
  },

  /**
   *  S(a) → C(b) ← E(eff)
   *
   * Effect reads from a computed derived from a. Writing to a
   * must re-schedule the effect through the computed chain.
   */
  {
    id: 56,
    title: "effect re-scheduled after reading from derived then writing",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.computed(() => a.read());
      const values: number[] = [];

      fw.effect(() => {
        values.push(b.read());
      });
      expect(values).toEqual([0]);

      a.write(1);
      expect(values[values.length - 1]).toBe(1);
    },
  },

  /**
   *  S(src) → C(writer) ═→ S(sideChannel) → C(reader)
   *
   * Computed writer writes to a side-channel signal. A sibling
   * computed reader of that signal must see the written value.
   * Framework may also forbid computed side effects (also valid).
   */
  {
    id: 112,
    title: "computed side-effect doesn't affect sibling computeds",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const sideChannel = fw.signal(0);

      let writer: { read: () => number };
      try {
        writer = fw.computed(() => {
          const v = src.read();
          sideChannel.write(v * 10);
          return v;
        });
        writer.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const reader = fw.computed(() => sideChannel.read());
      expect(reader.read()).toBe(0);

      src.write(1);
      writer.read();
      expect(reader.read()).toBe(10);
    },
  },

  /**
   *  S(a) ← E(eff) ═→ S(a) resets to 0 when a===1
   *  S(a) → C(c) ← E(downstream)
   *
   * Effect writes a back to its original value. The net change
   * is zero, so downstream must not be notified (or at most once).
   */
  {
    id: 114,
    title: "inner write final value unchanged: no downstream notification",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      let effectRuns = 0;
      let downstreamRuns = 0;

      fw.effect(() => {
        effectRuns++;
        if (effectRuns > 20) throw new Error("bail");
        const v = a.read();
        if (v === 1) {
          a.write(0);
        }
      });

      const c = fw.computed(() => a.read());
      fw.effect(() => {
        c.read();
        downstreamRuns++;
      });

      const downstreamBefore = downstreamRuns;
      a.write(1);

      expect(effectRuns).toBeLessThanOrEqual(20);
      expect(a.read()).toBe(0);
      expect(downstreamRuns).toBeLessThanOrEqual(downstreamBefore + 1);

      const settled = downstreamRuns;
      a.write(5);
      expect(downstreamRuns).toBeGreaterThan(settled);
    },
  },

  /**
   *  S(a) ← E(eff1) ═→ S(a) resets to 0 when a===1
   *  S(a) ← E(eff2)
   *
   * First effect writes a back to 0. Second effect must see the
   * final settled value (0), not the intermediate value (1).
   */
  {
    id: 133,
    title: "listener writes back: second listener settles on final value",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const values1: number[] = [];
      const values2: number[] = [];

      fw.effect(() => {
        const v = a.read();
        values1.push(v);
        if (v === 1) {
          a.write(0);
        }
      });

      fw.effect(() => {
        values2.push(a.read());
      });

      a.write(1);

      expect(a.read()).toBe(0);
      expect(values2[values2.length - 1]).toBe(0);
    },
  },

  /**
   *  S(a) ← E(eff1) ═→ S(a) writes 10 when a===1
   *  S(a) ← E(eff2)
   *
   * First effect changes a from 1 to 10. Second effect must
   * observe the final value (10).
   */
  {
    id: 134,
    title: "listener writes back: second listener gets final value",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const finalValues: number[] = [];

      fw.effect(() => {
        const v = a.read();
        if (v === 1) {
          a.write(10);
        }
      });

      fw.effect(() => {
        finalValues.push(a.read());
      });

      a.write(1);
      expect(a.read()).toBe(10);
      expect(finalValues[finalValues.length - 1]).toBe(10);
    },
  },

  /**
   *  S(src) → C(c1) ═→ S(target) → C(c2)
   *
   * Computed c1 writes to target. Downstream computed c2 reads
   * target and must see the settled value after c1 evaluates.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 135,
    title: "chained computed inner write: downstream only sees settled",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const target = fw.signal(0);

      let c1: { read: () => number };
      try {
        c1 = fw.computed(() => {
          const v = src.read();
          target.write(v * 10);
          return v;
        });
        c1.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const c2 = fw.computed(() => target.read());
      expect(c2.read()).toBe(0);

      src.write(1);
      c1.read();
      expect(target.read()).toBe(10);
      expect(c2.read()).toBe(10);
    },
  },

  /**
   *  S(src) → C(c) ═→ S(side) [always writes 0]
   *  S(side) ← E(eff)
   *
   * Computed always writes the same value to side. The downstream
   * effect must not be notified because the value never changes.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 136,
    title: "computed inner write unchanged: no downstream notification",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const side = fw.signal(0);

      let c: { read: () => number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          side.write(0);
          return v;
        });
        c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      let downstreamRuns = 0;
      fw.effect(() => {
        side.read();
        downstreamRuns++;
      });
      downstreamRuns = 0;

      src.write(1);
      c.read();
      expect(downstreamRuns).toBeLessThanOrEqual(1);

      const settled = downstreamRuns;
      side.write(5);
      expect(downstreamRuns).toBeGreaterThan(settled);
    },
  },

  /**
   *  S(src) → C(c) ═→ S(side) [writes src*100]
   *
   * Computed writes a changing value to side. After src changes,
   * side must reflect the new derived value.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 137,
    title: "computed inner write changed: downstream notified",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const side = fw.signal(0);

      let c: { read: () => number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          side.write(v * 100);
          return v;
        });
        c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      src.write(1);
      c.read();
      expect(side.read()).toBe(100);
    },
  },

  /**
   *  S(src) → C(writer) ═→ S(shared) → C(reader)
   *
   * Two computeds share a source. Writer inner-writes to shared;
   * reader derives from shared. Reader must see the updated value.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 138,
    title: "independent computeds sharing source, one inner-writes",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const shared = fw.signal(0);

      let writer: { read: () => number };
      try {
        writer = fw.computed(() => {
          const v = src.read();
          shared.write(v * 10);
          return v;
        });
        writer.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const reader = fw.computed(() => shared.read() + 1);
      expect(shared.read()).toBe(0);
      expect(reader.read()).toBe(1);

      src.write(2);
      writer.read();
      expect(shared.read()).toBe(20);
      expect(reader.read()).toBe(21);
    },
  },

  /**
   *  S(s) → C(c) ← E(eff) ═→ S(s) writes false when c is true
   *
   * Effect resets s through a computed chain. Tests whether the
   * computed cache is updated after the inner write (determines
   * if future propagation is correct).
   */
  {
    id: 180,
    title: "inner write through computed chain resets signal",
    run(fw: ReactiveFramework) {
      const s = fw.signal(false);
      const c = fw.computed(() => s.read());
      let runs = 0;

      fw.effect(() => {
        runs++;
        if (c.read()) s.write(false);
      });

      // Initial run: effect sees c=false, no write
      expect(runs).toBe(1);

      s.write(true);
      expect(s.read()).toBe(false);
      // Effect ran at least once: saw c=true, wrote s(false)
      expect(runs).toBeGreaterThanOrEqual(2);

      // Detect: does the effect re-run after inner write?
      // re-run (runs>=3): 1 initial + 1 c=true + 1 re-run c=false → c cache = false
      // no re-run (runs===2): 1 initial + 1 c=true → c cache stays true
      const effectReRuns = runs >= 3;
      const runsAfterFirst = runs;

      s.write(true);
      if (effectReRuns) {
        // c cache was false → c sees false→true (change) → effect fires
        // min 2 runs: 1 c=true→write(false), 1 re-run c=false→stop
        expect(s.read()).toBe(false);
        expect(runs).toBeGreaterThanOrEqual(runsAfterFirst + 2);
      } else {
        // c cache was true → c sees true→true (unchanged) → effect not triggered
        expect(s.read()).toBe(true);
        expect(runs).toBe(runsAfterFirst);
      }
    },
  },

  /**
   *  S(s) → C(c) ═→ S(s) [writes s+1, returns s]
   *
   * Computed increments its own source while evaluating. The value
   * it reads back and the signal must reflect the post-write state.
   * (Whether the next read re-evaluates is #172's design difference.)
   * Framework may also forbid the write and throw.
   */
  {
    id: 179,
    title: "computed self-increment: intra-run read-after-write values correct",
    run(fw: ReactiveFramework) {
      const s = fw.signal(1);
      let value: number;
      try {
        const c = fw.computed(() => {
          s.write(s.read() + 1);
          return s.read();
        });
        value = c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      expect(value).toBe(2);
      expect(s.read()).toBe(2);
    },
  },

  /**
   *  S(counter) ← E(eff) ═→ S(counter) [increments until target]
   *
   * Effect increments a counter toward a target. Must either
   * converge (counter reaches target) or detect the cycle (throw, or
   * stop re-running the effect on its own write while still reacting
   * to external writes). Not reacting at all is invalid.
   */
  {
    id: 113,
    title: "inner write convergence: converges or cycle-detects",
    run(fw: ReactiveFramework) {
      const counter = fw.signal(0);
      const target = 5;
      let iterations = 0;
      let bailed = false;
      let threw = false;
      try {
        fw.effect(() => {
          iterations++;
          if (iterations > 100) {
            bailed = true;
            throw new Error("bail");
          }
          const v = counter.read();
          if (v < target) counter.write(v + 1);
        });
      } catch {
        threw = true;
      }

      // The test's own bail is a safety net, not evidence of detection.
      expect(bailed).toBe(false);

      // Detection: the framework threw.
      if (threw) return;

      if (counter.read() === target) {
        expect(iterations).toBeLessThanOrEqual(target + 1);
        return;
      }

      // Detection: the framework stopped the self-write loop on its own.
      // That is only distinguishable from "never reacts" if the effect
      // still re-runs on an external write.
      const before = iterations;
      counter.write(target);
      expect(iterations).toBeGreaterThan(before);
    },
  },

  /**
   *  S(src) → C(c) ═→ S(sideEffect)
   *  S(sideEffect) ← E(eff)
   *
   * Computed writes to a side-effect signal. An effect watching
   * that signal must observe the written value after c evaluates.
   * Framework may also forbid the write and throw.
   */
  {
    id: 57,
    title: "computed side effect triggers downstream",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const sideEffect = fw.signal(0);

      let c: { read(): number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          sideEffect.write(v * 10);
          return v;
        });
        c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const values: number[] = [];
      fw.effect(() => {
        values.push(sideEffect.read());
      });

      expect(sideEffect.read()).toBe(0);

      src.write(1);
      c.read();
      expect(sideEffect.read()).toBe(10);
      expect(values[values.length - 1]).toBe(10);
    },
  },

  /**
   *  S(src) → C(writer) ═→ S(b), S(c)
   *  {S(b), S(c)} → C(pair)
   *
   * Computed writes to two signals atomically. Downstream must
   * see a consistent pair of values.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 181,
    title: "computed writes multiple signals: downstream sees consistent pair",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const b = fw.signal(0);
      const c = fw.signal(0);

      let writer: { read: () => number };
      try {
        writer = fw.computed(() => {
          const v = src.read();
          b.write(v + 1);
          c.write(v + 2);
          return v;
        });
        writer.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const pair = fw.computed(() => b.read() + "," + c.read());
      expect(pair.read()).toBe("1,2");

      src.write(10);
      writer.read();
      expect(pair.read()).toBe("11,12");
    },
  },

  /**
   *  batch { S(src).write → C(c) ═→ S(side) }
   *  S(side) ← E(eff)
   *
   * Computed inner write happens inside a batch. After the batch
   * flushes, the side-effect signal and its effect must reflect
   * the written value.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 182,
    title: "computed side effect + batch: writes visible after flush",
    run(fw: ReactiveFramework) {
      if (!fw.batch) throw new SkipTest("no batch");
      const src = fw.signal(0);
      const side = fw.signal(0);

      let c: { read: () => number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          side.write(v * 10);
          return v;
        });
        c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      let effectRuns = 0;
      fw.effect(() => {
        side.read();
        effectRuns++;
      });
      effectRuns = 0;

      fw.batch(() => {
        src.write(5);
        expect(c.read()).toBe(5);
        expect(side.read()).toBe(50);
      });
      expect(effectRuns).toBeGreaterThanOrEqual(1);
      expect(side.read()).toBe(50);
    },
  },

  /**
   *  S(src) → C(inner) ═→ S(innerSide)
   *           C(inner) → C(outer) ═→ S(outerSide)
   *
   * Nested computeds both perform side-effect writes. Each side
   * signal must reflect the correct derived value.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 184,
    title: "nested computeds: outer reads inner, both have side effects",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const innerSide = fw.signal(0);
      const outerSide = fw.signal(0);

      let outer: { read: () => number };
      try {
        const inner = fw.computed(() => {
          const v = src.read();
          innerSide.write(v * 10);
          return v + 1;
        });

        outer = fw.computed(() => {
          const iv = inner.read();
          outerSide.write(iv * 100);
          return iv;
        });
        outer.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      expect(innerSide.read()).toBe(0); // src=0 → 0*10
      expect(outerSide.read()).toBe(100); // inner=1 → 1*100

      src.write(2);
      outer.read();
      expect(innerSide.read()).toBe(20); // 2*10
      expect(outerSide.read()).toBe(300); // inner=3 → 3*100
    },
  },

  /**
   *  S(src) → C(c) ═→ S(side), then throws when src>0
   *
   * Computed writes to side then throws. The write that happened
   * before the throw must still be visible in the side signal.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 185,
    title: "computed side effect write visible despite later throw",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const side = fw.signal(-1);

      let c: { read: () => number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          side.write(v * 10);
          if (v > 0) throw new Error("intended");
          return v;
        });
        c.read(); // src=0, side=0, no throw
      } catch {
        return; // computed side effects forbidden — valid
      }

      expect(side.read()).toBe(0);

      src.write(1);
      let threw = false;
      try {
        c.read(); // side=10, then throws
      } catch {
        threw = true;
      }

      // write happened before the throw
      if (threw) {
        expect(side.read()).toBe(10);
      }
    },
  },

  /**
   *  S(src) → C(c) ═→ S(side)
   *  {C(c), S(side)} ← E(eff)
   *
   * Effect reads both c and side. After src changes, the effect
   * must observe c's new value and side's inner-written value
   * consistently.
   * Framework may forbid computed side effects (also valid).
   */
  {
    id: 186,
    title: "effect observes computed side-channel write during propagation",
    run(fw: ReactiveFramework) {
      const src = fw.signal(0);
      const side = fw.signal(0);

      let c: { read: () => number };
      try {
        c = fw.computed(() => {
          const v = src.read();
          side.write(v);
          return v;
        });
        c.read();
      } catch {
        return; // computed side effects forbidden — valid
      }

      const observed: number[] = [];
      fw.effect(() => {
        observed.push(c.read() + side.read());
      });

      expect(observed[observed.length - 1]).toBe(0); // c=0 + side=0

      src.write(5);
      expect(observed[observed.length - 1]).toBe(10); // c=5 + side=5
    },
  },

  /**
   *  S(s) → C(c) ← E(eff) ═→ S(s) writes 0 when c>0
   *
   * Effect resets s to 0 on initial run. Subsequent writes to s
   * must still propagate and be reset by the effect each time.
   */
  {
    id: 213,
    title: "inner write during initial effect execution doesn't block future propagation",
    run(fw: ReactiveFramework) {
      const s = fw.signal(1);
      const c = fw.computed(() => s.read());

      fw.effect(() => {
        if (c.read() > 0) {
          s.write(0);
        }
      });

      expect(s.read()).toBe(0);

      s.write(2);
      expect(s.read()).toBe(0);

      s.write(3);
      expect(s.read()).toBe(0);
    },
  },

  /**
   *  S(s) → C(c) ← E(eff) ═→ S(s) writes 0 when c>0
   *
   * Same pattern as #213 but the initial s starts at 0. The first
   * external write triggers the reset. Future writes must still
   * propagate through the computed and be caught by the effect.
   */
  {
    id: 212,
    title: "inner write through computed doesn't block future propagation",
    run(fw: ReactiveFramework) {
      const s = fw.signal(0);
      const c = fw.computed(() => s.read());

      fw.effect(() => {
        if (c.read() > 0) {
          s.write(0);
        }
      });

      s.write(1);
      expect(s.read()).toBe(0);

      s.write(2);
      expect(s.read()).toBe(0);

      s.write(3);
      expect(s.read()).toBe(0);
    },
  },

  /**
   *  S(a) ─→ E(e1) ═→ S(b) when a===1
   *  S(a) ─→ C(c) = a + b
   *  C(c) ─→ E(e2)
   *
   * a.write(1) schedules both e1 and e2. e1's inner write to b
   * makes c stale mid-flush. e2 reads c — must observe the fresh
   * value (1 + 10 = 11) by the time the flush settles, not the
   * stale value (1 + 0 = 1). The assertion only checks the LAST
   * observation, tolerating frameworks that fire e2 multiple times
   * during the flush.
   */
  {
    id: 224,
    title: "effect sees fresh computed after sibling's mid-flush inner write",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b = fw.signal(0);
      const c = fw.computed(() => a.read() + b.read());

      const observed: number[] = [];

      fw.effect(() => {
        if (a.read() === 1) {
          b.write(10);
        }
      });
      fw.effect(() => {
        observed.push(c.read());
      });

      expect(observed).toEqual([0]);

      a.write(1);
      expect(observed[observed.length - 1]).toBe(11);
    },
  },

  /**
   *  S(a) ─→ E(e1) ═→ S(b1) when a===1
   *  S(a) ─→ E(e2) ═→ S(b2) when a===1
   *  S(b1), S(b2) ─→ C(c) = b1 + b2
   *  C(c) ─→ E(e3)
   *
   * Two effects each inner-write a different signal during the
   * same flush. Both feed into a single computed read by a third
   * effect. The LAST value e3 observes must be 30 (b1=10 + b2=20),
   * not a partial state where only one inner write is reflected.
   * Like #224, only checks the final settled observation.
   */
  {
    id: 225,
    title: "mid-flush fan-in: e3 sees both sibling effects' inner writes",
    run(fw: ReactiveFramework) {
      const a = fw.signal(0);
      const b1 = fw.signal(0);
      const b2 = fw.signal(0);
      const c = fw.computed(() => b1.read() + b2.read());

      const observed: number[] = [];

      fw.effect(() => {
        if (a.read() === 1) {
          b1.write(10);
        }
      });
      fw.effect(() => {
        if (a.read() === 1) {
          b2.write(20);
        }
      });
      fw.effect(() => {
        observed.push(c.read());
      });

      expect(observed).toEqual([0]);

      a.write(1);
      expect(observed[observed.length - 1]).toBe(30);
    },
  },
];
