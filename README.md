# Reactive Framework Test Suite

Cross-library test suite for comparing reactive signal behavior across **16 frameworks** with **161 test cases**.

> 2251 passed, 144 failed, 181 skipped out of 2576 total runs

Test cases are collected and adapted from the test suites of all participating frameworks — thanks to every project for their thorough testing work. This suite focuses on **reactive semantics** (propagation, batching, disposal, edge cases), not API completeness. Tests that require an optional capability (e.g. `batch`) are skipped (⬜) for frameworks that don't expose it, rather than marked as failures.

- ✅ Pass — correct behavior
- ❌ Fail — incorrect behavior or crash
- ⬜ Skip — required API not available

The summary is sorted by **pass rate** (pass / (pass + fail)), then by **coverage** ((pass + fail) / total). Read the two together: a high pass rate over low coverage means fewer tests could be run against that framework, not that it is more correct.

The **Behavioral Differences** section is separate — those tests reflect design choices (e.g. `Object.is` vs `===` equality, whether effects re-run, immediate vs deferred inner writes) where different answers are all valid.

## Frameworks

| Framework | Package | Version | Published |
|-----------|---------|---------|-----------|
| alien-signals | `alien-signals` | 3.2.1 | 2026-05-14 |
| @preact/signals-core | `@preact/signals-core` | 1.14.2 | 2026-05-11 |
| @reactively/core | `@reactively/core` | 0.0.8 | 2023-03-20 |
| tansu | `@amadeus-it-group/tansu` | 2.0.0 | 2024-12-04 |
| signal-polyfill (TC39) | `signal-polyfill` | 0.2.2 | 2025-01-17 |
| @vue/reactivity | `@vue/reactivity` | 3.5.34 | 2026-05-06 |
| mobx | `mobx` | 6.15.3 | 2026-05-07 |
| @reatom/core | `@reatom/core` | 1001.0.0 | 2026-05-13 |
| svelte | `svelte` | 5.55.5 | 2026-04-23 |
| solid-js | `solid-js` | 1.9.12 | 2026-03-24 |
| @solidjs/signals | `@solidjs/signals` | 0.3.2 | 2025-04-29 |
| S.js | `s-js` | 0.4.9 | 2018-07-28 |
| pota | `pota` | 0.7.82 | 2024-02-01 |
| @angular/core | `@angular/core` | 20.3.20 | 2026-05-06 |
| anod | `anod` | 0.9.1 | 2026-04-27 |
| @pravosleva/reactive-engine | `@pravosleva/reactive-engine` | 2.1.12 | 2026-10-14 |

## Summary

| Framework                   | Pass rate | Coverage | Pass | Fail | Skip | Total |
| --------------------------- | --------: | -------: | ---- | ---- | ---- | ----- |
| alien-signals               |    100.0% |   100.0% |  161 |    0 |    0 |   161 |
| @preact/signals-core        |     99.4% |   100.0% |  160 |    1 |    0 |   161 |
| @vue/reactivity             |     98.8% |   100.0% |  159 |    2 |    0 |   161 |
| tansu                       |     98.6% |    88.2% |  140 |    2 |   19 |   161 |
| signal-polyfill (TC39)      |     97.1% |    84.5% |  132 |    4 |   25 |   161 |
| @solidjs/signals            |     96.5% |    88.2% |  137 |    5 |   19 |   161 |
| @pravosleva/reactive-engine |     95.7% |   100.0% |  154 |    7 |    0 |   161 |
| @reatom/core                |     95.0% |   100.0% |  153 |    8 |    0 |   161 |
| @reactively/core            |     94.6% |    69.6% |  106 |    6 |   49 |   161 |
| svelte                      |     93.4% |    84.5% |  127 |    9 |   25 |   161 |
| @angular/core               |     93.4% |    84.5% |  127 |    9 |   25 |   161 |
| anod                        |     92.5% |   100.0% |  149 |   12 |    0 |   161 |
| solid-js                    |     91.9% |   100.0% |  148 |   13 |    0 |   161 |
| mobx                        |     90.1% |    88.2% |  128 |   14 |   19 |   161 |
| pota                        |     90.1% |   100.0% |  145 |   16 |    0 |   161 |
| S.js                        |     77.6% |   100.0% |  125 |   36 |    0 |   161 |

## Results

### Graph Propagation

Tests that changes propagate correctly through dependency graphs:
each node evaluates at most once, topological order is respected,
and value-equality cuts propagation.

```
Legend:
  S        signal (source)
  C        computed
  *C       computed that always returns a constant (value-equality cut)
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
```

| Framework                   | #1..#3,... ×17 | #7 | #192 | #204 |
| --------------------------- | -------------- | -- | ---- | ---- |
| alien-signals               |              ✅ |  ✅ |    ✅ |    ✅ |
| @preact/signals-core        |              ✅ |  ✅ |    ✅ |    ✅ |
| @reactively/core            |              ✅ |  ✅ |    ✅ |    ⬜ |
| tansu                       |              ✅ |  ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39)      |              ✅ |  ✅ |    ✅ |    ⬜ |
| @vue/reactivity             |              ✅ |  ✅ |    ✅ |    ✅ |
| mobx                        |              ✅ |  ❌ |    ✅ |    ✅ |
| @reatom/core                |              ✅ |  ✅ |    ✅ |    ✅ |
| svelte                      |              ✅ |  ✅ |    ✅ |    ⬜ |
| solid-js                    |              ✅ |  ✅ |    ✅ |    ✅ |
| @solidjs/signals            |              ✅ |  ✅ |    ✅ |    ✅ |
| S.js                        |              ✅ |  ❌ |    ❌ |    ✅ |
| pota                        |              ✅ |  ✅ |    ✅ |    ✅ |
| @angular/core               |              ✅ |  ✅ |    ✅ |    ⬜ |
| anod                        |              ✅ |  ✅ |    ✅ |    ✅ |
| @pravosleva/reactive-engine |              ✅ |  ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #7 unchanged computed values stop propagation to downstream

```
     S(a)
    /    \
  *C(b)  *C(c)  ← both always return constants
    \    /
     C(d)
```

Both branches unchanged. d must NOT re-evaluate (propagation cut).

#### #192 effect not re-run when computed dep value unchanged

```
   S(s)
     |
   *C(c)  ← 0 until s >= 10, then 1
     |
   E(eff)
```

Computed value unchanged despite source change.
Effect must NOT re-run (propagation cut by value-equality),
but must re-run once the computed value actually changes.

#### #204 multi-source fan-in

```
 S(a)  S(b)
   \    /
    C(c)
     |
   E(eff)
```

Two independent signals feed one computed.
Both change — c and effect must evaluate only once each.


</details>


### Dynamic Dependencies

Tests that dependency tracking adapts at runtime when conditional
branches change which signals/computeds are read.  A reactive
framework must add newly-reached deps, remove no-longer-reached
deps, and avoid redundant evaluations of nodes that become
unreachable after a branch switch.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge
  ?─→      conditional (dynamic) dependency edge
```

| Framework                   | #12..#13 | #14,#16,... ×10 | #197 |
| --------------------------- | -------- | --------------- | ---- |
| alien-signals               |        ✅ |               ✅ |    ✅ |
| @preact/signals-core        |        ✅ |               ✅ |    ✅ |
| @reactively/core            |        ✅ |               ✅ |    ✅ |
| tansu                       |        ✅ |               ✅ |    ✅ |
| signal-polyfill (TC39)      |        ✅ |               ✅ |    ✅ |
| @vue/reactivity             |        ✅ |               ✅ |    ✅ |
| mobx                        |        ❌ |               ✅ |    ✅ |
| @reatom/core                |        ✅ |               ✅ |    ✅ |
| svelte                      |        ✅ |               ✅ |    ✅ |
| solid-js                    |        ✅ |               ✅ |    ✅ |
| @solidjs/signals            |        ✅ |               ✅ |    ✅ |
| S.js                        |        ✅ |               ✅ |    ❌ |
| pota                        |        ✅ |               ✅ |    ✅ |
| @angular/core               |        ✅ |               ✅ |    ✅ |
| anod                        |        ✅ |               ✅ |    ✅ |
| @pravosleva/reactive-engine |        ✅ |               ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #12 active dep triggers, inactive dep does not

```
 S(cond) ─→ C(c)
 S(a)   ?─→ C(c)   (when cond = true)
 S(b)   ?─→ C(c)   (when cond = false)
