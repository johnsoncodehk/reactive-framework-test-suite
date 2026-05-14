import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Cycle & Infinite Loop Detection
 *
 * Tests that a framework handles circular dependencies and runaway
 * effects without hanging or crashing: cycles are detected (throw or
 * graceful fallback), and iteration counts stay bounded.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge (downstream reads upstream)
 *   ↔ / ⟳   cyclic dependency
 */
export const section = "Cycle & Infinite Loop Detection";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) → E(eff) → S(a)  ⟳
   *
   * An effect reads a signal then writes back to it, creating an
   * indirect write-read loop. Iteration count must stay bounded.
   */
  "#61 indirect cycle through effects"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    let iterations = 0;

    try {
      fw.effect(() => {
        const v = a.read();
        if (iterations++ < 100) {
          a.write(v + 1);
        }
      });
    } catch {
      // Cycle detected — expected for some frameworks
    }

    // Should either stop or throw
    expect(iterations).toBeLessThanOrEqual(200);
  },

  /**
   *  S(cond)  S(a)
   *     |      |
   *     E(eff)─┘
   *       |
   *       └─→ a.write(a.read()+1)  ⟳  (when cond=true)
   *
   * Effect is safe when cond=false. Setting cond=true creates a
   * dynamic read-write cycle on a. Framework must detect it.
   */
  "#63 cycle from modifying a branch (dynamic cycle creation)"(
    fw: ReactiveFramework
  ) {
    const cond = fw.signal(false);
    const a = fw.signal(0);
    let iterations = 0;

    try {
      fw.effect(() => {
        if (iterations++ > 100) throw new Error("bail");
        if (cond.read()) {
          a.write(a.read() + 1);
        } else {
          a.read();
        }
      });

      cond.write(true);
    } catch {
      // Expected: creating a cycle dynamically should be detected
    }

    expect(iterations).toBeLessThanOrEqual(200);
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
   * (e1 reads a, writes b; e2 reads b, writes a+1).
   * Framework must cap iterations instead of looping forever.
   */
  "#64 max iteration limit reached"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.signal(0);
    let iterations = 0;

    try {
      fw.effect(() => {
        iterations++;
        const v = a.read();
        if (v < 100) {
          b.write(v);
        }
      });
      fw.effect(() => {
        const v = b.read();
        if (v < 100) {
          a.write(v + 1);
        }
      });
    } catch {
      // Expected: iteration limit reached
    }

    // Should be bounded
    expect(iterations).toBeLessThanOrEqual(300);
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
    let iterations = 0;

    try {
      fw.effect(() => {
        iterations++;
        const v = a.read();
        if (v < 100) {
          b.write(v);
        }
      });
      fw.effect(() => {
        const v = b.read();
        if (v < 100) {
          c.write(v);
        }
      });
      fw.effect(() => {
        const v = c.read();
        if (v < 100) {
          a.write(v + 1);
        }
      });
    } catch {
      // Expected: iteration limit reached
    }

    expect(iterations).toBeLessThanOrEqual(300);
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
    let iterations = 0;

    try {
      fw.effect(() => {
        iterations++;
        const v = a.read();
        if (v < 100) {
          b.write(v);
        }
      });
      fw.effect(() => {
        const v = c.read();
        if (v < 100) {
          a.write(v + 1);
        }
      });
    } catch {
      // Expected: iteration limit reached
    }

    expect(iterations).toBeLessThanOrEqual(300);
  },
};
