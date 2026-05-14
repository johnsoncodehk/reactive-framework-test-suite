# Reactive Framework Test Suite

Cross-library test suite for comparing reactive signal behavior across **15 frameworks** with **177 test cases**.

> 2169 passed, 274 failed, 212 skipped out of 2655 total runs

Test cases are collected and adapted from the test suites of all participating frameworks — thanks to every project for their thorough testing work. This suite focuses on **reactive semantics** (propagation, batching, disposal, edge cases), not API completeness. Tests that require an optional capability (e.g. `batch`) are skipped (⬜) for frameworks that don't expose it, rather than marked as failures.

- ✅ Pass — correct behavior
- ❌ Fail — incorrect behavior or crash
- ⬜ Skip — required API not available

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

## Summary

| Framework              | Pass | Fail | Skip | Total |
| ---------------------- | ---- | ---- | ---- | ----- |
| alien-signals          |  177 |    0 |    0 |   177 |
| @preact/signals-core   |  174 |    3 |    0 |   177 |
| @reatom/core           |  173 |    4 |    0 |   177 |
| @vue/reactivity        |  170 |    7 |    0 |   177 |
| anod                   |  159 |   18 |    0 |   177 |
| solid-js               |  152 |   25 |    0 |   177 |
| tansu                  |  150 |    6 |   21 |   177 |
| @solidjs/signals       |  149 |    7 |   21 |   177 |
| signal-polyfill (TC39) |  140 |    8 |   29 |   177 |
| mobx                   |  138 |   18 |   21 |   177 |
| @angular/core          |  137 |   11 |   29 |   177 |
| S.js                   |  129 |   48 |    0 |   177 |
| svelte                 |  128 |   13 |   36 |   177 |
| @reactively/core       |  100 |   22 |   55 |   177 |
| pota                   |   93 |   84 |    0 |   177 |

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

| Framework              | #1..#3,... ×12 | #7 | #116,#190,#207 | #187,#189,#205 | #188 | #192 | #204 |
| ---------------------- | -------------- | -- | -------------- | -------------- | ---- | ---- | ---- |
| alien-signals          |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |              ✅ |  ✅ |              ✅ |              ✅ |    ⬜ |    ✅ |    ⬜ |
| tansu                  |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |              ✅ |  ✅ |              ✅ |              ✅ |    ⬜ |    ✅ |    ⬜ |
| @vue/reactivity        |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| mobx                   |              ✅ |  ❌ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |              ✅ |  ✅ |              ✅ |              ✅ |    ⬜ |    ✅ |    ⬜ |
| solid-js               |              ✅ |  ✅ |              ✅ |              ❌ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals       |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| S.js                   |              ✅ |  ❌ |              ✅ |              ❌ |    ❌ |    ❌ |    ✅ |
| pota                   |              ✅ |  ✅ |              ❌ |              ❌ |    ❌ |    ✅ |    ❌ |
| @angular/core          |              ✅ |  ✅ |              ✅ |              ✅ |    ⬜ |    ✅ |    ⬜ |
| anod                   |              ✅ |  ✅ |              ✅ |              ✅ |    ✅ |    ✅ |    ✅ |

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

#### #116 other listeners still notified after one disposes

```
 S(a) → C(c) ← E(e1)  [disposed]
               ← E(e2)  [still alive]
```

Two effects share one computed. After e1 disposes,
e2 must still receive updates.

#### #187 effect disposal deactivates upstream computed

```
     S(a)
    /    \
  *C(b)   C(d)
    |
  *C(c)
    |
   E(eff) → dispose
```

b, c only alive via effect. After disposing, a write must NOT
re-evaluate b or c (they have no subscribers left).

#### #188 batch + dynamic deps: unnecessary recompute avoided

```
 S(a)  S(b)
   |     |
   |   C(c)  ← c reads b
    \  /
    C(d)     ← d reads c only when a === 0
```

Batch: a=1 and b=1. After batch, a≠0 → d skips c.
c must NOT recompute (unreachable).

#### #189 multi-signal change: topological ordering preserved

```
 S(a)  S(b)  S(c)
   |           |
   |         C(d)  ← d reads c
   |          /
   C(e)      ← e reads b,d when a>0; only b when a≤0
```

Three signals change. d recomputes once, e recomputes once.
When a≤0, d becomes unreachable → should NOT recompute.

#### #190 computed notifies newly-subscribed effect after prior read

```
 S(a) → C(b) → C(c)
                 |
                E(eff)  ← subscribes after c.read()
```

Computed is read directly first, then an effect subscribes.
Effect must still be notified on subsequent changes.

#### #192 effect not re-run when computed dep value unchanged

```
   S(s)
     |
   *C(c)  ← always returns 0
     |
   E(eff)
```

Computed value unchanged despite source change.
Effect must NOT re-run (propagation cut by value-equality).

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

#### #205 multi-source cross-diamond

```
 S(a)    S(b)
   | \  / |
   |  \/  |
   |  /\  |
   | /  \ |
 C(c)   C(d)
    \   /
     C(e)
```

Two signals cross-feed two computeds joining at e.
Both signals change — c, d, e each evaluate once.

#### #207 wide fan-out: all effects fire once

```
            S(a)
      / / |  |  \ \
    C0 C1 C2 C3 C4 C5
     |  |  |  |  |  |
    E0 E1 E2 E3 E4 E5
```

