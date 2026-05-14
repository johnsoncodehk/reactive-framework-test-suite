# Coverage Matrix

Systematic audit of reactive primitive interactions in the test suite,
identifying combinations that aren't covered.

## Method

Cross every "inner action" (read/write/create/dispose) with every
"outer context" (effect body, effect cleanup, computed getter, scope
body, batch, untracked). Each cell lists representative existing
tests; empty cells are gaps.

## Matrix

| Inner ↓ / Outer → | effect.body | effect.cleanup | computed.getter | scope.body | batch | untracked |
|---|---|---|---|---|---|---|
| **read signal** | #36 | #40 (untracked) | #19 | (implicit) | #67 | #75 |
| **write signal** | #50 | #51, #120 | #52 | — | #65-#74 family | #156 |
| **read computed** | (implicit) | — | #22 chain | (implicit) | #68, #128 | #117, #118 |
| **create signal** | — | — | #115 | — | — | — |
| **create computed** | — | — | (computed in computed) | — | — | — |
| **create effect** | #43-#48, #163-#170, #209-#210, #226-#228 | #222 | — (just added in alien-signals PR #116, not in matrix yet) | new effectScope.spec.ts in alien-signals | #70, #126 | #45 |
| **create scope** | — | — | — | — | — | — |
| **dispose effect** | #108, #141 self-dispose | #111 | — | (cascading) | #42, #124, #127 | — |
| **enter batch** | #130 implicit | #120 implicit | — | — | #66 nested | — (#218, #219 nearby) |
| **enter untracked** | #75, #118 | #40 | #76, #117 | — | (#218, #219) | (nested, trivial) |
| **throw** | #84, #87, #89 | #90 | #84, #85 | — | #69, #121, #154 | — |

## Identified Gaps

### High-value gaps (likely to expose real differences)

1. **Cleanup writes signal in batch** — `effect(() => { batch(() => { sig.write(...) }); return cleanup that triggers another effect })`. Tests whether cleanup interacts correctly with batch flush boundary.

2. **Cleanup reads computed** — `effect(() => { c.read(); return () => { c.read() } })`. Verifies cleanup gets fresh computed value, not stale.