```

Only the active branch dep triggers recomputation.
Writing to the inactive dep must not cause c to re-evaluate.

#### #13 switching branches deactivates old deps

```
 S(cond) ─→ C(c)
 S(a)   ?─→ C(c)   (when cond = true)
 S(b)   ?─→ C(c)   (when cond = false)
```

After switching cond from true to false, the old dep (a)
must be deactivated: writing to a must not trigger c.
The new dep (b) must be active.

#### #197 chained value-equality stops propagation across multiple writes

```
 S(src) ─→ C(c1) ─→ C(c2) ─→ E(eff)
            c1 = src % 2
            c2 = c1 + 1
```

Multiple writes to src (all even) leave c1's output at 0.
c1 re-evaluates, but value-equality must stop propagation:
c2 and the effect must not re-run.


</details>


### Computed Evaluation

Tests that computed nodes evaluate lazily and cache their results:
re-computation only happens when a dependency actually changes,
chained computeds propagate correctly, and value-equality cuts
prevent unnecessary downstream work.

```
Legend:
  S        signal (source)
  C        computed
  *C       computed that always returns a constant (value-equality cut)
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
```

| Framework                   | #18,#25 | #19,#21..#24,... ×8 | #149 | #27 |
| --------------------------- | ------- | ------------------- | ---- | --- |
| alien-signals               |       ✅ |                   ✅ |    ✅ |   ✅ |
| @preact/signals-core        |       ✅ |                   ✅ |    ✅ |   ✅ |
| @reactively/core            |       ✅ |                   ✅ |    ⬜ |   ✅ |
| tansu                       |       ✅ |                   ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39)      |       ✅ |                   ✅ |    ⬜ |   ✅ |
| @vue/reactivity             |       ✅ |                   ✅ |    ✅ |   ✅ |
| mobx                        |       ❌ |                   ✅ |    ✅ |   ❌ |
| @reatom/core                |       ✅ |                   ✅ |    ✅ |   ✅ |
| svelte                      |       ✅ |                   ✅ |    ⬜ |   ✅ |
| solid-js                    |       ✅ |                   ✅ |    ✅ |   ✅ |
| @solidjs/signals            |       ✅ |                   ✅ |    ✅ |   ✅ |
| S.js                        |       ✅ |                   ✅ |    ✅ |   ❌ |
| pota                        |       ✅ |                   ✅ |    ✅ |   ✅ |
| @angular/core               |       ✅ |                   ✅ |    ⬜ |   ✅ |
| anod                        |       ✅ |                   ✅ |    ✅ |   ✅ |
| @pravosleva/reactive-engine |       ✅ |                   ✅ |    ✅ |   ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #18 cached — not re-evaluated if deps unchanged

```
 S(a) → C(b)
```

Reading a computed twice without changing its dep must not
re-evaluate the compute function (result is cached).

#### #25 no re-compute if zero dependencies

```
 C(a)   (no deps)
```

A computed with no signal dependencies. After the initial
evaluation it must never re-compute.

#### #149 batch preserves correct evaluation order

```
 S(a) → C(b) → C(c)
                 |
               E(eff)
```

Inside a batch that writes a, the subsequent propagation must
evaluate b before c (topological order preserved).

#### #27 downstream not re-evaluated unless value changed

```
 S(a) → C(b) → C(c)
```

b clamps a to [0, 10]. When a changes but b's clamped output
stays the same, c must NOT re-evaluate (value-equality cut).


</details>


### Equality & Same-Value Optimization

Tests that the framework skips propagation when a signal is
written with the same value, or when a computed re-evaluates
but returns an identical result. Downstream nodes must not
re-evaluate when their inputs have not actually changed.

```
Legend:
  S        signal (source)
  C        computed
  *C       computed that always returns a constant (value-equality cut)
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
```

| Framework                   | #28,#34 | #169 | #220 |
| --------------------------- | ------- | ---- | ---- |
| alien-signals               |       ✅ |    ✅ |    ✅ |
| @preact/signals-core        |       ✅ |    ✅ |    ✅ |
| @reactively/core            |       ✅ |    ✅ |    ✅ |
| tansu                       |       ✅ |    ✅ |    ❌ |
| signal-polyfill (TC39)      |       ✅ |    ✅ |    ✅ |
| @vue/reactivity             |       ✅ |    ✅ |    ✅ |
| mobx                        |       ❌ |    ✅ |    ❌ |
| @reatom/core                |       ✅ |    ✅ |    ✅ |
| svelte                      |       ✅ |    ✅ |    ✅ |
| solid-js                    |       ✅ |    ✅ |    ✅ |
| @solidjs/signals            |       ✅ |    ✅ |    ✅ |
| S.js                        |       ❌ |    ❌ |    ❌ |
| pota                        |       ✅ |    ✅ |    ✅ |
| @angular/core               |       ✅ |    ✅ |    ✅ |
| anod                        |       ✅ |    ✅ |    ✅ |
| @pravosleva/reactive-engine |       ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #28 same primitive value — no propagation

```
 S(a) → C(c)
```

Writing the same primitive value to a signal must not cause
its downstream computed to re-evaluate.

#### #34 pruning stops at first unchanged node

```
 S(a) → *C(b) → C(c) → C(d)
```

b clamps to 0 or 1. Once b stabilizes at 1, further changes
to a must not propagate past b — c and d stay untouched.

#### #169 live pruning: effect not re-run when intermediate computed returns same

```
 S(s) → C(c1) → *C(c2) → E(eff)
```

c2 always returns 5 regardless of c1. Even with an active
effect subscription, the effect must not re-run when s changes
because c2's value never changes.

#### #220 computed same object reference — no downstream propagation

```
 S(a) → *C(b) → C(c)
```

b always returns the same object reference regardless of a.
Existing equality tests (#28/#34) use primitive values; this
verifies the same value-cut behaviour for non-primitive output.
c must NOT re-evaluate because b's reference is unchanged.


</details>


### Effect Lifecycle

Tests the full lifecycle of effects: creation, re-execution on
dependency changes, cleanup functions, disposal (including self-
disposal and double-disposal), and interactions between disposal
and the reactive graph (computed-triggered disposal, inner
computed recreation, subscription leaks).

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
  dispose  effect disposal call
```

| Framework                   | #35..#36,... ×6 | #38..#39,... ×7 | #40 | #42 | #111 | #141 | #178 | #222 | #229 | #230 | #233 | #235 | #236 |
| --------------------------- | --------------- | --------------- | --- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| alien-signals               |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core        |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| @reactively/core            |               ✅ |               ⬜ |   ⬜ |   ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |
| tansu                       |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |
| signal-polyfill (TC39)      |               ✅ |               ✅ |   ❌ |   ⬜ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |
| @vue/reactivity             |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| mobx                        |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |
| @reatom/core                |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| svelte                      |               ✅ |               ✅ |   ✅ |   ⬜ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |    ⬜ |    ✅ |    ⬜ |    ✅ |
| solid-js                    |               ✅ |               ✅ |   ✅ |   ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| @solidjs/signals            |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |
| S.js                        |               ✅ |               ✅ |   ❌ |   ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |    ❌ |    ✅ |
| pota                        |               ✅ |               ✅ |   ✅ |   ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| @angular/core               |               ✅ |               ✅ |   ❌ |   ⬜ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |
| anod                        |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |    ✅ |
| @pravosleva/reactive-engine |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |

<details>
<summary>Tests with failures or skips</summary>

#### #38 effect cleanup fn called before each re-run

```
 S(a) ← E(eff → cleanup)
```

The cleanup function returned by an effect runs before each
subsequent re-execution of that effect.

#### #39 effect cleanup fn called on disposal

```
 S(a) ← E(eff → cleanup) → dispose
```

The cleanup function runs when the effect is disposed.

#### #40 effect cleanup runs outside reactive evaluation context

```
 S(a) ← E(eff → cleanup reads S(b))
```

Cleanup runs outside the tracking context, so reading a signal
inside cleanup must NOT create a dependency on that signal.

#### #42 effect not executed if disposed during pending batch

```
 batch { S(a).write; E(eff).dispose }
```

An effect disposed inside a batch that also writes to its
dependency must NOT execute when the batch flushes.

#### #110 double-dispose is safe

```
 S(a) ← E(eff → cleanup) → dispose → dispose
```

Calling dispose twice must not throw and cleanup must not run
more than twice total (once per dispose at most).

#### #111 cleanup-triggered dispose prevents re-run