Wide fan-out: one signal, many computed+effect pairs.
All effects fire exactly once.


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

| Framework              | #12..#13 | #14,#16,#165,... ×5 | #166,#194,... ×4 | #193 | #197 | #200 |
| ---------------------- | -------- | ------------------- | ---------------- | ---- | ---- | ---- |
| alien-signals          |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ❌ |
| tansu                  |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| @vue/reactivity        |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| mobx                   |        ❌ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| solid-js               |        ✅ |                   ✅ |                ✅ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals       |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| S.js                   |        ✅ |                   ✅ |                ✅ |    ❌ |    ❌ |    ✅ |
| pota                   |        ✅ |                   ✅ |                ❌ |    ❌ |    ✅ |    ❌ |
| @angular/core          |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |
| anod                   |        ✅ |                   ✅ |                ✅ |    ✅ |    ✅ |    ✅ |

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

#### #166 after dep removed via branch switch, re-subscribing works

```
 S(flag) ─→ C(c)
 S(src) ?─→ C(c)   (when flag = true)
             |
            E(eff)
```

flag=true: c reads src. flag flips to false: c drops src.
src changes while inactive. flag flips back to true:
c must re-subscribe to src and see its updated value.

#### #193 sequential dirty check: branch switch skips unreachable computed

```
 S(a) ─→ C(b) ─→ C(c)
          C(b) ─→ C(d)
          C(c) ?─→ C(d)   (when b is truthy)
```

When a becomes null, b becomes null, and d skips the c branch.
c must NOT re-evaluate because d no longer reaches it,
even though c's dep (b) changed.

#### #194 chained computed dirty reallocation via effect

```
 S(items) ─→ C(isLoaded) ─→ C(msg)
                               |
                             E(eff)
```

items toggles between undefined and arrays. isLoaded is a
boolean gate; msg maps it to a string. Repeated writes must
propagate correctly through the chain to the effect.

#### #197 chained value-equality stops propagation across multiple writes

```
 S(src) ─→ C(c1) ─→ C(c2) ─→ E(eff)
            c1 = src % 2
            c2 = c1 + 1
```

Multiple writes to src (all even) leave c1's output at 0.
c1 re-evaluates, but value-equality must stop propagation:
c2 and the effect must not re-run.

#### #198 effect discovers new branch deps

```
 S(cond) ─→ E(eff)
 S(a)   ?─→ E(eff)   (when cond = true)
```

Initially cond=false so a is not tracked. After cond flips
to true, the effect discovers a as a new dep. Subsequent
writes to a must trigger the effect.

#### #199 effect ignores inactive branch dep

```
 S(cond) ─→ E(eff)
 S(a)   ?─→ E(eff)   (when cond = true)
```

Initially cond=true so a is tracked. After cond flips to
false, a becomes inactive. Subsequent writes to a must NOT
trigger the effect.

#### #200 independent dep tracking across effects with dynamic deps

```
 S(a)  S(b)  S(c)  S(fx1Out)  S(fx2Out)

 E(fx1): c<2 ?─→ a
         c>1 ?─→ b
         writes fx1Out

 E(fx2): c>1 ?─→ a
         c<3 ?─→ b
         always reads fx1Out
         writes fx2Out
```

Two effects with overlapping deps that shift based on a
shared condition signal c. Changing b must only trigger the
effect(s) that currently read it. Changing c reshuffles
which deps each effect tracks.


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

| Framework              | #18,#25 | #19,#21..#22,... ×7 | #23 | #147 | #149 | #27 |
| ---------------------- | ------- | ------------------- | --- | ---- | ---- | --- |
| alien-signals          |       ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |       ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |       ✅ |                   ✅ |   ✅ |    ⬜ |    ⬜ |   ✅ |
| tansu                  |       ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |       ✅ |                   ✅ |   ✅ |    ⬜ |    ⬜ |   ✅ |
| @vue/reactivity        |       ✅ |                   ✅ |   ✅ |    ❌ |    ✅ |   ✅ |
| mobx                   |       ❌ |                   ✅ |   ✅ |    ❌ |    ✅ |   ❌ |
| @reatom/core           |       ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |       ✅ |                   ✅ |   ✅ |    ⬜ |    ⬜ |   ✅ |
| solid-js               |       ✅ |                   ✅ |   ✅ |    ❌ |    ✅ |   ✅ |
| @solidjs/signals       |       ✅ |                   ✅ |   ✅ |    ❌ |    ✅ |   ✅ |
| S.js                   |       ✅ |                   ✅ |   ✅ |    ❌ |    ✅ |   ❌ |
| pota                   |       ✅ |                   ✅ |   ❌ |    ❌ |    ✅ |   ✅ |
| @angular/core          |       ✅ |                   ✅ |   ✅ |    ⬜ |    ⬜ |   ✅ |
| anod                   |       ✅ |                   ✅ |   ✅ |    ❌ |    ✅ |   ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #18 cached — not re-evaluated if deps unchanged

```
 S(a) → C(b)
```

Reading a computed twice without changing its dep must not
re-evaluate the compute function (result is cached).

#### #23 sync access of invalidated chained computed runs effect

```
 S(a) → C(b) → C(c)
                 |
               E(eff)
```

An effect subscribes to the tail of a chain. A synchronous
read of c after writing a must trigger the effect.