3. **Untracked inside cleanup** — `effect(() => { sig; return () => untracked(() => otherSig.read()) })`. Untracked in cleanup is already non-tracking (#40), but explicit untracked inside might behave differently.

4. **Effect created inside cleanup tracks deps** — already added as #222 but only verified inner runs once. Doesn't check whether new effect's own cleanup runs on subsequent disposal.

5. **Computed used during effect cleanup re-evaluates correctly** — if computed's source changes after effect re-runs but before cleanup of previous run, cleanup sees stale or fresh value?

6. **Dispose effect inside computed getter** — `computed(() => { dispose_other_effect(); ... })`. Side effect during pull-based eval.

### Medium-value gaps

7. **EffectScope created inside effect.body, disposed via parent re-run** — does scope's own children cleanup correctly when parent re-runs and "garbage-collects" the old scope via purgeDeps?

8. **EffectScope dispose inside batch** — `batch(() => { scopeDispose() })`. Does the batched flush still happen correctly afterwards?

9. **Throw in scope body during setup** — `effectScope(() => { effect(() => {}); throw new Error() })`. Graph state after.

10. **Nested batch + nested effect** — `effect(() => { batch(() => { sig.write(...) }) })`. Multiple writes in a single body, batched, into an effect that triggers more effects.

11. **Untracked dispose** — `untracked(() => disposeEffect())`. Trivial but never tested.

12. **Cycle through effect cleanup** — effect's cleanup writes a signal that re-triggers itself.

13. **Computed reading itself transitively** — `c1 = computed(() => c2.read())`, `c2 = computed(() => c1.read())`. Already partially in #150/#151/#152/#153 but those are tautological — recently flagged.

### Low-value (edge / unlikely to find real bugs)

14. **Untracked inside untracked** — semantically same as one level
15. **Batch inside batch inside batch** — nested past 2 levels
16. **Signal write inside untracked inside computed** — covered by composition
17. **Computed read inside untracked inside effect body** — covered by #75/#117

## Test Proposal Summary

Of the 13 high+medium gaps, the ones I'd recommend adding as cross-framework tests:

| Priority | Test name (proposed) | Likely to differ across frameworks? |
|---|---|---|
| H | #229 cleanup reads computed returns fresh value | Yes — staleness handling varies |
| H | #230 cleanup writes signal inside batch | Yes — batch + cleanup ordering varies |
| H | #231 untracked inside cleanup | Maybe — implementations differ |
| H | ~~#232 effect created inside cleanup is disposed when outer disposes~~ | (Dropped — result vector identical to #222) |
| H | #233 computed re-eval during cleanup of effect | Maybe — reframed as cleanup write→read of dependent computed |
| H | ~~#234 dispose effect from inside computed getter~~ | (Dropped — covered by #201; reframed sibling-dispose version had identical result vector to #39/#110) |
| M | #235 batch inside effect body coalesces writes | Yes — only 4 frameworks pass |
| M | #236 cleanup write to own dep (bounded recursion) | Maybe — only angular fails |
| M | scope-related tests (#235/#236/#237 in original list) | — Out of scope (suite has no `effectScope` in framework interface) |
| L | untracked dispose | No — trivial, skipped |

## Implementation Result

| Test | Added | Discriminates |
|---|---|---|
| #229 cleanup reads computed | ✅ | svelte/pota fail |
| #230 cleanup writes signal in batch | ✅ | S.js/pota fail |
| #231 untracked inside cleanup | ✅ | only pota fails |
| #232 (original) cleanup-created lifecycle | ❌ dropped | (would group with #222) |
| #233 cleanup write→read dependent computed | ✅ | anod/S.js/pota fail |
| #234 (original) cleanup disposes sibling | ❌ dropped | (would group with #39/#110) |
| #235 batch inside effect body | ✅ | preact/tansu/mobx/solid/S.js/anod fail |
| #236 cleanup write to own dep (cycle) | ✅ | only angular fails |

## Round 2: cleanup ordering (translated from alien-signals PR #116)

A second audit covered cleanup *ordering* (not just whether cleanup
runs). Original PR draft added 7 strict tests asserting alien-signals's
exact model; they were relaxed after discovering that many frameworks
have a different but valid model (flat-effect, FIFO siblings, etc).

### Gap
Existing suite had no coverage of cleanup ordering contracts:
inner-before-outer, sibling LIFO/FIFO, depth-first reverse on
multi-level nesting, ordering on re-run vs dispose, cleanup ordering
after a prior inner-only re-run.

### Implementation Result

| Test | Status | Notes |
|---|---|---|
| #237 cleanup ordering on outer re-run | ✅ relaxed to invariants | pota/angular/anod fail (real bugs) |
| #238 cleanup ordering on dispose | ✅ relaxed | anod fails (real bug) |
| #239 (original) sibling LIFO on dispose | ❌ moved to #244 probe | sibling order is model choice, not invariant |
| #240 (original) sibling LIFO on re-run | ❌ moved to #244 probe | same as #239 |
| #241 three-level cleanup depth-first | ✅ relaxed | most frameworks pass |
| #242 effect in computed: old cleanup before new eval | ✅ relaxed | grouped with #39/#110 |
| #243 cleanup ordering after prior inner-only re-run | ✅ relaxed | pota/angular/anod fail (real bugs) |
| #244 sibling cleanup order probe (behavioral) | ✅ added | Returns "LIFO" / "FIFO" / "no cascade" |
| computed unwatched LIFO (from PR #116) | ❌ dropped | auto-disposal of unobserved computeds not shared across frameworks |

### Key insight
Strict equality assertions over-constrained tests to one framework's
model. Cleanup ordering has both:
- **Universal invariants** (outer:cleanup before outer:run; inner before
  outer if cascaded) → assert in main suite
- **Model choices** (LIFO vs FIFO siblings; cascade vs flat) → report
  as descriptive strings in `behaviorDifferences.ts`

#244 probe summarizes each framework's choice:
- **LIFO**: alien-signals, anod
- **FIFO**: reatom
- **no cascade** (flat-effect model): preact, vue, svelte, solid,
  S.js, signal-polyfill, angular, pota