```
 S(a) ← E(eff → cleanup calls dispose)
```

Cleanup itself calls dispose. The effect must not re-run after
the cleanup-triggered disposal.

#### #141 dispose during execution then continue: no re-run

```
 S(a)  S(b) ← E(eff) → self-dispose mid-run
```

Effect reads a, self-disposes when a===1, then continues to
read b. After disposal, neither a nor b changes trigger re-run.

#### #178 dispose cleanup reads don't leak to parent tracking context

```
 S(a) ← E(inner → cleanup reads S(b))
 S(a) ← E(outer disposes inner when a===1)
```

Inner effect's cleanup reads b. When outer disposes inner,
b must NOT become a dependency of the outer effect.

#### #222 effect created inside cleanup tracks its own deps

 S(a) ← E_outer (→ cleanup creates E_inner ← S(b))

A common debounce-like pattern: an effect's cleanup creates a
fresh effect that subscribes to a different signal. The newly
created inner effect must run once on creation and react to
subsequent writes to its own dependency.

#### #229 cleanup reads computed: sees fresh value

```
 S(a) → C(c) reads S(a)
 S(a) → E(eff → cleanup reads C(c))
```

Cleanup reads a computed whose source has just changed. The
cleanup must observe the up-to-date computed value, not the
stale value captured before the write.

#### #230 cleanup writes signal inside batch propagates after flush

```
 S(a) → E1(eff → cleanup writes S(b))
 S(b) → E2(eff observes S(b))
```

E1's cleanup writes to a signal observed by E2, all wrapped in
a batch. After the batch completes, E2 must reflect the value
produced by the cleanup.

#### #231 untracked inside cleanup: still no tracking

```
 S(a) → E(eff → cleanup{ untracked{ S(b).read } })
```