#### #25 no re-compute if zero dependencies

```
 C(a)   (no deps)
```

A computed with no signal dependencies. After the initial
evaluation it must never re-compute.

#### #147 computed not recomputed in batch if dep reverts

```
 S(a) → C(c)
```

Inside a batch, a is written to 5 then back to 0.
The net change is zero, so c must not re-evaluate.

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

| Framework              | #28,#34 | #169 | #220 |
| ---------------------- | ------- | ---- | ---- |
| alien-signals          |       ✅ |    ✅ |    ✅ |
| @preact/signals-core   |       ✅ |    ✅ |    ✅ |
| @reactively/core       |       ✅ |    ✅ |    ✅ |
| tansu                  |       ✅ |    ✅ |    ❌ |
| signal-polyfill (TC39) |       ✅ |    ✅ |    ✅ |
| @vue/reactivity        |       ✅ |    ✅ |    ✅ |
| mobx                   |       ❌ |    ✅ |    ❌ |
| @reatom/core           |       ✅ |    ✅ |    ✅ |
| svelte                 |       ✅ |    ✅ |    ✅ |
| solid-js               |       ✅ |    ✅ |    ✅ |
| @solidjs/signals       |       ✅ |    ✅ |    ✅ |
| S.js                   |       ❌ |    ❌ |    ❌ |
| pota                   |       ✅ |    ✅ |    ✅ |
| @angular/core          |       ✅ |    ✅ |    ✅ |
| anod                   |       ✅ |    ✅ |    ✅ |

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

| Framework              | #35,#143,... ×4 | #36,#108,#217 | #38 | #39,#110,#242 | #40 | #42 | #111 | #141 | #178 | #201 | #202 | #216 | #222 | #229 | #230 | #231 | #233 | #235 | #236 | #237,#243 | #238,#241 |
| ---------------------- | --------------- | ------------- | --- | ------------- | --- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | --------- | --------- |
| alien-signals          |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |         ✅ |         ✅ |
| @preact/signals-core   |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |         ✅ |         ✅ |
| @reactively/core       |               ✅ |             ✅ |   ⬜ |             ⬜ |   ⬜ |   ⬜ |    ⬜ |    ✅ |    ⬜ |    ❌ |    ✅ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |         ⬜ |         ⬜ |
| tansu                  |               ✅ |             ✅ |   ⬜ |             ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ❌ |    ✅ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |         ⬜ |         ⬜ |
| signal-polyfill (TC39) |               ✅ |             ✅ |   ✅ |             ✅ |   ❌ |   ⬜ |    ✅ |    ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |    ✅ |         ✅ |         ✅ |
| @vue/reactivity        |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ✅ |    ❌ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |         ✅ |         ✅ |
| mobx                   |               ✅ |             ✅ |   ⬜ |             ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |         ⬜ |         ⬜ |
| @reatom/core           |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |         ✅ |         ✅ |
| svelte                 |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ⬜ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ✅ |         ✅ |         ✅ |
| solid-js               |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |         ✅ |         ✅ |
| @solidjs/signals       |               ✅ |             ✅ |   ⬜ |             ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |         ⬜ |         ⬜ |
| S.js                   |               ✅ |             ✅ |   ✅ |             ✅ |   ❌ |   ❌ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ❌ |    ❌ |    ✅ |         ✅ |         ✅ |
| pota                   |               ✅ |             ❌ |   ❌ |             ✅ |   ❌ |   ✅ |    ❌ |    ❌ |    ❌ |    ✅ |    ❌ |    ❌ |    ❌ |    ❌ |    ❌ |    ❌ |    ❌ |    ❌ |    ✅ |         ❌ |         ✅ |
| @angular/core          |               ✅ |             ✅ |   ✅ |             ✅ |   ❌ |   ⬜ |    ❌ |    ✅ |    ❌ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |    ❌ |         ✅ |         ✅ |
| anod                   |               ✅ |             ✅ |   ✅ |             ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |    ✅ |         ❌ |         ❌ |

<details>
<summary>Tests with failures or skips</summary>

#### #36 effect re-runs when dependency changes

```
 S(a) ← E(eff)
```

Effect re-runs each time its signal dependency changes.

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

#### #108 effect self-dispose during execution is safe

```
 S(a) ← E(eff) → self-dispose on 2nd run
```

An effect that calls its own dispose function during execution
must not crash and must stop future re-runs.

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

#### #201 computed-triggered disposal: effect skipped and no subscription leak

 S(s) → C(a) ← E(e1) [disposed by a when s===1]

```
               ← E(e2) [keeps a alive]
```

Computed a disposes e1 during its own evaluation. e1 must not
re-run and must leave no subscription leak.

#### #202 computed-triggered disposal: sibling effects still notified

 S(s) → C(a) ← E(e1) [disposed by a when s===1]

```
               ← E(e2) [must still see a's new value]
```

Computed a disposes e1 during evaluation. Sibling effect e2
must still receive the updated value.

#### #216 effects fire in creation order on shared signal

```
 S(a) ← E(eff1)
      ← E(eff2)
      ← E(eff3)
```

Three effects subscribe to the same signal. On signal change
they must fire in subscription (creation) order.

#### #217 new effect after dispose works normally

```
 S(a) ← E1 → dispose
      ← E2  (created after E1 disposed)
```

