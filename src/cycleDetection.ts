import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";

/**
 * Cycle & Infinite Loop Detection
 *
 * Tests that a framework handles circular dependencies and runaway
 * effects without hanging or crashing.
 *
 * Every cycle here is unbounded: nothing in the test code stops it.
 * Accepted outcomes:
 *   - the framework throws (cycle / iteration limit detected), or
 *   - the framework stops the loop on its own. To rule out "stopped"
 *     meaning "never propagated", the effect must have re-run during
 *     the cycle, or re-run on a later external write.
 *
 * Every case carries a test-side guard of GUARD_RUNS effect runs. The
 * guard only protects the suite from hanging: tripping it is a failure,
 * never a detection. A stack overflow is a failure too.
 *
 * A library that retains memory on every iteration can exhaust the heap
 * before the guard trips, so this section declares `mayNotTerminate`:
 * run its cases in a separate process with a fixed heap limit.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 *   ↔ / ⟳   cyclic dependency
 */
export const section = "Cycle & Infinite Loop Detection";
export const mayNotTerminate = true;

// Above the largest built-in limit among the libraries under test:
// solid-js throws "Potential Infinite Loop" after 10^6 queued updates.
const GUARD_RUNS = 1_100_000;

function createGuard() {
  let runs = 0;
  let tripped = false;
  return {
    tick() {
      if (tripped || ++runs > GUARD_RUNS) {
        tripped = true;
        throw new Error("test guard: runaway loop");
      }
    },
    get tripped() {
      return tripped;
    },
  };
}

/**
 * Returns true if the framework threw (detection). A stack overflow is
 * a crash, not a detection.
 */
function settle(fn: () => void): boolean {
  try {
    fn();
    return false;
  } catch (e) {
    if (e instanceof RangeError) {
      throw new Error("stack overflow instead of cycle detection");
    }
    return true;
  }
}

/**
 * After a cycle settled without throwing, the effect must have re-run
 * during the cycle, or re-run on an external write (or have that write
 * rejected by the framework's detection).
 */
function expectStillReactive(
  guard: ReturnType<typeof createGuard>,
  runs: () => number,
  runsBeforeCycle: number,
  write: () => void
) {
  if (runs() > runsBeforeCycle) return;
  const before = runs();
  const threw = settle(write);
  expect(guard.tripped).toBe(false);
  expect(threw || runs() > before).toBe(true);
}

export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) → E(eff) → S(a)  ⟳
   *
   * An effect reads a signal then writes back to it, unconditionally.
   * The framework must either throw or stop the loop by itself.
   */
  "#61 indirect cycle through effects"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const guard = createGuard();
    let runs = 0;

    const threw = settle(() => {
      fw.effect(() => {
        guard.tick();
        runs++;
        a.write(a.read() + 1);
      });
    });

    expect(guard.tripped).toBe(false);
    if (threw) return;
    expectStillReactive(guard, () => runs, 1, () => a.write(-1));
  },

  /**
   *  S(cond)  S(a)
   *     |      |
   *     E(eff)─┘
   *       |
   *       └─→ a.write(a.read()+1)  ⟳  (when cond=true)
   *
   * Effect is safe when cond=false. Setting cond=true creates an
   * unbounded read-write cycle on a. The framework must either throw
   * or stop the loop by itself.
   */
  "#63 cycle from modifying a branch (dynamic cycle creation)"(
    fw: ReactiveFramework
  ) {
    const cond = fw.signal(false);
    const a = fw.signal(0);
    const guard = createGuard();
    let runs = 0;

    fw.effect(() => {
      guard.tick();
      runs++;
      if (cond.read()) {
        a.write(a.read() + 1);
      } else {
        a.read();
      }
    });

    a.write(1);
    expect(runs).toBe(2);

    const threw = settle(() => cond.write(true));

    expect(guard.tripped).toBe(false);
    if (threw) return;
    expectStillReactive(guard, () => runs, 2, () => a.write(-1));
  },

  /**
   *  S(a) → C(c) ⟳  (when a=0, c reads itself)
   *           |
   *         a.write(1) → C(c) reads a normally
   *
   * When a=0, c tries to read itself (cycle) and catches the error.
   * After setting a=1, c must recover and return a's value.
   */
  "#153 computed self-dep recovery after catching cycle error"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);

    const c: { read(): number } = fw.computed(() => {
      if (a.read() === 0) {
        try {
          return (c as any).read();
        } catch {
          return -1;
        }
      }
      return a.read();
    });

    try {
      c.read();
    } catch {}

    a.write(1);
    expect(c.read()).toBe(1);
  },

  /**
   *  S(a) → E(e1) → S(b) → E(e2) → S(a)  ⟳
   *
   * Two effects ping-pong values between two signals
   * (e1 reads a, writes b; e2 reads b, writes a+1) with no end
   * condition. The framework must cap iterations (throw or stop)
   * instead of looping forever.
   */
  "#64 max iteration limit reached"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const guard = createGuard();
    let runs = 0;

    const threw = settle(() => {
      fw.effect(() => {
        guard.tick();
        runs++;
        b.write(a.read());
      });
      fw.effect(() => {
        guard.tick();
        a.write(b.read() + 1);
      });
    });

    expect(guard.tripped).toBe(false);
    if (threw) return;
    expectStillReactive(guard, () => runs, 1, () => a.write(-1));
  },

  /**
   *  S(a) → E(e1) → S(b) → E(e2) → S(c) → E(e3) → S(a)  ⟳
   *
   * Three effects forming a longer ping-pong cycle (e1 reads a writes
   * b; e2 reads b writes c; e3 reads c writes a). #64 tests a 2-effect
   * cycle; this variant verifies the framework's bounding holds for
   * longer cycles too — frameworks that detect direct (length-2) loops
   * may miss longer paths.
   */
  "#221 three-effect cycle stays bounded"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.signal(0);
    const guard = createGuard();
    let runs = 0;

    const threw = settle(() => {
      fw.effect(() => {
        guard.tick();
        runs++;
        b.write(a.read());
      });
      fw.effect(() => {
        guard.tick();
        c.write(b.read());
      });
      fw.effect(() => {
        guard.tick();
        a.write(c.read() + 1);
      });
    });

    expect(guard.tripped).toBe(false);
    if (threw) return;
    expectStillReactive(guard, () => runs, 1, () => a.write(-1));
  },

  /**
   *  S(a) → E(e1) → S(b) → C(c) → E(e2) → S(a)  ⟳
   *
   * Cycle path goes through an intermediate computed: e1 writes b,
   * c is derived from b, e2 reads c and writes a. Differs from #64
   * (direct effect-effect) and #221 (effect-effect chain) — verifies
   * the bound holds when the cycle passes through a computed.
   */
  "#223 cycle through computed stays bounded"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    const c = fw.computed(() => b.read());
    const guard = createGuard();
    let runs = 0;

    const threw = settle(() => {
      fw.effect(() => {
        guard.tick();
        runs++;
        b.write(a.read());
      });
      fw.effect(() => {
        guard.tick();
        a.write(c.read() + 1);
      });
    });

    expect(guard.tripped).toBe(false);
    if (threw) return;
    expectStillReactive(guard, () => runs, 1, () => a.write(-1));
  },
};
