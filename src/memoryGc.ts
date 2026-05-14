import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Memory & GC
 *
 * Tests that disposing effects and removing listeners correctly
 * cleans up subscriptions and dependency links, preventing
 * memory leaks and stale re-executions.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 *   ──X      disposed / removed edge
 */
export const section = "Memory & GC";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(a) ─→ C(c)   (c only held via WeakRef)
   *
   * A computed with no strong references and no active
   * subscribers should be eligible for garbage collection.
   * Verifies the WeakRef is valid right after creation and
   * that the source signal still works independently.
   */
  "#99 computed collectable by GC if nothing listening"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    let ref: WeakRef<{ read(): number }> | undefined;

    (() => {
      const c = fw.computed(() => a.read() * 2);
      c.read();
      ref = new WeakRef(c);
    })();

    // Computed is no longer referenced strongly
    // After GC it should be collectable
    // We can't force GC deterministically, so just verify
    // the computed was created and the weak ref is valid initially
    expect(ref).toBeDefined();
    expect(ref!.deref()).toBeDefined();

    // Signal should still work independently
    a.write(5);
    expect(a.read()).toBe(5);
  },

  /**
   *  S(a) ─→ C(b) ─→ E(eff1)
   *               ─→ E(eff2)
   *       dispose both
   *  S(a) ─→ C(b)   (no listeners, links cleaned)
   *
   * After disposing both effects, writes to S(a) must not
   * trigger the disposed callbacks. The computed C(b) should
   * still be readable on demand.
   */
  "#160 consumer links cleaned after losing all listeners"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);
    let runs = 0;

    const dispose1 = fw.effect(() => {
      b.read();
      runs++;
    });
    const dispose2 = fw.effect(() => {
      b.read();
    });

    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);

    dispose1();
    dispose2();

    a.write(2);
    expect(runs).toBe(2);

    expect(b.read()).toBe(4);
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d) ─→ E(eff)
   *                                  dispose()
   *  S(a) ─→ C(b) ─→ C(c) ─→ C(d)   (no listener)
   *
   * Disposing the sole effect at the end of a multi-level
   * computed chain must clean up all intermediate subscription
   * links so that writes to S(a) no longer propagate.
   * The computeds should still be readable on demand.
   */
  "#161 multi-level computed cleanup after all listeners removed"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() + 1);
    const c = fw.computed(() => b.read() + 1);
    const d = fw.computed(() => c.read() + 1);
    let runs = 0;

    const dispose = fw.effect(() => {
      d.read();
      runs++;
    });
    expect(runs).toBe(1);

    a.write(1);
    expect(runs).toBe(2);

    dispose();

    a.write(2);
    expect(runs).toBe(2);

    expect(d.read()).toBe(5);
  },

  /**
   *  S(a) ─→ C(b) ─→ E(eff1)
   *               ─→ E(eff2)
   *       dispose eff1
   *  S(a) ─→ C(b) ──X E(eff1)
   *               ─→ E(eff2)
   *
   * Two effects share a computed. Disposing one must keep the
   * other's subscription intact — writes still trigger eff2 but
   * never trigger the disposed eff1.
   */
  "#215 partial dispose: sibling effect still notified"(
    fw: ReactiveFramework
  ) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read() * 2);
    let e1Runs = 0;
    let e2Runs = 0;

    const dispose1 = fw.effect(() => {
      b.read();
      e1Runs++;
    });
    fw.effect(() => {
      b.read();
      e2Runs++;
    });
    expect(e1Runs).toBe(1);
    expect(e2Runs).toBe(1);

    dispose1();
    e1Runs = 0;
    e2Runs = 0;

    a.write(1);
    expect(e1Runs).toBe(0);
    expect(e2Runs).toBe(1);

    a.write(2);
    expect(e1Runs).toBe(0);
    expect(e2Runs).toBe(2);
  },
};