After an effect is disposed, creating a new effect on the
same signal must work normally — fresh subscription, normal
re-runs. Confirms dispose doesn't poison the signal's
subscriber set.

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

#### #237 cleanup ordering on outer re-run: outer-cleanup before re-run, inner before outer if cascaded

```
 S(a) → E_outer{ E_inner }
```

Universal invariants on outer re-run:
  - outer's old cleanup runs BEFORE outer's new body runs
  - if inner cleanup fires at all, it runs BEFORE outer's cleanup
    (deepest first when the framework cascades)

Frameworks with a flat-effect model (no parent-child cascade)
just won't fire inner cleanup; that's accepted.

#### #238 cleanup ordering on dispose: inner before outer if cascaded

 E_outer{ E_inner } → dispose

Universal invariant on dispose:
  - outer cleanup must run
  - if inner cleanup runs (cascade), it runs BEFORE outer

Flat frameworks (no cascade) only see outer cleanup; that's accepted.

#### #241 three-level cleanup ordering: deepest first if cascaded

 E_outer{ E_child{ E_grandchild } } → dispose

Universal invariant for three-level nesting:
  - if cleanups cascade, deepest goes first (grandchild < child < outer)
  - outer cleanup must fire

Flat frameworks (no cascade) will only see outer cleanup; accepted.

#### #242 effect in computed: old inner cleanup (if any) before new eval

 S(a) → C(c){ E_inner } → E_outer reads C(c)

Universal invariant on computed re-evaluation:
  - if computed cleans up effects from previous eval, the cleanup
    fires BEFORE the new eval runs
  - the new eval and new inner:run come after computed:eval

Frameworks that don't cascade computed-owned effects just won't
fire inner:cleanup; accepted.

#### #243 cleanup ordering correct after prior inner-only re-run

```
 S(a) → E_outer{ E_inner ─→ S(b) }
```

Regression: when inner re-runs alone (via its own dep b), the
outer is touched via the notify chain. The next real outer
re-run (via a) must still produce a valid cleanup ordering.

Universal invariant: same as #237 — outer cleanup before outer
re-run; inner cleanup (if cascaded) before outer cleanup.


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

| Framework              | #43,#48 | #45 | #46 | #47 | #163 | #164,#226..#228 | #170 | #209 | #210 |
| ---------------------- | ------- | --- | --- | --- | ---- | --------------- | ---- | ---- | ---- |
| alien-signals          |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| @reactively/core       |       ❌ |   ⬜ |   ✅ |   ✅ |    ❌ |               ❌ |    ❌ |    ❌ |    ❌ |
| tansu                  |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| signal-polyfill (TC39) |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| @vue/reactivity        |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| mobx                   |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| @reatom/core           |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |       ✅ |   ⬜ |   ✅ |   ❌ |    ❌ |               ✅ |    ✅ |    ❌ |    ❌ |
| solid-js               |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| @solidjs/signals       |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ✅ |    ✅ |
| S.js                   |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ❌ |    ❌ |    ❌ |
| pota                   |       ✅ |   ✅ |   ❌ |   ✅ |    ❌ |               ❌ |    ✅ |    ✅ |    ❌ |
| @angular/core          |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ❌ |    ❌ |
| anod                   |       ✅ |   ✅ |   ✅ |   ✅ |    ✅ |               ✅ |    ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #43 outer effect runs before inner effect

```
 S(a) ─→ E_outer{ E_inner }
```

Outer effect and inner effect both read a.
Outer must execute before inner on initial run.

#### #45 untracked inner effect does not subscribe to deps

```
 S(a) ─→ E_outer{ untracked{ E_inner ─→ S(a) } }
```

Inner effect is created inside an untracked block.
Outer effect must not subscribe to a's deps via untracked.
Inner effect still reads a directly and may re-run.

#### #46 duplicate subscribers don't cause duplicate notifications

```
 S(a) ─→ E(eff)   [reads a twice]
```

Effect reads the same signal twice in one execution.
Must still fire only once per change, not once per read.

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

#### #164 inner autorun created inside outer tracks own deps

```
 S(a) ─→ E_outer{ E_inner ─→ S(b) }
```

Inner effect reads b (not a). When b changes, the inner
effect must re-run independently of the outer effect.

#### #170 inner effect not triggered when computed dep resolves unchanged

```
 S(a) ─→ *C(b)  ← b = a % 2
           |
 E_outer{ E_inner ─→ *C(b) }
```

a changes from 0 to 2 but b stays 0 (same parity).
Inner effect must NOT re-run (value-equality cut).

#### #209 three-level nested effect: cascading disposal

```
 S(a) ─→ E_outer{ E_middle{ E_inner } }
               ✕ dispose outer
                 ✕ middle cascades
                   ✕ inner cascades
```

Three levels of nesting. Disposing the outermost effect must
cascade disposal to middle and inner. After dispose, no effect
runs when a changes.

#### #210 multiple inner effects all cleaned when outer re-runs

```
 S(a) ─→ E_outer{ E_b ─→ S(b),  E_c ─→ S(c) }
              ✕ old E_b, E_c on outer re-run
```

Outer effect creates two sibling inner effects. When a changes,
both old inner effects must be cleaned up. After re-run, only
the new inner effects should respond to b and c changes.

#### #48 nested effects depend on state of outer effects