Cleanup wraps a signal read in untracked. Since cleanup already
runs outside any tracking context (#40), this should also leave
no subscription. Tests that untracked composes correctly with
cleanup rather than producing a spurious dependency.

#### #233 cleanup write then read of dependent computed: sees new value

 S(a) → E(eff → cleanup{ S(b).write; read C(c) where C(c) reads S(b) })

Inside cleanup we write to b, then read computed c which depends
on b. c must reflect the just-written value of b — the write must
propagate to c before the cleanup's read in the same tick.

#### #235 batch inside effect body coalesces writes

 S(a) → E1{ batch{ S(b).write, S(b).write } }

```
 S(b) → E2
```

E1's body opens a batch and writes b twice. E2 (observer of b)
must run exactly once per E1 run, seeing only the final batched
value of b — not each intermediate write.

#### #236 cleanup write to own dep: bounded recursion completes

```
 S(a) → E(eff → cleanup writes S(a))
```

Cleanup writes the effect's own dep, which would normally re-
trigger the same effect. User code bounds the recursion with a
counter; framework must execute this without unbounded looping
or stack overflow.

#### #237 cleanup ordering on outer re-run: outer cleanup before re-run

```
 S(a) → E_outer{ E_inner }
```

outer's old cleanup runs BEFORE outer's new body runs. Whether
and in which order inner cleanup runs is a design difference
(see #241 in Behavioral Differences).

#### #238 dispose runs outer cleanup with nested effects

 E_outer{ E_inner } → dispose

Disposing the outer effect must run its cleanup. Cascade and
its order are a design difference (see #241).

#### #243 cleanup ordering correct after prior inner-only re-run

```
 S(a) → E_outer{ E_inner ─→ S(b) }
```

Regression: when inner re-runs alone (via its own dep b), the
outer is touched via the notify chain. The next real outer
re-run (via a) must still produce a valid cleanup ordering.

Invariant: same as #237 — outer cleanup before outer re-run.


</details>


### Nested Effects & Ordering

Tests that effects created inside other effects behave correctly:
outer effects run before inner effects, inner effects are disposed
when the outer re-runs, disposal cascades through multiple levels,
and recursive writes inside effects do not cause infinite loops.

```
Legend:
  S        signal (source)
  C        computed
  E        effect
  E{E}     outer effect containing an inner effect
  ─→       dependency edge (downstream reads upstream)
  ✕        disposed / cleaned up
```

| Framework                   | #43,#46,#164,... ×7 | #45 | #47,#163 | #170 |
| --------------------------- | ------------------- | --- | -------- | ---- |
| alien-signals               |                   ✅ |   ✅ |        ✅ |    ✅ |
| @preact/signals-core        |                   ✅ |   ✅ |        ✅ |    ✅ |
| @reactively/core            |                   ✅ |   ⬜ |        ✅ |    ✅ |
| tansu                       |                   ✅ |   ✅ |        ✅ |    ✅ |
| signal-polyfill (TC39)      |                   ✅ |   ✅ |        ✅ |    ✅ |
| @vue/reactivity             |                   ✅ |   ✅ |        ✅ |    ✅ |
| mobx                        |                   ✅ |   ✅ |        ✅ |    ✅ |
| @reatom/core                |                   ✅ |   ✅ |        ✅ |    ✅ |
| svelte                      |                   ✅ |   ✅ |        ❌ |    ✅ |
| solid-js                    |                   ✅ |   ✅ |        ✅ |    ✅ |
| @solidjs/signals            |                   ✅ |   ✅ |        ✅ |    ✅ |
| S.js                        |                   ✅ |   ✅ |        ✅ |    ❌ |
| pota                        |                   ✅ |   ✅ |        ✅ |    ✅ |
| @angular/core               |                   ✅ |   ✅ |        ✅ |    ✅ |
| anod                        |                   ✅ |   ✅ |        ✅ |    ✅ |
| @pravosleva/reactive-engine |                   ✅ |   ✅ |        ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #45 untracked inner effect does not subscribe to deps

```
 S(a) ─→ E_outer{ untracked{ E_inner ─→ S(a) } }
```

Inner effect is created inside an untracked block.
Outer effect must not subscribe to a's deps via untracked.
Inner effect still reads a directly and may re-run.

#### #47 effect recursion handled on first execution

```
 S(a) ─→ E(eff) ──write──→ S(a)
```

Effect writes to its own dependency on the first run.
Framework must handle the recursion without infinite looping.

#### #163 parent effect not triggered by child's own signal

```
 S(a) ─→ E_parent{ S(child) ─→ E_child }
                      ↑ write
```

Parent effect creates a child signal and inner effect, then
writes to the child signal. Parent must not re-trigger from
the child's signal write — only from a.

#### #170 inner effect not triggered when computed dep resolves unchanged

```
 S(a) ─→ *C(b)  ← b = a % 2
           |
 E_outer{ E_inner ─→ *C(b) }
```

a changes from 0 to 2 but b stays 0 (same parity).
Inner effect must NOT re-run (value-equality cut).


</details>


### Inner Write

Tests signal writes that originate from inside effects or
computed callbacks ("inner writes" / "side-effect writes").
Covers write-back from effects, computed side-channel writes,
convergence behavior, and interactions with batching and
dynamic dependency switching.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
  ═→       inner write (node writes to a signal during evaluation)
```

| Framework                   | #50,#52..#53,... ×16 | #51 | #54 | #114 | #180,#186 | #179 | #57 | #182 | #185 | #213 | #212 |
| --------------------------- | -------------------- | --- | --- | ---- | --------- | ---- | --- | ---- | ---- | ---- | ---- |
| alien-signals               |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core        |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core            |                    ✅ |   ⬜ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ⬜ |    ✅ |    ❌ |    ❌ |
| tansu                       |                    ✅ |   ⬜ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39)      |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ⬜ |    ✅ |    ❌ |    ❌ |
| @vue/reactivity             |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| mobx                        |                    ✅ |   ⬜ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core                |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ❌ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                      |                    ✅ |   ✅ |   ❌ |    ✅ |         ✅ |    ✅ |   ✅ |    ⬜ |    ✅ |    ❌ |    ✅ |
| solid-js                    |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals            |                    ✅ |   ⬜ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ❌ |    ❌ |
| S.js                        |                    ✅ |   ❌ |   ✅ |    ❌ |         ✅ |    ✅ |   ✅ |    ❌ |    ❌ |    ✅ |    ✅ |
| pota                        |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| @angular/core               |                    ✅ |   ✅ |   ✅ |    ✅ |         ✅ |    ✅ |   ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |
| anod                        |                    ✅ |   ✅ |   ✅ |    ❌ |         ✅ |    ❌ |   ✅ |    ❌ |    ✅ |    ✅ |    ✅ |
| @pravosleva/reactive-engine |                    ✅ |   ✅ |   ✅ |    ✅ |         ❌ |    ✅ |   ✅ |    ❌ |    ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #51 effect cleanup modifying dependency does not retrigger

```
 S(a) ← E(eff → cleanup ═→ S(a))
```

Cleanup writes to the effect's own dependency. This must not
cause an infinite retrigger loop.

#### #54 inner mutations propagate until changes settle

```
 S(a)  S(b) ← E(eff) ═→ S(b) when a>0 && b===0
```

Effect conditionally writes to b. The inner write must
propagate so that b settles to a's value.

#### #114 inner write final value unchanged: no downstream notification

```
 S(a) ← E(eff) ═→ S(a) resets to 0 when a===1
 S(a) → C(c) ← E(downstream)
```

Effect writes a back to its original value. The net change
is zero, so downstream must not be notified (or at most once).

#### #180 inner write through computed chain resets signal

```
 S(s) → C(c) ← E(eff) ═→ S(s) writes false when c is true
```

Effect resets s through a computed chain. Tests whether the
computed cache is updated after the inner write (determines
if future propagation is correct).

#### #179 computed self-increment: intra-run read-after-write values correct

```
 S(s) → C(c) ═→ S(s) [writes s+1, returns s]
```

Computed increments its own source while evaluating. The value
it reads back and the signal must reflect the post-write state.
(Whether the next read re-evaluates is #172's design difference.)
Framework may also forbid the write and throw.

#### #57 computed side effect triggers downstream

```
 S(src) → C(c) ═→ S(sideEffect)
 S(sideEffect) ← E(eff)
```

Computed writes to a side-effect signal. An effect watching
that signal must observe the written value after c evaluates.
Framework may also forbid the write and throw.

#### #182 computed side effect + batch: writes visible after flush

```
 batch { S(src).write → C(c) ═→ S(side) }
 S(side) ← E(eff)
```

Computed inner write happens inside a batch. After the batch
flushes, the side-effect signal and its effect must reflect
the written value.
Framework may forbid computed side effects (also valid).

#### #185 computed side effect write visible despite later throw

```
 S(src) → C(c) ═→ S(side), then throws when src>0
```

Computed writes to side then throws. The write that happened
before the throw must still be visible in the side signal.
Framework may forbid computed side effects (also valid).

#### #186 effect observes computed side-channel write during propagation

```
 S(src) → C(c) ═→ S(side)
 {C(c), S(side)} ← E(eff)
```

Effect reads both c and side. After src changes, the effect
must observe c's new value and side's inner-written value
consistently.
Framework may forbid computed side effects (also valid).

#### #213 inner write during initial effect execution doesn't block future propagation

```
 S(s) → C(c) ← E(eff) ═→ S(s) writes 0 when c>0
```

Effect resets s to 0 on initial run. Subsequent writes to s
must still propagate and be reset by the effect each time.

#### #212 inner write through computed doesn't block future propagation

```
 S(s) → C(c) ← E(eff) ═→ S(s) writes 0 when c>0
```

Same pattern as #213 but the initial s starts at 0. The first
external write triggers the reset. Future writes must still
propagate through the computed and be caught by the effect.


</details>


### Cycle & Infinite Loop Detection

Tests that a framework handles circular dependencies and runaway
effects without hanging or crashing.

Every cycle here is unbounded: nothing in the test code stops it.
Accepted outcomes:
  - the framework throws (cycle / iteration limit detected), or
  - the framework stops the loop on its own. To rule out "stopped"
    meaning "never propagated", the effect must have re-run during
    the cycle, or re-run on a later external write.

Every case carries a test-side guard of GUARD_RUNS effect runs. The
guard only protects the suite from hanging: tripping it is a failure,
never a detection. A stack overflow is a failure too.

A library that retains memory on every iteration can exhaust the heap
before the guard trips, so this section declares `mayNotTerminate`:
run its cases in a separate process with a fixed heap limit.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
  ↔ / ⟳   cyclic dependency
```

| Framework                   | #61 | #63 | #153 | #64,#221,#223 |
| --------------------------- | --- | --- | ---- | ------------- |
| alien-signals               |   ✅ |   ✅ |    ✅ |             ✅ |
| @preact/signals-core        |   ✅ |   ✅ |    ✅ |             ✅ |
| @reactively/core            |   ✅ |   ✅ |    ✅ |             ❌ |
| tansu                       |   ✅ |   ✅ |    ✅ |             ✅ |
| signal-polyfill (TC39)      |   ✅ |   ✅ |    ✅ |             ✅ |
| @vue/reactivity             |   ✅ |   ✅ |    ✅ |             ✅ |
| mobx                        |   ✅ |   ✅ |    ✅ |             ✅ |
| @reatom/core                |   ✅ |   ❌ |    ❌ |             ❌ |
| svelte                      |   ✅ |   ❌ |    ❌ |             ✅ |
| solid-js                    |   ✅ |   ✅ |    ✅ |             ✅ |
| @solidjs/signals            |   ✅ |   ✅ |    ✅ |             ✅ |
| S.js                        |   ✅ |   ✅ |    ✅ |             ✅ |
| pota                        |   ❌ |   ❌ |    ✅ |             ❌ |
| @angular/core               |   ❌ |   ❌ |    ✅ |             ❌ |
| anod                        |   ✅ |   ✅ |    ✅ |             ✅ |
| @pravosleva/reactive-engine |   ✅ |   ✅ |    ✅ |             ❌ |

<details>
<summary>Tests with failures or skips</summary>

#### #61 indirect cycle through effects

```
 S(a) → E(eff) → S(a)  ⟳
```

An effect reads a signal then writes back to it, unconditionally.
The framework must either throw or stop the loop by itself.

#### #63 cycle from modifying a branch (dynamic cycle creation)

```
 S(cond)  S(a)
    |      |
    E(eff)─┘
      |
      └─→ a.write(a.read()+1)  ⟳  (when cond=true)
```

Effect is safe when cond=false. Setting cond=true creates an
unbounded read-write cycle on a. The framework must either throw
or stop the loop by itself.

#### #153 computed self-dep recovery after catching cycle error

```
 S(a) → C(c) ⟳  (when a=0, c reads itself)
          |
        a.write(1) → C(c) reads a normally
```

When a=0, c tries to read itself (cycle) and catches the error.
After setting a=1, c must recover and return a's value.

#### #64 max iteration limit reached

```
 S(a) → E(e1) → S(b) → E(e2) → S(a)  ⟳
```

Two effects ping-pong values between two signals
(e1 reads a, writes b; e2 reads b, writes a+1) with no end
condition. The framework must cap iterations (throw or stop)
instead of looping forever.

#### #221 three-effect cycle stays bounded

```
 S(a) → E(e1) → S(b) → E(e2) → S(c) → E(e3) → S(a)  ⟳
```

Three effects forming a longer ping-pong cycle (e1 reads a writes
b; e2 reads b writes c; e3 reads c writes a). #64 tests a 2-effect
cycle; this variant verifies the framework's bounding holds for
longer cycles too — frameworks that detect direct (length-2) loops
may miss longer paths.

#### #223 cycle through computed stays bounded

```
 S(a) → E(e1) → S(b) → C(c) → E(e2) → S(a)  ⟳
```

Cycle path goes through an intermediate computed: e1 writes b,
c is derived from b, e2 reads c and writes a. Differs from #64
(direct effect-effect) and #221 (effect-effect chain) — verifies
the bound holds when the cycle passes through a computed.


</details>


### Batching / Transaction

Tests that writes inside a batch (transaction) are deferred:
effects and computed nodes only re-evaluate once when the
outermost batch completes, intermediate values are never
observed by effects, and value-equality elision still applies.

```
Legend:
  S        signal (source)
  C        computed
  *C       computed that always returns a constant (value-equality cut)
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
```

| Framework                   | #66,#72,#119,... ×4 | #67,#125,... ×4 | #69 | #70 | #120 | #121..#122,... ×5 | #123 | #130 |
| --------------------------- | ------------------- | --------------- | --- | --- | ---- | ----------------- | ---- | ---- |
| alien-signals               |                   ✅ |               ✅ |   ✅ |   ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |
| @preact/signals-core        |                   ✅ |               ✅ |   ✅ |   ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |
| @reactively/core            |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |    ⬜ |                 ⬜ |    ⬜ |    ✅ |
| tansu                       |                   ✅ |               ✅ |   ✅ |   ✅ |    ⬜ |                 ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39)      |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |    ✅ |                 ⬜ |    ⬜ |    ✅ |
| @vue/reactivity             |                   ✅ |               ✅ |   ✅ |   ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |
| mobx                        |                   ✅ |               ✅ |   ✅ |   ❌ |    ⬜ |                 ✅ |    ❌ |    ✅ |
| @reatom/core                |                   ✅ |               ✅ |   ✅ |   ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |
| svelte                      |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |    ❌ |                 ⬜ |    ⬜ |    ✅ |
| solid-js                    |                   ✅ |               ✅ |   ❌ |   ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |
| @solidjs/signals            |                   ✅ |               ✅ |   ✅ |   ✅ |    ⬜ |                 ✅ |    ❌ |    ✅ |
| S.js                        |                   ❌ |               ❌ |   ❌ |   ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |
| pota                        |                   ✅ |               ✅ |   ❌ |   ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |
| @angular/core               |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |    ✅ |                 ⬜ |    ⬜ |    ✅ |
| anod                        |                   ✅ |               ❌ |   ❌ |   ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |
| @pravosleva/reactive-engine |                   ✅ |               ✅ |   ✅ |   ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #66 nested batches: outer completion triggers propagation

```
 S(a) → E(eff)
```

Nested batch: inner batch completes but outer is still open.
Effect fires only once when the outermost batch ends.

#### #67 signals readable with updated value inside batch

```
 S(a)
```

Signal reads inside a batch reflect the latest written value
immediately (write-then-read consistency within the batch).

#### #69 throwing batch leaves a consistent state

```
 S(a) → E(eff)
```

Batch callback throws after writing. The framework may commit the
write (effects then run with it) or roll it back (nothing runs).
Either way the state must be consistent and later writes must
still propagate.

#### #70 effect first run is immediate even inside batch

```
 S(a) → E(eff)  [created inside batch]
```

An effect created inside a batch runs its initial execution
immediately (synchronously), not deferred to batch end.

#### #72 intermediate values skipped (only final value observed)

```
 S(a) → E(eff)
```

batch { a.write(1); a.write(2); a.write(3) } — effect observes
[0, 3] only; intermediate values 1 and 2 are never seen.

#### #119 batch: computed same result despite source change — no effect run

```
 S(a) ─→ C(c) → E(eff)
 S(b) ─→ /
```

batch { a.write(1); b.write(-1) } — c = a+b still equals 0.
Effect must NOT re-run (computed value unchanged).

#### #120 cleanup writes inside effect: downstream settles on final value

```
 S(a) → E(eff1)  cleanup: b.write(a.read())
 S(b) → E(eff2)
```

When eff1's cleanup writes to b, eff2 must settle on the final
value of b. (Only the final value is checked, not the number of
notifications.)

#### #121 pending effects run even if some effects throw during batch

```
 S(a) → E(good)
```

 S(a) → E(bad)   ← throws when a > 0

One effect throws during batch flush. The other (good) effect
must still run with the updated value.

#### #122 post-batch writes work normally

```
 S(a) → E(eff)
```

After a batch completes, subsequent writes propagate normally
(one write = one effect run), verifying batch state is fully reset.

#### #123 repeated no-op batches don't re-trigger effects

```
 S(a) → E(eff)
```

Multiple consecutive batches that each write then revert to the
original value. Effect must never re-run (all batches are no-ops).

#### #124 trigger+dispose+retrigger in batch = no run

```
 S(a) → E(eff) → dispose
```

batch { a.write(1); dispose(); a.write(2) } — effect is disposed
mid-batch. It must NOT run at batch end despite pending notification.

#### #125 batch: source reverts → computed not notified

```
 S(a) → C(c) → E(eff)
```

batch { a.write(5); a.write(0) } — source reverts to original.
Computed and effect must NOT re-evaluate.

#### #126 new effect inside batch after write sees updated value

 S(a) → E(eff)  [created inside batch after write]

batch { a.write(42); effect(...) } — effect created after the
write sees the updated value 42 on its initial run.

#### #128 reading computed in batch forces upstream evaluation

```
 S(a) → C(b) → C(c)
```

batch { a.write(5); c.read() } — pulling c inside the batch
forces eager evaluation of the entire upstream chain (b and c).

#### #129 reading one computed doesn't notify sibling effect early

```
     S(a)
    /    \
  C(c1)  C(c2) → E(eff)
```

batch { a.write(5); c1.read() } — reading sibling c1 inside
the batch must NOT trigger c2's effect early; effect fires
only when the batch completes.

#### #131 derived-of-derived: source reverts in batch

```
 S(a) → C(c1) → C(c2) → E(eff)
 S(b) ────────→ /
```

batch { a.write(5); a.write(0); b.write(20) } — a reverts but b
changes. c2 = c1 + b must still update because b changed.

#### #74 multiple signals grouped in single update

```
 S(a) ─→ E(eff)
 S(b) ─→ /
```

Two independent signals change inside one batch. Effect fires
exactly once and both signals have their final values.


</details>


### Untracked / Unsampled Reads

Tests that `fw.untracked()` suppresses dependency tracking.
Reads performed inside an untracked scope must not subscribe the
enclosing effect or computed to the read signal.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge
  ╌╌→      untracked read (no dependency created)
```

| Framework                   | #75,... ×4 | #76 | #218 | #219 |
| --------------------------- | ---------- | --- | ---- | ---- |
| alien-signals               |          ✅ |   ✅ |    ✅ |    ✅ |
| @preact/signals-core        |          ✅ |   ✅ |    ✅ |    ✅ |
| @reactively/core            |          ⬜ |   ⬜ |    ⬜ |    ⬜ |
| tansu                       |          ✅ |   ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39)      |          ✅ |   ✅ |    ⬜ |    ⬜ |
| @vue/reactivity             |          ✅ |   ✅ |    ✅ |    ✅ |
| mobx                        |          ✅ |   ❌ |    ✅ |    ✅ |
| @reatom/core                |          ✅ |   ✅ |    ✅ |    ✅ |
| svelte                      |          ✅ |   ✅ |    ⬜ |    ⬜ |
| solid-js                    |          ✅ |   ✅ |    ✅ |    ✅ |
| @solidjs/signals            |          ✅ |   ✅ |    ✅ |    ✅ |
| S.js                        |          ✅ |   ✅ |    ✅ |    ❌ |
| pota                        |          ✅ |   ✅ |    ✅ |    ✅ |
| @angular/core               |          ✅ |   ✅ |    ⬜ |    ⬜ |
| anod                        |          ✅ |   ✅ |    ✅ |    ✅ |
| @pravosleva/reactive-engine |          ✅ |   ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #75 untracked read in effect does not create dependency

```
 S(a) ─→ E(eff)
 S(b) ╌╌→ E(eff)   (untracked)
```

Effect tracks S(a) normally but reads S(b) inside
`untracked`. Changing S(b) must not re-run the effect.

#### #76 untracked read in computed does not create dependency

```
 S(a) ─→ C(c)
 S(b) ╌╌→ C(c)   (untracked)
```

Computed tracks S(a) but reads S(b) inside `untracked`.
Changing S(b) must not invalidate C(c).

#### #117 untracked read of stale computed returns fresh value

```
 S(a) ─→ C(b)
       ╌╌→ read via untracked
```

After S(a) is written, reading C(b) inside `untracked`
must still return the up-to-date value (lazy re-evaluation)
even though no dependency edge is created.

#### #118 untracked transitively doesn't track through nested deps

```
 S(a) ─→ C(b) ╌╌→ E(eff)   (untracked)
```

Effect reads C(b) inside `untracked`. Even though C(b)
itself depends on S(a), the effect must not re-run when
S(a) changes — the untracked scope blocks the entire
transitive chain.

#### #156 untracked write inside effect doesn't throw

```
 S(a) ─→ E(eff)
          eff ╌╌→ S(b).write   (untracked write)
```

Writing to S(b) inside an untracked scope within an effect
should not throw. The write is performed but does not
create a dependency back to the effect.

#### #218 untracked read survives across batched writes

```
 S(a) ─→ E(eff)
 S(b) ╌╌→ E(eff)   (untracked)
```

Effect tracks a and reads b inside `untracked`. Writes are
delivered via batch — untracked reads must still not create
a dependency, so writing only b inside a batch must not
trigger the effect.

#### #219 batch inside untracked still coalesces writes

 untracked { batch { S(a).write × 3 } } → E(eff)

A batch initiated inside `untracked` must still coalesce
writes and deliver a single notification to a tracked
effect outside the untracked scope.


</details>


### Error Handling

Tests that exceptions thrown inside computeds, effects, or
cleanup functions do not corrupt the reactive graph. After an
error the framework must remain consistent: recovery writes
produce correct values, unrelated branches stay intact, and
no stale scheduled work leaks across updates.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
  ⚡       node that may throw
```

| Framework                   | #84,#91,#155 | #89 | #90 | #92,#211,#93 | #154 | #177 | #247 |
| --------------------------- | ------------ | --- | --- | ------------ | ---- | ---- | ---- |
| alien-signals               |            ✅ |   ✅ |   ✅ |            ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core        |            ✅ |   ✅ |   ✅ |            ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core            |            ✅ |   ⬜ |   ⬜ |            ✅ |    ⬜ |    ❌ |    ✅ |
| tansu                       |            ✅ |   ⬜ |   ⬜ |            ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39)      |            ✅ |   ✅ |   ✅ |            ✅ |    ⬜ |    ✅ |    ✅ |
| @vue/reactivity             |            ✅ |   ✅ |   ✅ |            ✅ |    ✅ |    ✅ |    ✅ |
| mobx                        |            ✅ |   ⬜ |   ⬜ |            ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core                |            ✅ |   ✅ |   ✅ |            ✅ |    ✅ |    ✅ |    ✅ |
| svelte                      |            ✅ |   ✅ |   ✅ |            ✅ |    ⬜ |    ✅ |    ✅ |
| solid-js                    |            ❌ |   ✅ |   ✅ |            ❌ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals            |            ✅ |   ⬜ |   ⬜ |            ✅ |    ✅ |    ❌ |    ❌ |
| S.js                        |            ❌ |   ✅ |   ✅ |            ❌ |    ❌ |    ✅ |    ✅ |
| pota                        |            ✅ |   ✅ |   ❌ |            ❌ |    ❌ |    ✅ |    ✅ |
| @angular/core               |            ✅ |   ✅ |   ✅ |            ✅ |    ⬜ |    ❌ |    ❌ |
| anod                        |            ✅ |   ✅ |   ✅ |            ✅ |    ❌ |    ✅ |    ✅ |
| @pravosleva/reactive-engine |            ✅ |   ✅ |   ✅ |            ✅ |    ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #84 graph stays consistent after error in initial computed

```
 S(a) → C(b) ⚡ throws when a===0
```

Computed throws on its initial evaluation. After fixing the
signal, the computed must return the correct value.

#### #89 effect cleanup reset when effect throws

```
 S(a) ← E(eff ⚡ throws when a===1, → cleanup)
```

Effect throws on re-run. The cleanup from the previous
successful run must still be called.

#### #90 effect disposed when cleanup throws

```
 S(a) ← E(eff → cleanup ⚡ throws)
```

Cleanup itself throws. The effect must not enter an infinite
loop; subsequent updates must be bounded.

#### #91 exception halts propagation but other branches remain intact

```
 S(a) → C(bad) ⚡     S(b) → C(good)
```

After an exception in bad, the good branch must still
re-evaluate normally on subsequent writes to b.

#### #92 no stale scheduled updates left after exception

```
 S(a) → C(b) ⚡ throws when a===1
```

After error and recovery, no stale scheduled state remains.
Subsequent writes produce correct values without ghost re-runs.

#### #154 batch throw: effects survive, graph consistent

 batch { S(a).write; throw } ← E(eff)

User code throws inside a batch. The batch's signal write
must still flush, the effect must fire, and the graph must
remain consistent after the throw.

#### #155 errors cached when watched by effect (live caching)

```
 S(a) → C(c) ⚡ throws when a===0 ← E(eff)
```

Computed throws while being watched by an effect. Re-reading
the computed must not recompute excessively (error is cached).
After recovery write, the computed returns normally.

#### #177 skipped effects from failed flush not re-triggered by unrelated signal

```
 S(a)  S(b)  S(c) → C(d)
```

 E1 reads a; E2 ⚡ reads a; E3 reads a,d

E2 throws when a===2. After the failed flush, writing to
unrelated signal b must NOT re-trigger E3.

#### #211 computed error chain: downstream computed also throws

```
 S(a) → C(b) ⚡ → C(c)
```

b throws, causing downstream c to also throw. After recovery
both b and c must return correct values.

#### #247 flush queue consistent after effect throw

```
 S(a) ← E(e1)
 S(a) ← E(e2 ⚡ throws when a===1)
 S(a) ← E(e3)
 S(b) ← E(e4)
```

e2 throws during propagation of a(1), which may halt the
flush. On a subsequent write to unrelated signal b, only
b-dependent effects must run — a-dependent effects skipped
by the earlier halt must NOT leak into the new flush.

#### #93 exception recovery in computed

 S(a) → C(b) ⚡ throws when a is true

Computed alternates between throwing and returning "ok".
Each transition must work correctly in both directions.


</details>


### Stale Evaluation Order

Tests that computeds are re-evaluated in topological
(dependency-respecting) order after a source signal changes.
A correct framework must never evaluate a downstream computed
before its upstream dependency has been refreshed.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge
```

| Framework                   | #94,... ×4 | #95 |
| --------------------------- | ---------- | --- |
| alien-signals               |          ✅ |   ✅ |
| @preact/signals-core        |          ✅ |   ✅ |
| @reactively/core            |          ✅ |   ✅ |
| tansu                       |          ✅ |   ✅ |
| signal-polyfill (TC39)      |          ✅ |   ✅ |
| @vue/reactivity             |          ✅ |   ✅ |
| mobx                        |          ✅ |   ❌ |
| @reatom/core                |          ✅ |   ✅ |
| svelte                      |          ✅ |   ✅ |
| solid-js                    |          ✅ |   ✅ |
| @solidjs/signals            |          ✅ |   ✅ |
| S.js                        |          ✅ |   ✅ |
| pota                        |          ✅ |   ✅ |
| @angular/core               |          ✅ |   ✅ |
| anod                        |          ✅ |   ✅ |
| @pravosleva/reactive-engine |          ✅ |   ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #95 stale computations evaluated before their dependees

```
 S(a) ─→ C(b) ─→ C(c)
```

Linear chain: after S(a) changes, C(b) must be
re-evaluated before C(c) so that C(c) never sees a
stale intermediate value.


</details>


### Memory & GC

Tests that disposing effects and removing listeners correctly
cleans up subscriptions and dependency links, preventing
memory leaks and stale re-executions.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge
  ──X      disposed / removed edge
```

| Framework                   | #160..#161,#215 |
| --------------------------- | --------------- |
| alien-signals               |               ✅ |
| @preact/signals-core        |               ✅ |
| @reactively/core            |               ✅ |
| tansu                       |               ✅ |
| signal-polyfill (TC39)      |               ✅ |
| @vue/reactivity             |               ✅ |
| mobx                        |               ✅ |
| @reatom/core                |               ✅ |
| svelte                      |               ✅ |
| solid-js                    |               ✅ |
| @solidjs/signals            |               ✅ |
| S.js                        |               ✅ |
| pota                        |               ✅ |
| @angular/core               |               ✅ |
| anod                        |               ✅ |
| @pravosleva/reactive-engine |               ✅ |

<details>
<summary>Test descriptions</summary>

#### #160 computed after losing all listeners: disposed effects stop, value stays correct

```
 S(a) ─→ C(b) ─→ E(eff1)
              ─→ E(eff2)
      dispose both
 S(a) ─→ C(b)   (no listeners, links cleaned)
```

After disposing both effects, writes to S(a) must not
trigger the disposed callbacks. The computed C(b) should
still be readable on demand.

#### #161 multi-level computed after all listeners removed: disposed effect stops, value stays correct

```
 S(a) ─→ C(b) ─→ C(c) ─→ C(d) ─→ E(eff)
                                 dispose()
 S(a) ─→ C(b) ─→ C(c) ─→ C(d)   (no listener)
```

Disposing the sole effect at the end of a multi-level
computed chain must stop writes to S(a) from reaching it.
(Link cleanup itself is internal and not observed here.)
The computeds should still be readable on demand.

#### #215 partial dispose: sibling effect still notified

```
 S(a) ─→ C(b) ─→ E(eff1)
              ─→ E(eff2)
      dispose eff1
 S(a) ─→ C(b) ──X E(eff1)
              ─→ E(eff2)
```

Two effects share a computed. Disposing one must keep the
other's subscription intact — writes still trigger eff2 but
never trigger the disposed eff1.


</details>


### Behavioral Differences

Tests that probe framework-specific semantics where reactive
libraries legitimately diverge. Each test returns a descriptive
string (e.g. "lazy" / "eager") rather than asserting a single
correct answer — useful for characterizing a framework's design
choices.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge
```

| Framework                   | #17   | #15                | #146             | #29,#167  | #30        | #176         | #173       | #174       | #88              | #106        | #86,#107      | #49               | #62                | #175               | #246              | #244       | #172         | #209       | #210               | #187          | #188      | #189,#193 | #132,#147  | #241            | #216                  |
| --------------------------- | ----- | ------------------ | ---------------- | --------- | ---------- | ------------ | ---------- | ---------- | ---------------- | ----------- | ------------- | ----------------- | ------------------ | ------------------ | ----------------- | ---------- | ------------ | ---------- | ------------------ | ------------- | --------- | --------- | ---------- | --------------- | --------------------- |
| alien-signals               | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | returns stale | runs 1x per write | no throw           | unbatched (2 runs) | children survive  | LIFO       | re-evaluates | cascades   | replaced           | not evaluated | skipped   | skipped   | skipped    | deepest first   | creation order        |
| @preact/signals-core        | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write | cycle detected     | batched            | children survive  | no cascade | re-evaluates | no cascade | accumulates (2, 2) | not evaluated | skipped   | skipped   | skipped    | no cascade      | creation order        |
| @reactively/core            | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | post-write | post-write | keeps subscribed | halts flush | re-evaluates  | error             | no throw           | batched            | disposes children | ⬜          | caches       | no cascade | accumulates (2, 2) | not evaluated | ⬜         | skipped   | ⬜          | ⬜               | creation order        |
| tansu                       | lazy  | no subscription    | single recompute | Object.is | propagates | returns void | post-write | post-write | keeps subscribed | continues   | caches error  | runs 2x per write | manual bail (200+) | batched            | children survive  | ⬜          | throws       | no cascade | accumulates (2, 2) | not evaluated | skipped   | skipped   | skipped    | ⬜               | creation order        |
| signal-polyfill (TC39)      | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | continues   | caches error  | error             | no throw           | unbatched (2 runs) | children survive  | no cascade | caches       | no cascade | accumulates (2, 2) | not evaluated | ⬜         | skipped   | ⬜          | no cascade      | creation order        |
| @vue/reactivity             | lazy  | no subscription    | single recompute | Object.is | skips      | returns void | post-write | post-write | keeps subscribed | continues   | returns stale | runs 1x per write | no throw           | unbatched (2 runs) | children survive  | no cascade | re-evaluates | no cascade | accumulates (2, 2) | not evaluated | skipped   | skipped   | recomputed | no cascade      | creation order        |
| mobx                        | lazy  | no subscription    | single recompute | ===       | propagates | returns void | post-write | post-write | keeps subscribed | continues   | re-evaluates  | runs 2x per write | no throw           | batched            | children survive  | ⬜          | re-evaluates | no cascade | accumulates (2, 2) | not evaluated | skipped   | skipped   | recomputed | ⬜               | creation order        |
| @reatom/core                | lazy  | no subscription    | single recompute | Object.is | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write | cycle detected     | batched            | disposes children | FIFO       | throws       | cascades   | replaced           | not evaluated | skipped   | skipped   | skipped    | deepest first   | creation order        |
| svelte                      | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | post-write | throws     | unsubscribes     | halts flush | re-evaluates  | runs 2x per write | cycle detected     | batched            | children survive  | no cascade | throws       | no cascade | accumulates (2, 2) | not evaluated | ⬜         | skipped   | ⬜          | no cascade      | creation order        |
| solid-js                    | eager | subscribes eagerly | 2 recomputes     | ===       | skips      | returns void | post-write | post-write | unsubscribes     | halts flush | error         | runs 2x per write | manual bail (200+) | batched            | children survive  | LIFO       | throws       | cascades   | replaced           | evaluated     | evaluated | evaluated | recomputed | deepest first   | varies (1,2,3; 2,1,3) |
| @solidjs/signals            | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | caches error  | error             | no throw           | batched            | children survive  | ⬜          | caches       | cascades   | replaced           | not evaluated | skipped   | skipped   | recomputed | ⬜               | creation order        |
| S.js                        | eager | subscribes eagerly | 2 recomputes     | ===       | propagates | returns void | post-write | throws     | keeps subscribed | halts flush | error         | runs 2x per write | manual bail (200+) | batched            | children survive  | FIFO       | throws       | cascades   | replaced           | evaluated     | evaluated | evaluated | error      | outermost first | creation order        |
| pota                        | lazy  | no subscription    | 2 recomputes     | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | re-evaluates  | runs 2x per write | manual bail (200+) | batched            | disposes children | LIFO       | throws       | cascades   | replaced           | evaluated     | evaluated | evaluated | recomputed | deepest first   | varies (1,2,3; 2,1,3) |
| @angular/core               | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | halts flush | caches error  | runs 2x per write | manual bail (200+) | batched            | children survive  | no cascade | throws       | no cascade | accumulates (2, 2) | not evaluated | ⬜         | skipped   | ⬜          | no cascade      | creation order        |
| anod                        | eager | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write | manual bail (200+) | batched            | children survive  | LIFO       | re-evaluates | cascades   | replaced           | not evaluated | skipped   | skipped   | error      | outermost first | creation order        |
| @pravosleva/reactive-engine | lazy  | no subscription    | single recompute | Object.is | propagates | returns void | post-write | post-write | keeps subscribed | halts flush | re-evaluates  | runs 1x per write | no throw           | unbatched (2 runs) | children survive  | FIFO       | caches       | cascades   | replaced           | not evaluated | skipped   | skipped   | skipped    | deepest first   | creation order        |

<details>
<summary>Test descriptions</summary>

#### #17 computed evaluation timing

```
 S(a) ─→ C(b)
```

Determines whether creating a computed eagerly evaluates
its body or defers until the first `.read()` call.
Returns "lazy" or "eager".

#### #15 unread computed subscription

```
 S(a) ─→ C(b)
 S(a) ─→ C(c)   (c is never read)
```

Determines whether a computed that is created but never
read still subscribes to its source and re-evaluates
when the source changes.
Returns "no subscription" or "subscribes eagerly".

#### #146 recompute count on multiple dep changes

```
 S(a) ─→ C(c)
 S(b) ─→ C(c)
```

Two sources are written before C(c) is read. Checks
whether the framework coalesces into a single
re-evaluation or evaluates once per dirty source.
Returns "single recompute" or "N recomputes".

#### #29 NaN equality semantics

```
 S(a) ─→ C(c)
```

 a.write(NaN) when a already holds NaN

Checks whether the framework uses Object.is (NaN === NaN)
or strict === (NaN !== NaN) to decide if a signal value
has changed.
Returns "Object.is" or "===".

#### #167 computed NaN downstream propagation

```
 S(a) ─→ C(c) ─→ C(d)
```

C(c) returns NaN on consecutive evaluations.
Similar to #29, but tests equality semantics at the
computed-to-computed boundary. If C(c) returns NaN twice,
does C(d) skip re-evaluation (Object.is) or re-evaluate
(===)?
Returns "Object.is" or "===".

#### #30 same-reference signal write

```
 S(a) ─→ C(c)
```

Writes the same object reference back to a signal
(`a.write(obj)` where `obj` is already held).
Checks whether the framework treats it as a no-op
(skipped) or as a change that triggers downstream
re-evaluation.
Returns "skips" or "propagates".

#### #176 batch return value

Calls `fw.batch(() => 42)` and checks whether `batch`
forwards the return value of its callback to the caller.
Returns "returns value" or "returns void".

#### #173 mid-propagation read isolation

```
 S(a) ─→ E(eff1)          eff1: if a, b.write(1)
 S(a) ─→ E(eff2)          eff2: if a, read b
 S(b)  ─→ E(eff2)
```

Two effects share S(a). When S(a) is set to true, eff1
writes to S(b). Does eff2 see the pre-write value of
S(b) (isolation) or the post-write value?
Returns "pre-write", "post-write", or "throws".

#### #174 intra-run read-after-write

```
 S(a) ─→ E(eff)
 S(b)
 eff: b.write(1); then b.read()
```

Inside a single effect run, a signal is written and then
immediately read back. Does the read return the old value
(pre-write) or the just-written value (post-write)?
Returns "pre-write", "post-write", or "throws".

#### #88 effect subscription after first-run throw

```
 S(a) ─→ E(eff)   (eff throws on first run)
```

An effect reads S(a) then throws during its initial
execution. Checks whether the framework unsubscribes
the effect or keeps it subscribed for future writes.
Returns "unsubscribes" or "keeps subscribed".

#### #106 effect throw isolation in flush

```
 S(a) ─→ E(eff1)
 S(a) ─→ E(eff2)   (eff2 throws when a===1)
 S(a) ─→ E(eff3)
```

Three effects subscribe to S(a). The middle one throws
on update. Checks whether the framework continues
flushing the remaining effects or halts the entire flush.
Returns "continues" or "halts flush".

#### #86 computed error caching

```
 S(a) ─→ C(b)   (b throws when a===0)
```

A computed throws on first evaluation. On the second read
(with deps unchanged), does the framework cache the error,
re-evaluate the body, or return a stale value?
Returns "caches error", "re-evaluates", or "returns stale".

#### #107 non-Error throw caching

```
 S(a) ─→ C(b)   (b throws a string when a===0)
```

Same as #86 but the thrown value is a plain string instead
of an Error instance. Tests whether non-Error throw values
are handled identically.
Returns "caches error", "re-evaluates", or "returns stale".

#### #49 inner write re-run through computed chain

```
 S(s) ─→ C(c) ─→ E(eff)
```

 eff: if c > 0, s.write(0)   (self-correcting write)

An effect reads a computed chain and writes back to the
root signal when the value is non-zero, creating a
feedback loop. Whether the effect re-runs after its own
write varies; blocking later writes is a defect (#212).
Returns "runs <n>x per write".

#### #62 infinite loop in effect

```
 S(a) ─→ E(eff)
```

 eff: a.write(a.read() + 1)   (unconditional self-increment)

An effect unconditionally reads and increments its source
signal, creating an infinite loop. Checks whether the
framework detects the cycle (throws), runs without
throwing, or requires a manual bail-out.
Returns "cycle detected", "no throw", or "manual bail (200+)".

#### #175 effect multi-signal write batching

```
 S(a) ─→ E(eff1)
 eff1: b.write(a+1); c.write(a+2)
 S(b) ─→ C(d)
 S(c) ─→ C(d) ─→ E(eff2)
```

An effect writes to two signals that both feed into a
downstream computed. Checks whether the framework batches
the two writes so that E(eff2) runs only once.
Returns "batched" or "unbatched (N runs)".

#### #246 throwing run body child effect cleanup

```
 run{ E(child ─→ S(source)); throw }
```

A scope/root body creates a child effect then throws before
returning. Checks whether the framework disposes child
effects created before the throw or leaves them alive.
Returns "disposes children" or "children survive".

#### #244 sibling cleanup order on dispose

 E_outer{ E_inner1, E_inner2, E_inner3 } → dispose

Probes the cleanup order of sibling effects when their owner
disposes. Frameworks with parent-child cascade tend to use
either LIFO (reverse creation) or FIFO (creation order). A
flat-effect framework (no cascade) reports "no cascade".

#### #172 computed writing to own dep: next read

```
 S(a) → C(c) ═→ S(a) [increments a]
```

Computed writes to its own dependency. After the first read, c's
value and a agree, so caching c and re-evaluating it on the next
read are both consistent; forbidding the write is valid too.
Returns "re-evaluates", "caches" or "throws".

#### #209 three-level nested effect: disposal

```
 S(a) ─→ E_outer{ E_middle{ E_inner } }
               ✕ dispose outer
```

Three levels of nesting, all reading a. Hierarchical ownership
disposes middle and inner with outer; a flat effect model keeps
them running (see #244). Returns "cascades", "partial cascade" or
"no cascade".

#### #210 inner effects on outer re-run

```
 S(a) ─→ E_outer{ E_b ─→ S(b),  E_c ─→ S(c) }
```

Outer effect creates two inner effects and then re-runs.
Hierarchical ownership replaces the old inner effects; a flat
effect model keeps them, so each change runs old and new ones.
Returns "replaced" or "accumulates (<b runs>, <c runs>)".

#### #187 unsubscribed computed after write

```
     S(a)
    /    \
  *C(b)   C(d)
    |
  *C(c)
    |
   E(eff) → dispose
```

b and c are only reachable through the effect. After it is
disposed, a write reaches them only under eager evaluation (see
#17). Returns "not evaluated" or "evaluated".

#### #188 batch + dynamic deps: stale unreachable computed

```
 S(a)  S(b)
   |     |
   |   C(c)  ← c reads b
    \  /
    C(d)     ← d reads c only when a === 0
```

One batch makes c stale and unreachable. Lazy evaluation skips
it; eager evaluation (see #17) runs it before d drops the edge.
Returns "skipped" or "evaluated".

#### #189 multi-signal change: stale unreachable computed

```
 S(a)  S(b)  S(c)
   |           |
   |         C(d)  ← d reads c
   |          /
   C(e)      ← e reads b,d when a>0; only b when a≤0
```

Unbatched writes to a, b, c after a≤0 makes d unreachable.
Whether d still runs depends on lazy vs eager evaluation (see
#17). Returns "skipped" or "evaluated".

#### #193 branch switch: stale unreachable computed

```
 S(a) ─→ C(b) ─→ C(c)
          C(b) ─→ C(d)
          C(c) ?─→ C(d)   (when b is truthy)
```

a becomes null, so d skips c although c's dep b changed. A
sequential dirty check never reaches c; eager evaluation (see
#17) runs it. Returns "skipped" or "evaluated".

#### #132 batch revert: subscribed computed

```
 S(a) → C(c) → E(eff)
```

batch { a.write(5); a.write(0) } — the source ends where it
started. Value-snapshot dirty checks see no change and skip c;
version-based checks (as in the TC39 polyfill's model) re-run it
and the equality cut-off stops propagation. Both are valid; the
final value is not a variant (see #125).
Returns "skipped" or "recomputed".

#### #147 batch revert: unsubscribed computed

```
 S(a) → C(c)
```

Same as #132 with no subscriber: c is only read directly.
Returns "skipped" or "recomputed".

#### #241 nested cleanup order on dispose

 E_outer{ E_child{ E_grandchild } } → dispose

Order of cleanups when the outer effect is disposed. Owner trees
may tear down children first (LIFO) or the owner first; flat
effect models don't cascade at all.
Returns "deepest first", "outermost first", "no cascade" or
"partial cascade".

#### #216 sibling effect order on shared signal

```
 S(a) ← E(eff1)
      ← E(eff2)
      ← E(eff3)
```

Order in which independent sibling effects run on two successive
writes. No library contract fixes it.
Returns "creation order" or "varies (<first>; <second>)".


</details>


## Usage

### Test your own framework

Install the package:

```sh
npm install reactive-framework-test-suite
```

Implement the `ReactiveFramework` adapter:

```ts
import type { ReactiveFramework } from "reactive-framework-test-suite";

const myFramework: ReactiveFramework = {
  name: "my-framework",
  signal(initialValue) { /* ... */ },
  computed(fn) { /* ... */ },
  effect(fn) { /* ... return dispose */ },
  run(fn) { /* ... */ },
  // Optional:
  batch(fn) { /* ... */ },
  untracked(fn) { /* ... */ },
};
```

Wire it up with your test runner (vitest, jest, mocha, etc.):

```ts
import { testSuite, SkipTest, setExpect } from "reactive-framework-test-suite";
import { describe, test, expect } from "vitest";

// Optional: swap the built-in expect for your runner's
// for richer error messages and tighter integration.
setExpect(expect);

for (const { section, cases, type } of testSuite) {
  // Behavioral cases never fail; they return a string describing
  // the design choice your framework made (see Behavioral Differences).
  if (type === "behavioral") continue;
  describe(section, () => {
    for (const [name, fn] of Object.entries(cases)) {
      test(name, () => {
        try {
          myFramework.run(() => fn(myFramework));
        } catch (e) {
          if (e instanceof SkipTest) return; // optional API not available
          throw e;
        }
      });
    }
  });
}
```

### Run the cross-framework matrix locally

```sh
npm install
npm test
```

## License

[MIT](./LICENSE)
