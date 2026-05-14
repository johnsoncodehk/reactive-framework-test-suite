import { expect } from "./assert.js";
import type { ReactiveFramework } from "./framework.js";
import { SkipTest } from "./framework.js";

/**
 * Dynamic Dependencies
 *
 * Tests that dependency tracking adapts at runtime when conditional
 * branches change which signals/computeds are read.  A reactive
 * framework must add newly-reached deps, remove no-longer-reached
 * deps, and avoid redundant evaluations of nodes that become
 * unreachable after a branch switch.
 *
 * Legend:
 *   S        signal (source)
 *   C        computed
 *   E / eff  effect
 *   ─→       dependency edge
 *   ?─→      conditional (dynamic) dependency edge
 */
export const section = "Dynamic Dependencies";
export const cases: Record<string, (fw: ReactiveFramework) => any> = {
  /**
   *  S(cond) ─→ C(c)
   *  S(a)   ?─→ C(c)   (when cond = true)
   *  S(b)   ?─→ C(c)   (when cond = false)
   *
   * Only the active branch dep triggers recomputation.
   * Writing to the inactive dep must not cause c to re-evaluate.
   */
  "#12 active dep triggers, inactive dep does not"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const b = fw.signal("b");
    const cond = fw.signal(true);

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return cond.read() ? a.read() : b.read();
    });

    expect(c.read()).toBe("a");
    expect(cCalls).toBe(1);

    // b is inactive, changing it should not trigger c
    b.write("bb");
    expect(c.read()).toBe("a");
    expect(cCalls).toBe(1);

    // a is active, changing it should trigger c
    a.write("aa");
    expect(c.read()).toBe("aa");
    expect(cCalls).toBe(2);
  },

  /**
   *  S(cond) ─→ C(c)
   *  S(a)   ?─→ C(c)   (when cond = true)
   *  S(b)   ?─→ C(c)   (when cond = false)
   *
   * After switching cond from true to false, the old dep (a)
   * must be deactivated: writing to a must not trigger c.
   * The new dep (b) must be active.
   */
  "#13 switching branches deactivates old deps"(fw: ReactiveFramework) {
    const a = fw.signal("a");
    const b = fw.signal("b");
    const cond = fw.signal(true);

    let cCalls = 0;
    const c = fw.computed(() => {
      cCalls++;
      return cond.read() ? a.read() : b.read();
    });

    expect(c.read()).toBe("a");
    cCalls = 0;

    // Switch to b branch
    cond.write(false);
    expect(c.read()).toBe("b");
    cCalls = 0;

    // a is now inactive
    a.write("aa");
    expect(c.read()).toBe("b");
    expect(cCalls).toBe(0);

    // b is now active
    b.write("bb");
    expect(c.read()).toBe("bb");
    expect(cCalls).toBe(1);
  },

  /**
   *  S(a) ─→ C(c)
   *  S(cond) ─→ C(d)
   *  C(c)   ?─→ C(d)   (when cond = true)
   *  S(b)   ?─→ C(d)   (when cond = false)
   *
   * cond and a change simultaneously. After the switch, d reads c
   * which depends on the updated a. The newly-acquired dep (c) must
   * be up-to-date before d evaluates.
   */
  "#14 new deps updated before dependee"(fw: ReactiveFramework) {
    const a = fw.signal(1);
    const b = fw.signal(10);
    const cond = fw.signal(false);

    const c = fw.computed(() => a.read());
    const d = fw.computed(() => (cond.read() ? c.read() : b.read()));

    expect(d.read()).toBe(10);

    // Switch to c branch, and change a at the same time
    cond.write(true);
    a.write(2);
    // d should see the updated a through c
    expect(d.read()).toBe(2);
  },

  /**
   *  S(a) ─→ C(b)
   *  S(a) ─→ C(c)
   *  C(b) ?─→ C(c)   (when a <= 0)
   *
   * c reads a directly; when a > 0 it returns a, otherwise it
   * falls through to b (which also reads a). Toggling a between
   * positive and zero switches which branch is taken.
   */
  "#16 lazy branch"(fw: ReactiveFramework) {
    const a = fw.signal(0);
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => (a.read() > 0 ? a.read() : b.read()));

    expect(c.read()).toBe(0);
    a.write(1);
    expect(c.read()).toBe(1);
    a.write(0);
    expect(c.read()).toBe(0);
  },

  /**
   *  S(toggle) ─→ C(p)
   *  S(state) ?─→ C(p)   (when toggle = true)
   *  S(state)  ─→ C(pp)
   *               E(eff) ← reads p
   *
   * p and pp both subscribe to state. When toggle flips to false,
   * p drops its subscription to state. This cleanup must not
   * accidentally remove pp's independent subscription to state.
   */
  "#165 computed dep cleanup doesn't delete sibling subscription"(
    fw: ReactiveFramework
  ) {
    const toggle = fw.signal(true);
    const state = fw.signal(1);

    const p = fw.computed(() => (toggle.read() ? state.read() : 111));
    const pp = fw.computed(() => state.read());

    fw.effect(() => {
      p.read();
    });

    toggle.write(false);
    expect(p.read()).toBe(111);

    state.write(2);
    expect(pp.read()).toBe(2);
  },

  /**
   *  S(flag) ─→ C(c)
   *  S(src) ?─→ C(c)   (when flag = true)
   *              |
   *             E(eff)
   *
   * flag=true: c reads src. flag flips to false: c drops src.
   * src changes while inactive. flag flips back to true:
   * c must re-subscribe to src and see its updated value.
   */
  "#166 after dep removed via branch switch, re-subscribing works"(
    fw: ReactiveFramework
  ) {
    const flag = fw.signal(true);
    const src = fw.signal(1);
    const c = fw.computed(() => (flag.read() ? src.read() : 0));
    let seen = -1;

    fw.effect(() => {
      seen = c.read();
    });
    expect(seen).toBe(1);

    flag.write(false);
    expect(seen).toBe(0);

    src.write(2);

    flag.write(true);
    expect(seen).toBe(2);
  },

  /**
   *  S(a) ─→ C(b) ─→ C(c)
   *           C(b) ─→ C(d)
   *           C(c) ?─→ C(d)   (when b is truthy)
   *
   * When a becomes null, b becomes null, and d skips the c branch.
   * c must NOT re-evaluate because d no longer reaches it,
   * even though c's dep (b) changed.
   */
  "#193 sequential dirty check: branch switch skips unreachable computed"(
    fw: ReactiveFramework
  ) {
    // a → b, b → c, d reads c only when b is truthy.
    // When a becomes null, b becomes null, d skips c.
    // c should NOT re-evaluate even though its dep b changed.
    let cCalls = 0;
    const a = fw.signal<{ v: number } | null>({ v: 1 });
    const b = fw.computed(() => a.read());
    const c = fw.computed(() => {
      cCalls++;
      return b.read()?.v;
    });
    const d = fw.computed(() => {
      if (b.read()) {
        return c.read();
      }
      return 0;
    });

    d.read();
    expect(cCalls).toBe(1);

    a.write(null);
    d.read();
    // c should not have been re-evaluated — d skipped it
    expect(cCalls).toBe(1);
  },

  /**
   *  S(items) ─→ C(isLoaded) ─→ C(msg)
   *                                |
   *                              E(eff)
   *
   * items toggles between undefined and arrays. isLoaded is a
   * boolean gate; msg maps it to a string. Repeated writes must
   * propagate correctly through the chain to the effect.
   */
  "#194 chained computed dirty reallocation via effect"(
    fw: ReactiveFramework
  ) {
    // items → isLoaded (boolean) → msg (string)
    // effect observes msg. Repeated writes to items.
    let seen = "";
    const items = fw.signal<number[] | undefined>(undefined);
    const isLoaded = fw.computed(() => !!items.read());
    const msg = fw.computed(() =>
      isLoaded.read() ? "loaded" : "not loaded"
    );

    fw.effect(() => {
      seen = msg.read();
    });
    expect(seen).toBe("not loaded");

    items.write([1, 2, 3]);
    expect(seen).toBe("loaded");

    items.write([4, 5]);
    expect(seen).toBe("loaded");

    items.write(undefined);
    expect(seen).toBe("not loaded");
  },

  /**
   *  S(items) ─→ C(isLoaded) ─→ C(msg)
   *
   * Same chain as #194 but driven by manual reads instead of an
   * effect. Intermediate reads of isLoaded are interleaved between
   * writes and final reads of msg. The chain must stay consistent.
   */
  "#195 chained computed dirty reallocation via manual read"(
    fw: ReactiveFramework
  ) {
    // Same chain as #194 but driven by manual reads with
    // intermediate computed reads interleaved.
    const items = fw.signal<number[] | undefined>(undefined);
    const isLoaded = fw.computed(() => !!items.read());
    const msg = fw.computed(() =>
      isLoaded.read() ? "loaded" : "not loaded"
    );

    expect(msg.read()).toBe("not loaded");

    items.write([1, 2, 3]);
    // Read intermediate computed before final
    isLoaded.read();
    expect(msg.read()).toBe("loaded");

    items.write(undefined);
    expect(msg.read()).toBe("not loaded");
  },

  /**
   *  S(src1) ─→ C(c1)
   *  S(src1) ─→ C(c2) ← S(src2)
   *     C(c1) ─→ C(c3) ← C(c2)
   *
   * Diamond through src1. When src1 changes 0→2, c1 changes but
   * c2 stays the same (src1%2 is still 0). c3 must still
   * re-evaluate because c1 changed. When src2 then changes,
   * c3 must re-evaluate again.
   */
  "#196 maybe-dirty diamond: first dep unmarked, second still triggers"(
    fw: ReactiveFramework
  ) {
    // c1 = src1, c2 = (src1 % 2) + src2, c3 = f(c1, c2)
    // When src1: 0→2, c1 changes but c2 stays 0. c3 must still re-evaluate.
    // When src2: 0→1, c2 changes. c3 must re-evaluate again.
    let c3Calls = 0;
    const src1 = fw.signal(0);
    const src2 = fw.signal(0);
    const c1 = fw.computed(() => src1.read());
    const c2 = fw.computed(() => (src1.read() % 2) + src2.read());
    const c3 = fw.computed(() => {
      c3Calls++;
      return c1.read() + c2.read();
    });

    c3.read();
    expect(c3Calls).toBe(1);

    src1.write(2);
    c3.read();
    expect(c3Calls).toBe(2);

    src2.write(1);
    c3.read();
    expect(c3Calls).toBe(3);
  },

  /**
   *  S(src) ─→ C(c1) ─→ C(c2) ─→ E(eff)
   *             c1 = src % 2
   *             c2 = c1 + 1
   *
   * Multiple writes to src (all even) leave c1's output at 0.
   * c1 re-evaluates, but value-equality must stop propagation:
   * c2 and the effect must not re-run.
   */
  "#197 chained value-equality stops propagation across multiple writes"(
    fw: ReactiveFramework
  ) {
    // src → c1 (src % 2) → c2 (c1 + 1) → effect
    // Multiple writes to src that don't change c1's output.
    // c2 and effect should not re-run.
    let c1Calls = 0;
    let c2Calls = 0;
    let effectRuns = 0;

    const src = fw.signal(0);
    const c1 = fw.computed(() => {
      c1Calls++;
      return src.read() % 2;
    });
    const c2 = fw.computed(() => {
      c2Calls++;
      return c1.read() + 1;
    });

    fw.effect(() => {
      c2.read();
      effectRuns++;
    });

    expect(effectRuns).toBe(1);
    c1Calls = 0;
    c2Calls = 0;
    effectRuns = 0;

    // All even numbers: c1 stays 0
    src.write(2);
    src.write(4);
    src.write(6);

    expect(c1Calls).toBeGreaterThanOrEqual(1);
    expect(c2Calls).toBe(0);
    expect(effectRuns).toBe(0);
  },

  /**
   *  S(cond) ─→ E(eff)
   *  S(a)   ?─→ E(eff)   (when cond = true)
   *
   * Initially cond=false so a is not tracked. After cond flips
   * to true, the effect discovers a as a new dep. Subsequent
   * writes to a must trigger the effect.
   */
  "#198 effect discovers new branch deps"(fw: ReactiveFramework) {
    // Effect has dynamic branch: cond ? a : "other".
    // Initially cond=false, a is not tracked.
    // After cond→true, changing a should trigger effect.
    const cond = fw.signal(false);
    const a = fw.signal("value");
    let runs = 0;
    let seen = "";

    fw.effect(() => {
      runs++;
      seen = cond.read() ? a.read() : "other";
    });

    expect(seen).toBe("other");
    expect(runs).toBe(1);

    // a is inactive — should not trigger
    a.write("Hi");
    expect(seen).toBe("other");
    expect(runs).toBe(1);

    // Switch branch → a becomes active
    cond.write(true);
    expect(seen).toBe("Hi");
    expect(runs).toBe(2);

    // a is now active
    a.write("World");
    expect(seen).toBe("World");
    expect(runs).toBe(3);
  },

  /**
   *  S(cond) ─→ E(eff)
   *  S(a)   ?─→ E(eff)   (when cond = true)
   *
   * Initially cond=true so a is tracked. After cond flips to
   * false, a becomes inactive. Subsequent writes to a must NOT
   * trigger the effect.
   */
  "#199 effect ignores inactive branch dep"(fw: ReactiveFramework) {
    // Effect has dynamic branch: cond ? a : "other".
    // Initially cond=true, a is tracked.
    // After cond→false, changing a should NOT trigger effect.
    const cond = fw.signal(true);
    const a = fw.signal("value");
    let runs = 0;
    let seen = "";

    fw.effect(() => {
      runs++;
      seen = cond.read() ? a.read() : "other";
    });

    expect(seen).toBe("value");
    expect(runs).toBe(1);

    // Switch to inactive branch
    cond.write(false);
    expect(seen).toBe("other");
    expect(runs).toBe(2);

    // a is now inactive — should not trigger
    a.write("changed");
    expect(seen).toBe("other");
    expect(runs).toBe(2);
  },

  /**
   *  S(a)  S(b)  S(c)  S(fx1Out)  S(fx2Out)
   *
   *  E(fx1): c<2 ?─→ a
   *          c>1 ?─→ b
   *          writes fx1Out
   *
   *  E(fx2): c>1 ?─→ a
   *          c<3 ?─→ b
   *          always reads fx1Out
   *          writes fx2Out
   *
   * Two effects with overlapping deps that shift based on a
   * shared condition signal c. Changing b must only trigger the
   * effect(s) that currently read it. Changing c reshuffles
   * which deps each effect tracks.
   */
  "#200 independent dep tracking across effects with dynamic deps"(
    fw: ReactiveFramework
  ) {
    // Two effects with overlapping deps that change branches
    // based on a shared condition signal.
    // fx1: c<2 → reads a; c>1 → reads b
    // fx2: c>1 → reads a; c<3 → reads b; also reads fx1 output
    const a = fw.signal(1);
    const b = fw.signal(2);
    const c = fw.signal(0);
    const fx1Out = fw.signal(0);
    const fx2Out = fw.signal(0);

    let fx1Runs = 0;
    fw.effect(() => {
      fx1Runs++;
      let result = 0;
      if (c.read() < 2) result += a.read();
      if (c.read() > 1) result += b.read();
      fx1Out.write(result);
    });

    let fx2Runs = 0;
    fw.effect(() => {
      fx2Runs++;
      let result = 0;
      if (c.read() > 1) result += a.read();
      if (c.read() < 3) result += b.read();
      result += fx1Out.read();
      fx2Out.write(result);
    });

    // c=0: fx1 reads a(1)→1, fx2 reads b(2)+fx1Out(1)→3
    expect(fx1Out.read()).toBe(1);
    expect(fx2Out.read()).toBe(3);

    fx1Runs = 0;
    fx2Runs = 0;

    // b changes: fx1 doesn't read b (c<2 only), fx2 reads b
    b.write(3);
    expect(fx1Out.read()).toBe(1);
    expect(fx2Out.read()).toBe(4);
    expect(fx1Runs).toBe(0);
    expect(fx2Runs).toBe(1);

    fx1Runs = 0;
    fx2Runs = 0;

    // c=2: fx1 reads b(3)→3, fx2 reads a(1)+b(3)+fx1Out(3)→7
    c.write(2);
    expect(fx1Out.read()).toBe(3);
    expect(fx2Out.read()).toBe(7);
  },
};