```
 S(a) ─→ E_outer{ val=a.read(); E_inner{ observe(val) } }
```

Inner effect captures a closure variable from the outer effect.
The observed value must reflect the outer's current execution.

#### #226 outer keeps responding to own deps after inner re-runs

```
 S(a) ─→ E_outer{ E_inner ─→ S(b) }
```

Outer reads a and creates an inner effect that reads b.
After b changes (which re-runs only the inner), the outer
must still respond to subsequent writes to its own dep a.

Regression observed in alien-signals 3.2.0 (works in 3.1.2):
after the inner re-runs once on its own, the outer's link
to a is dropped and a.write no longer triggers it.
See https://github.com/stackblitz/alien-signals/issues/115

#### #227 outer responds after one of multiple sibling inners re-runs

```
 S(a) ─→ E_outer{ E_inner1 ─→ S(b1),  E_inner2 ─→ S(b2) }
```

Outer creates two sibling inner effects. After only one of them
re-runs (via its own dep), the outer must still respond to a.
Same parent-child link integrity property as #226, but with
sibling inners — could expose bugs where one inner's re-run
corrupts the other or the parent's link.

#### #228 outer responds after inner re-runs multiple times

```
 S(a) ─→ E_outer{ E_inner ─→ S(b) }
 b.write × 3
```

Inner re-runs multiple times via successive writes to b. After
the burst, the outer must still respond to a. Verifies the
parent-child link survives repeated inner re-runs, not just one.


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

| Framework              | #50,#186,... ×4 | #51 | #52,#112,... ×11 | #53,#56,... ×5 | #54 | #179 | #57 | #182 | #183,#185 | #213 | #212 |
| ---------------------- | --------------- | --- | ---------------- | -------------- | --- | ---- | --- | ---- | --------- | ---- | ---- |
| alien-signals          |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ✅ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| @preact/signals-core   |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ✅ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| @reactively/core       |               ❌ |   ⬜ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ⬜ |         ✅ |    ✅ |    ✅ |
| tansu                  |               ✅ |   ⬜ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ⬜ |         ✅ |    ❌ |    ❌ |
| @vue/reactivity        |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ✅ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| mobx                   |               ✅ |   ⬜ |                ✅ |              ✅ |   ✅ |    ✅ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| @reatom/core           |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ✅ |         ✅ |    ✅ |    ✅ |
| svelte                 |               ✅ |   ✅ |                ✅ |              ✅ |   ❌ |    ❌ |   ❌ |    ⬜ |         ✅ |    ❌ |    ✅ |
| solid-js               |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ✅ |         ❌ |    ✅ |    ✅ |
| @solidjs/signals       |               ✅ |   ⬜ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ✅ |         ✅ |    ❌ |    ❌ |
| S.js                   |               ✅ |   ❌ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ❌ |         ❌ |    ✅ |    ✅ |
| pota                   |               ❌ |   ❌ |                ✅ |              ❌ |   ❌ |    ❌ |   ✅ |    ❌ |         ❌ |    ❌ |    ❌ |
| @angular/core          |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ❌ |   ❌ |    ⬜ |         ✅ |    ✅ |    ✅ |
| anod                   |               ✅ |   ✅ |                ✅ |              ✅ |   ✅ |    ❌ |   ✅ |    ❌ |         ✅ |    ✅ |    ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #50 effect writes back to signal

```
 S(a) ← E(eff) ═→ S(b)
```

Effect reads a and writes a*2 into b. b must reflect the
derived value after each change to a.

#### #51 effect cleanup modifying dependency does not retrigger

```
 S(a) ← E(eff → cleanup ═→ S(a))
```

Cleanup writes to the effect's own dependency. This must not
cause an infinite retrigger loop.

#### #53 inner write: only final value observed

```
 S(a) ← E(eff)
```

Multiple synchronous writes to a signal. The effect must
ultimately observe the final written value.

#### #54 inner mutations propagate until changes settle

```
 S(a)  S(b) ← E(eff) ═→ S(b) when a>0 && b===0
```

Effect conditionally writes to b. The inner write must
propagate so that b settles to a's value.

#### #56 effect re-scheduled after reading from derived then writing

```
 S(a) → C(b) ← E(eff)
```

Effect reads from a computed derived from a. Writing to a
must re-schedule the effect through the computed chain.

#### #133 listener writes back: second listener skipped if no net change

```
 S(a) ← E(eff1) ═→ S(a) resets to 0 when a===1
 S(a) ← E(eff2)
```

First effect writes a back to 0. Second effect must see the
final settled value (0), not the intermediate value (1).

#### #134 listener writes back: second listener gets final value

```
 S(a) ← E(eff1) ═→ S(a) writes 10 when a===1
 S(a) ← E(eff2)
```

First effect changes a from 1 to 10. Second effect must
observe the final value (10).

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

Computed increments its own source each read. The returned
value and the signal must reflect the post-write state.

#### #57 computed side effect triggers downstream

```
 S(src) → C(c) ═→ S(sideEffect)
 S(sideEffect) ← E(eff)
```

Computed writes to a side-effect signal. An effect watching
that signal must observe the written value after c evaluates.

#### #182 computed side effect + batch: writes visible after flush

```
 batch { S(src).write → C(c) ═→ S(side) }
 S(side) ← E(eff)
```

Computed inner write happens inside a batch. After the batch
flushes, the side-effect signal and its effect must reflect
the written value.
Framework may forbid computed side effects (also valid).

#### #183 branch switch stops computed side effect

```
 S(flag) → C(branch) → C(writer) ═→ S(side)
                      → 999  [when flag is false]
```

When flag switches off, writer is no longer evaluated, so its
side-effect write must stop. Subsequent src changes must not
update side.
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

#### #224 effect sees fresh computed after sibling's mid-flush inner write

```
 S(a) ─→ E(e1) ═→ S(b) when a===1
 S(a) ─→ C(c) = a + b
 C(c) ─→ E(e2)
```

a.write(1) schedules both e1 and e2. e1's inner write to b
makes c stale mid-flush. e2 reads c — must observe the fresh
value (1 + 10 = 11) by the time the flush settles, not the
stale value (1 + 0 = 1). The assertion only checks the LAST
observation, tolerating frameworks that fire e2 multiple times
during the flush.

#### #225 mid-flush fan-in: e3 sees both sibling effects' inner writes

```
 S(a) ─→ E(e1) ═→ S(b1) when a===1
 S(a) ─→ E(e2) ═→ S(b2) when a===1
 S(b1), S(b2) ─→ C(c) = b1 + b2
 C(c) ─→ E(e3)
```

Two effects each inner-write a different signal during the
same flush. Both feed into a single computed read by a third
effect. The LAST value e3 observes must be 30 (b1=10 + b2=20),
not a partial state where only one inner write is reflected.
Like #224, only checks the final settled observation.


</details>


### Cycle & Infinite Loop Detection

Tests that a framework handles circular dependencies and runaway
effects without hanging or crashing: cycles are detected (throw or
graceful fallback), and iteration counts stay bounded.

```
Legend:
  S        signal (source)
  C        computed
  E / eff  effect
  ─→       dependency edge (downstream reads upstream)
  ↔ / ⟳   cyclic dependency
```

| Framework              | #61 | #63 | #153 | #64,#221,#223 |
| ---------------------- | --- | --- | ---- | ------------- |
| alien-signals          |   ✅ |   ✅ |    ✅ |             ✅ |
| @preact/signals-core   |   ✅ |   ✅ |    ✅ |             ✅ |
| @reactively/core       |   ✅ |   ✅ |    ✅ |             ❌ |
| tansu                  |   ✅ |   ✅ |    ✅ |             ✅ |
| signal-polyfill (TC39) |   ✅ |   ✅ |    ✅ |             ✅ |
| @vue/reactivity        |   ✅ |   ✅ |    ✅ |             ✅ |
| mobx                   |   ✅ |   ✅ |    ✅ |             ✅ |
| @reatom/core           |   ✅ |   ✅ |    ❌ |             ✅ |
| svelte                 |   ✅ |   ✅ |    ❌ |             ✅ |
| solid-js               |   ✅ |   ✅ |    ✅ |             ✅ |
| @solidjs/signals       |   ✅ |   ✅ |    ✅ |             ✅ |
| S.js                   |   ✅ |   ✅ |    ✅ |             ✅ |
| pota                   |   ✅ |   ❌ |    ✅ |             ✅ |
| @angular/core          |   ✅ |   ✅ |    ✅ |             ✅ |
| anod                   |   ✅ |   ✅ |    ✅ |             ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #63 cycle from modifying a branch (dynamic cycle creation)

```
 S(cond)  S(a)
    |      |
    E(eff)─┘
      |
      └─→ a.write(a.read()+1)  ⟳  (when cond=true)
```

Effect is safe when cond=false. Setting cond=true creates a
dynamic read-write cycle on a. Framework must detect it.

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
(e1 reads a, writes b; e2 reads b, writes a+1).
Framework must cap iterations instead of looping forever.

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

| Framework              | #66,#72 | #67,#125,#128 | #69 | #70 | #119,#124,#127 | #120 | #121..#122,... ×4 | #123 | #126 | #130 | #131 | #132 |
| ---------------------- | ------- | ------------- | --- | --- | -------------- | ---- | ----------------- | ---- | ---- | ---- | ---- | ---- |
| alien-signals          |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |       ⬜ |             ⬜ |   ⬜ |   ⬜ |              ⬜ |    ⬜ |                 ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |    ⬜ |
| tansu                  |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ⬜ |                 ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |       ⬜ |             ⬜ |   ⬜ |   ⬜ |              ⬜ |    ✅ |                 ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |
| @vue/reactivity        |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |
| mobx                   |       ✅ |             ✅ |   ✅ |   ❌ |              ✅ |    ⬜ |                 ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |
| @reatom/core           |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ✅ |                 ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |       ⬜ |             ⬜ |   ⬜ |   ⬜ |              ⬜ |    ❌ |                 ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |
| solid-js               |       ✅ |             ✅ |   ❌ |   ✅ |              ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |
| @solidjs/signals       |       ✅ |             ✅ |   ✅ |   ✅ |              ✅ |    ⬜ |                 ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ❌ |
| S.js                   |       ❌ |             ❌ |   ❌ |   ✅ |              ❌ |    ✅ |                 ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |
| pota                   |       ❌ |             ✅ |   ❌ |   ✅ |              ✅ |    ❌ |                 ❌ |    ✅ |    ✅ |    ❌ |    ❌ |    ❌ |
| @angular/core          |       ⬜ |             ⬜ |   ⬜ |   ⬜ |              ⬜ |    ✅ |                 ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |
| anod                   |       ✅ |             ❌ |   ❌ |   ✅ |              ✅ |    ✅ |                 ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |

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

#### #69 pending effects run even if batch callback throws

```
 S(a) → E(eff)
```

Batch callback throws after writing. Pending effects must still
run with the updated value despite the exception.

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

#### #120 cleanup writes inside effect are implicitly batched

```
 S(a) → E(eff1)  cleanup: b.write(a.read())
 S(b) → E(eff2)
```

When eff1's cleanup writes to b, that write is implicitly batched
so eff2 sees the final value in a single notification.

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

#### #127 unsubscribe inside batch: not called at end

```
 S(a) → E(eff) → dispose
```

batch { a.write(1); dispose() } — effect is disposed inside the
batch. It must NOT run when the batch completes.

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

#### #130 effect inner writes are implicitly batched

```
 S(a) → E(eff1)  writes: b.write(a+1), c.write(a+2)
 S(b) ─→ E(eff2)
 S(c) ─→ /
```

Writes inside an effect body are implicitly batched. eff2
sees both b and c updated in a single notification.

#### #131 derived-of-derived: source reverts in batch

```
 S(a) → C(c1) → C(c2) → E(eff)
 S(b) ────────→ /
```

batch { a.write(5); a.write(0); b.write(20) } — a reverts but b
changes. c2 = c1 + b must still update because b changed.

#### #132 batch: computed not recomputed if dep reverts

```
 S(a) → C(c) → E(eff)
```

batch { a.write(5); a.write(0) } — source reverts. Computed c
must NOT recompute at all (zero calls), not just produce the
same value.

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

| Framework              | #75,#156 | #76 | #117..#118 | #218 | #219 |
| ---------------------- | -------- | --- | ---------- | ---- | ---- |
| alien-signals          |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| @preact/signals-core   |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| @reactively/core       |        ⬜ |   ⬜ |          ⬜ |    ⬜ |    ⬜ |
| tansu                  |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |        ✅ |   ✅ |          ✅ |    ⬜ |    ⬜ |
| @vue/reactivity        |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| mobx                   |        ✅ |   ❌ |          ✅ |    ✅ |    ✅ |
| @reatom/core           |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| svelte                 |        ⬜ |   ⬜ |          ⬜ |    ⬜ |    ⬜ |
| solid-js               |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| @solidjs/signals       |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |
| S.js                   |        ✅ |   ✅ |          ✅ |    ✅ |    ❌ |
| pota                   |        ❌ |   ✅ |          ✅ |    ❌ |    ❌ |
| @angular/core          |        ✅ |   ✅ |          ✅ |    ⬜ |    ⬜ |
| anod                   |        ✅ |   ✅ |          ✅ |    ✅ |    ✅ |

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

| Framework              | #84,#91,#155 | #89..#90 | #92,#211,#93 | #154 | #177 |
| ---------------------- | ------------ | -------- | ------------ | ---- | ---- |
| alien-signals          |            ✅ |        ✅ |            ✅ |    ✅ |    ✅ |
| @preact/signals-core   |            ✅ |        ✅ |            ✅ |    ✅ |    ✅ |
| @reactively/core       |            ✅ |        ⬜ |            ✅ |    ⬜ |    ❌ |
| tansu                  |            ✅ |        ⬜ |            ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |            ✅ |        ✅ |            ✅ |    ⬜ |    ✅ |
| @vue/reactivity        |            ✅ |        ✅ |            ✅ |    ✅ |    ✅ |
| mobx                   |            ✅ |        ⬜ |            ✅ |    ✅ |    ✅ |
| @reatom/core           |            ✅ |        ✅ |            ✅ |    ✅ |    ✅ |
| svelte                 |            ✅ |        ✅ |            ✅ |    ⬜ |    ✅ |
| solid-js               |            ❌ |        ✅ |            ❌ |    ❌ |    ✅ |
| @solidjs/signals       |            ✅ |        ⬜ |            ✅ |    ✅ |    ❌ |
| S.js                   |            ❌ |        ✅ |            ❌ |    ❌ |    ✅ |
| pota                   |            ✅ |        ❌ |            ❌ |    ❌ |    ❌ |
| @angular/core          |            ✅ |        ✅ |            ✅ |    ⬜ |    ❌ |
| anod                   |            ✅ |        ✅ |            ✅ |    ❌ |    ✅ |

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

| Framework              | #94,... ×4 | #95 |
| ---------------------- | ---------- | --- |
| alien-signals          |          ✅ |   ✅ |
| @preact/signals-core   |          ✅ |   ✅ |
| @reactively/core       |          ✅ |   ✅ |
| tansu                  |          ✅ |   ✅ |
| signal-polyfill (TC39) |          ✅ |   ✅ |
| @vue/reactivity        |          ✅ |   ✅ |
| mobx                   |          ✅ |   ❌ |
| @reatom/core           |          ✅ |   ✅ |
| svelte                 |          ✅ |   ✅ |
| solid-js               |          ✅ |   ✅ |
| @solidjs/signals       |          ✅ |   ✅ |
| S.js                   |          ✅ |   ✅ |
| pota                   |          ✅ |   ✅ |
| @angular/core          |          ✅ |   ✅ |
| anod                   |          ✅ |   ✅ |

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

| Framework              | #99 | #160..#161,#215 |
| ---------------------- | --- | --------------- |
| alien-signals          |   ✅ |               ✅ |
| @preact/signals-core   |   ✅ |               ✅ |
| @reactively/core       |   ✅ |               ✅ |
| tansu                  |   ✅ |               ✅ |
| signal-polyfill (TC39) |   ✅ |               ✅ |
| @vue/reactivity        |   ✅ |               ✅ |
| mobx                   |   ✅ |               ✅ |
| @reatom/core           |   ✅ |               ✅ |
| svelte                 |   ✅ |               ✅ |
| solid-js               |   ✅ |               ✅ |
| @solidjs/signals       |   ✅ |               ✅ |
| S.js                   |   ✅ |               ✅ |
| pota                   |   ✅ |               ❌ |
| @angular/core          |   ✅ |               ✅ |
| anod                   |   ✅ |               ✅ |

<details>
<summary>Tests with failures or skips</summary>

#### #160 consumer links cleaned after losing all listeners

```
 S(a) ─→ C(b) ─→ E(eff1)
              ─→ E(eff2)
      dispose both
 S(a) ─→ C(b)   (no listeners, links cleaned)
```

After disposing both effects, writes to S(a) must not
trigger the disposed callbacks. The computed C(b) should
still be readable on demand.

#### #161 multi-level computed cleanup after all listeners removed

```
 S(a) ─→ C(b) ─→ C(c) ─→ C(d) ─→ E(eff)
                                 dispose()
 S(a) ─→ C(b) ─→ C(c) ─→ C(d)   (no listener)
```

Disposing the sole effect at the end of a multi-level
computed chain must clean up all intermediate subscription
links so that writes to S(a) no longer propagate.
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

| Framework              | #17   | #15                | #146             | #29,#167  | #30        | #176         | #173       | #174       | #88              | #106        | #86,#107      | #49                  | #62                | #175               | #244       |
| ---------------------- | ----- | ------------------ | ---------------- | --------- | ---------- | ------------ | ---------- | ---------- | ---------------- | ----------- | ------------- | -------------------- | ------------------ | ------------------ | ---------- |
| alien-signals          | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | returns stale | runs 1x per write    | no throw           | unbatched (2 runs) | LIFO       |
| @preact/signals-core   | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | cycle detected     | batched            | no cascade |
| @reactively/core       | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | throws     | throws     | keeps subscribed | halts flush | re-evaluates  | runs 2x per write    | manual bail (200+) | error              | ⬜          |
| tansu                  | lazy  | no subscription    | single recompute | Object.is | propagates | returns void | post-write | post-write | keeps subscribed | continues   | caches error  | runs 2x per write    | manual bail (200+) | batched            | ⬜          |
| signal-polyfill (TC39) | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | continues   | caches error  | runs 1x, then blocks | no throw           | unbatched (2 runs) | no cascade |
| @vue/reactivity        | lazy  | no subscription    | single recompute | Object.is | skips      | returns void | post-write | post-write | keeps subscribed | continues   | returns stale | runs 1x per write    | no throw           | unbatched (2 runs) | no cascade |
| mobx                   | lazy  | no subscription    | single recompute | ===       | propagates | returns void | post-write | post-write | keeps subscribed | continues   | re-evaluates  | runs 2x per write    | no throw           | batched            | ⬜          |
| @reatom/core           | lazy  | no subscription    | single recompute | Object.is | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | cycle detected     | batched            | FIFO       |
| svelte                 | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | post-write | throws     | unsubscribes     | halts flush | re-evaluates  | runs 2x per write    | cycle detected     | batched            | no cascade |
| solid-js               | eager | subscribes eagerly | 2 recomputes     | ===       | skips      | returns void | post-write | post-write | unsubscribes     | halts flush | error         | runs 2x per write    | manual bail (200+) | batched            | no cascade |
| @solidjs/signals       | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | caches error  | runs 1x, then blocks | no throw           | batched            | ⬜          |
| S.js                   | eager | subscribes eagerly | 2 recomputes     | ===       | propagates | returns void | post-write | throws     | keeps subscribed | halts flush | error         | runs 2x per write    | manual bail (200+) | batched            | no cascade |
| pota                   | lazy  | no subscription    | 2 recomputes     | ===       | skips      | returns void | unknown    | unknown    | error            | error       | re-evaluates  | no re-run            | error              | batched            | no cascade |
| @angular/core          | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | halts flush | caches error  | runs 2x per write    | manual bail (200+) | unbatched (2 runs) | no cascade |
| anod                   | eager | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | manual bail (200+) | batched            | LIFO       |

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
feedback loop. Checks how the framework handles the
re-entry: number of re-runs per write and whether
subsequent writes are blocked.

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

#### #244 sibling cleanup order on dispose

 E_outer{ E_inner1, E_inner2, E_inner3 } → dispose

Probes the cleanup order of sibling effects when their owner
disposes. Frameworks with parent-child cascade tend to use
either LIFO (reverse creation) or FIFO (creation order). A
flat-effect framework (no cascade) reports "no cascade".


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
import { expect } from "vitest";

// Optional: swap the built-in expect for your runner's
// for richer error messages and tighter integration.
setExpect(expect);

for (const { section, cases } of testSuite) {
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
