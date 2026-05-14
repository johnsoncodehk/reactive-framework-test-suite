# Reactive Framework Test Suite

Cross-library test suite for comparing reactive signal behavior across **15 frameworks** with **198 test cases**.

> 2440 passed, 295 failed, 235 skipped out of 2970 total runs

Test cases are collected and adapted from the test suites of all participating frameworks — thanks to every project for their thorough testing work. This suite focuses on **reactive semantics** (propagation, batching, disposal, edge cases), not API completeness. Tests that require an optional capability (e.g. `batch`) are skipped (⬜) for frameworks that don't expose it, rather than marked as failures.

- ✅ Pass — correct behavior
- ❌ Fail — incorrect behavior or crash
- ⬜ Skip — required API not available

The **Behavioral Differences** section is separate — those tests reflect design choices (e.g. `Object.is` vs `===` equality, whether effects re-run, immediate vs deferred inner writes) where different answers are all valid.

## Frameworks

| Framework | Package | Version | Published |
|-----------|---------|---------|-----------|
| alien-signals | `alien-signals` | 3.2.0 | 2026-05-12 |
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
| @angular/core | `@angular/core` | 20.3.20 | 2026-05-06 |
| anod | `anod` | 0.9.1 | 2026-04-27 |
| r3 | `github:milomg/r3` | 0.0.1 | github |

## Summary

| Framework              | Pass | Fail | Skip | Total |
| ---------------------- | ---- | ---- | ---- | ----- |
| alien-signals          |  198 |    0 |    0 |   198 |
| @reatom/core           |  197 |    1 |    0 |   198 |
| @preact/signals-core   |  196 |    2 |    0 |   198 |
| @vue/reactivity        |  190 |    8 |    0 |   198 |
| anod                   |  184 |   14 |    0 |   198 |
| tansu                  |  181 |    4 |   13 |   198 |
| @solidjs/signals       |  175 |   10 |   13 |   198 |
| solid-js               |  170 |   28 |    0 |   198 |
| mobx                   |  166 |   19 |   13 |   198 |
| signal-polyfill (TC39) |  160 |    8 |   30 |   198 |
| @angular/core          |  158 |   10 |   30 |   198 |
| svelte                 |  147 |   13 |   38 |   198 |
| S.js                   |  146 |   52 |    0 |   198 |
| @reactively/core       |  130 |   17 |   51 |   198 |
| r3                     |   42 |  109 |   47 |   198 |

## Results

### Graph Propagation

| Framework              | #1 | #2..#4,... x5 | #7 | #8,#9,... x6 | #187 | #188 | #189 | #190..#191 | #192 | #204 | #205 | #206..#208 |
| ---------------------- | -- | ------------- | -- | ------------ | ---- | ---- | ---- | ---------- | ---- | ---- | ---- | ---------- |
| alien-signals          |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| @preact/signals-core   |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| @reactively/core       |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |
| tansu                  |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| signal-polyfill (TC39) |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |
| @vue/reactivity        |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| mobx                   |  ✅ |             ✅ |  ❌ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| @reatom/core           |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| svelte                 |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |
| solid-js               |  ✅ |             ✅ |  ✅ |            ✅ |    ❌ |    ❌ |    ❌ |          ✅ |    ✅ |    ✅ |    ❌ |          ✅ |
| @solidjs/signals       |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| S.js                   |  ✅ |             ✅ |  ❌ |            ✅ |    ❌ |    ❌ |    ❌ |          ✅ |    ❌ |    ✅ |    ❌ |          ✅ |
| @angular/core          |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |    ✅ |    ⬜ |    ✅ |          ✅ |
| anod                   |  ✅ |             ✅ |  ✅ |            ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |
| r3                     |  ✅ |             ❌ |  ❌ |            ❌ |    ❌ |    ⬜ |    ✅ |          ❌ |    ❌ |    ⬜ |    ❌ |          ❌ |

### Dynamic Dependencies

| Framework              | #12..#13 | #14,#16,... x4 | #193 | #194..#196 | #197 | #198..#199 | #200 |
| ---------------------- | -------- | -------------- | ---- | ---------- | ---- | ---------- | ---- |
| alien-signals          |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| @preact/signals-core   |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| @reactively/core       |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ❌ |
| tansu                  |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| signal-polyfill (TC39) |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| @vue/reactivity        |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| mobx                   |        ❌ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| @reatom/core           |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| svelte                 |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| solid-js               |        ✅ |              ✅ |    ❌ |          ✅ |    ✅ |          ✅ |    ✅ |
| @solidjs/signals       |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| S.js                   |        ✅ |              ✅ |    ❌ |          ✅ |    ❌ |          ✅ |    ✅ |
| @angular/core          |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| anod                   |        ✅ |              ✅ |    ✅ |          ✅ |    ✅ |          ✅ |    ✅ |
| r3                     |        ❌ |              ❌ |    ❌ |          ❌ |    ❌ |          ❌ |    ❌ |

### Computed Evaluation

| Framework              | #18 | #19..#21,... x5 | #24 | #25 | #26,#145 | #147 | #148 | #149 | #115 | #27 |
| ---------------------- | --- | --------------- | --- | --- | -------- | ---- | ---- | ---- | ---- | --- |
| alien-signals          |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |   ✅ |
| tansu                  |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |   ✅ |
| @vue/reactivity        |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ✅ |    ✅ |    ✅ |   ✅ |
| mobx                   |   ❌ |               ✅ |   ✅ |   ❌ |        ✅ |    ❌ |    ❌ |    ✅ |    ✅ |   ❌ |
| @reatom/core           |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |   ✅ |
| solid-js               |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ✅ |    ✅ |    ✅ |   ✅ |
| @solidjs/signals       |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ✅ |    ✅ |    ✅ |   ✅ |
| S.js                   |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ❌ |    ✅ |    ✅ |   ❌ |
| @angular/core          |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ⬜ |    ✅ |   ✅ |
| anod                   |   ✅ |               ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ✅ |    ✅ |    ✅ |   ✅ |
| r3                     |   ❌ |               ❌ |   ✅ |   ❌ |        ❌ |    ⬜ |    ❌ |    ⬜ |    ✅ |   ❌ |

### Equality & Same-Value Optimization

| Framework              | #28,#32,#34 | #169 |
| ---------------------- | ----------- | ---- |
| alien-signals          |           ✅ |    ✅ |
| @preact/signals-core   |           ✅ |    ✅ |
| @reactively/core       |           ✅ |    ✅ |
| tansu                  |           ✅ |    ✅ |
| signal-polyfill (TC39) |           ✅ |    ✅ |
| @vue/reactivity        |           ✅ |    ✅ |
| mobx                   |           ❌ |    ✅ |
| @reatom/core           |           ✅ |    ✅ |
| svelte                 |           ✅ |    ✅ |
| solid-js               |           ✅ |    ✅ |
| @solidjs/signals       |           ✅ |    ✅ |
| S.js                   |           ❌ |    ❌ |
| @angular/core          |           ✅ |    ✅ |
| anod                   |           ✅ |    ✅ |
| r3                     |           ❌ |    ❌ |

### Effect Lifecycle

| Framework              | #35..#37 | #38..#39 | #40 | #42 | #108 | #109..#110 | #111 | #140 | #141 | #142..#143 | #144 | #178 | #178 | #201 | #202 | #203 | #41 |
| ---------------------- | -------- | -------- | --- | --- | ---- | ---------- | ---- | ---- | ---- | ---------- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| alien-signals          |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |        ✅ |        ⬜ |   ⬜ |   ⬜ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ✅ |          ✅ |    ⬜ |    ⬜ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| tansu                  |        ✅ |        ⬜ |   ⬜ |   ✅ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ✅ |          ✅ |    ⬜ |    ⬜ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |        ✅ |        ✅ |   ❌ |   ⬜ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ❌ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| @vue/reactivity        |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ❌ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| mobx                   |        ✅ |        ⬜ |   ⬜ |   ✅ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ✅ |          ✅ |    ⬜ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reatom/core           |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |        ✅ |        ✅ |   ✅ |   ⬜ |    ✅ |          ✅ |    ❌ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |
| solid-js               |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ❌ |    ✅ |    ❌ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @solidjs/signals       |        ✅ |        ⬜ |   ⬜ |   ✅ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ✅ |          ✅ |    ⬜ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| S.js                   |        ✅ |        ✅ |   ❌ |   ❌ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| @angular/core          |        ✅ |        ✅ |   ❌ |   ⬜ |    ✅ |          ✅ |    ❌ |    ✅ |    ✅ |          ✅ |    ✅ |    ❌ |    ✅ |    ❌ |    ❌ |    ✅ |   ✅ |
| anod                   |        ✅ |        ✅ |   ✅ |   ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |   ✅ |
| r3                     |        ❌ |        ❌ |   ❌ |   ⬜ |    ❌ |          ❌ |    ❌ |    ❌ |    ❌ |          ❌ |    ✅ |    ✅ |    ❌ |    ❌ |    ❌ |    ✅ |   ❌ |

### Nested Effects & Ordering

| Framework              | #43 | #44 | #45 | #46 | #47 | #163 | #164 | #170 | #209..#210 | #48 |
| ---------------------- | --- | --- | --- | --- | --- | ---- | ---- | ---- | ---------- | --- |
| alien-signals          |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ✅ |   ✅ |
| @preact/signals-core   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| @reactively/core       |   ❌ |   ❌ |   ⬜ |   ✅ |   ✅ |    ❌ |    ❌ |    ❌ |          ❌ |   ❌ |
| tansu                  |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| signal-polyfill (TC39) |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| @vue/reactivity        |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| mobx                   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| @reatom/core           |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ✅ |   ✅ |
| svelte                 |   ✅ |   ✅ |   ⬜ |   ✅ |   ❌ |    ❌ |    ✅ |    ✅ |          ❌ |   ✅ |
| solid-js               |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| @solidjs/signals       |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ✅ |   ✅ |
| S.js                   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ❌ |          ❌ |   ✅ |
| @angular/core          |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ❌ |   ✅ |
| anod                   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |          ✅ |   ✅ |
| r3                     |   ❌ |   ✅ |   ⬜ |   ❌ |   ❌ |    ❌ |    ❌ |    ❌ |          ✅ |   ❌ |

### Inner Write

| Framework              | #50 | #51 | #52 | #53 | #54 | #55 | #56 | #112,#114 | #133 | #134..#136 | #137..#138 | #139 | #172 | #180 | #179 | #113 | #57 | #181 | #182 | #183 | #184 | #185 | #186 | #213 | #212 |
| ---------------------- | --- | --- | --- | --- | --- | --- | --- | --------- | ---- | ---------- | ---------- | ---- | ---- | ---- | ---- | ---- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| alien-signals          |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |   ❌ |   ⬜ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| tansu                  |   ✅ |   ⬜ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |
| @vue/reactivity        |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| mobx                   |   ✅ |   ⬜ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |   ✅ |   ✅ |   ✅ |   ✅ |   ❌ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ✅ |   ❌ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| solid-js               |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |
| @solidjs/signals       |   ✅ |   ⬜ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |
| S.js                   |   ✅ |   ❌ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ❌ |    ❌ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |
| @angular/core          |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ❌ |    ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| anod                   |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |         ✅ |    ✅ |          ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |   ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| r3                     |   ✅ |   ❌ |   ✅ |   ❌ |   ✅ |   ✅ |   ❌ |         ✅ |    ❌ |          ✅ |          ❌ |    ❌ |    ✅ |    ❌ |    ❌ |    ✅ |   ❌ |    ✅ |    ⬜ |    ❌ |    ✅ |    ⬜ |    ✅ |    ❌ |    ❌ |

### Cycle & Infinite Loop Detection

| Framework              | #58,#59,... x5 | #150 | #151 | #152 | #153 | #64 |
| ---------------------- | -------------- | ---- | ---- | ---- | ---- | --- |
| alien-signals          |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |              ✅ |    ✅ |    ⬜ |    ✅ |    ✅ |   ❌ |
| tansu                  |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @vue/reactivity        |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| mobx                   |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reatom/core           |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |              ✅ |    ✅ |    ⬜ |    ✅ |    ❌ |   ✅ |
| solid-js               |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @solidjs/signals       |              ✅ |    ❌ |    ✅ |    ❌ |    ✅ |   ✅ |
| S.js                   |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @angular/core          |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| anod                   |              ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| r3                     |              ✅ |    ✅ |    ⬜ |    ✅ |    ❌ |   ✅ |

### Batching / Transaction

| Framework              | #65..#66 | #67..#68 | #69 | #70 | #71 | #72 | #73 | #119 | #120 | #121..#122 | #123 | #124 | #125 | #126 | #127 | #128 | #129 | #130 | #131 | #132 | #74 |
| ---------------------- | -------- | -------- | --- | --- | --- | --- | --- | ---- | ---- | ---------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | --- |
| alien-signals          |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |        ⬜ |        ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |    ⬜ |    ⬜ |          ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |    ⬜ |   ⬜ |
| tansu                  |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ⬜ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |        ⬜ |        ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |    ⬜ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |   ⬜ |
| @vue/reactivity        |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ❌ |    ✅ |    ✅ |          ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |   ✅ |
| mobx                   |        ✅ |        ✅ |   ✅ |   ❌ |   ✅ |   ✅ |   ❌ |    ✅ |    ⬜ |          ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |   ✅ |
| @reatom/core           |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |        ⬜ |        ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |    ⬜ |    ❌ |          ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |   ⬜ |
| solid-js               |        ✅ |        ✅ |   ❌ |   ✅ |   ✅ |   ✅ |   ❌ |    ✅ |    ✅ |          ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |   ✅ |
| @solidjs/signals       |        ✅ |        ✅ |   ✅ |   ✅ |   ✅ |   ✅ |   ❌ |    ✅ |    ⬜ |          ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |   ✅ |
| S.js                   |        ❌ |        ❌ |   ❌ |   ✅ |   ✅ |   ❌ |   ❌ |    ❌ |    ✅ |          ✅ |    ❌ |    ❌ |    ❌ |    ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |   ✅ |
| @angular/core          |        ⬜ |        ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |    ⬜ |    ✅ |          ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |   ⬜ |
| anod                   |        ✅ |        ❌ |   ❌ |   ✅ |   ✅ |   ✅ |   ❌ |    ✅ |    ✅ |          ✅ |    ❌ |    ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |   ✅ |
| r3                     |        ⬜ |        ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |   ⬜ |    ⬜ |    ❌ |          ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ⬜ |    ❌ |    ⬜ |    ⬜ |   ⬜ |

### Untracked / Unsampled Reads

| Framework              | #75 | #76 | #117,#118,... x4 |
| ---------------------- | --- | --- | ---------------- |
| alien-signals          |   ✅ |   ✅ |                ✅ |
| @preact/signals-core   |   ✅ |   ✅ |                ✅ |
| @reactively/core       |   ⬜ |   ⬜ |                ⬜ |
| tansu                  |   ✅ |   ✅ |                ✅ |
| signal-polyfill (TC39) |   ✅ |   ✅ |                ✅ |
| @vue/reactivity        |   ✅ |   ✅ |                ✅ |
| mobx                   |   ✅ |   ❌ |                ✅ |
| @reatom/core           |   ✅ |   ✅ |                ✅ |
| svelte                 |   ⬜ |   ⬜ |                ⬜ |
| solid-js               |   ✅ |   ✅ |                ✅ |
| @solidjs/signals       |   ✅ |   ✅ |                ✅ |
| S.js                   |   ✅ |   ✅ |                ✅ |
| @angular/core          |   ✅ |   ✅ |                ✅ |
| anod                   |   ✅ |   ✅ |                ✅ |
| r3                     |   ⬜ |   ⬜ |                ⬜ |

### Error Handling

| Framework              | #84,#85,#87 | #89 | #90 | #91..#92 | #154 | #155 | #177 | #211,#93 |
| ---------------------- | ----------- | --- | --- | -------- | ---- | ---- | ---- | -------- |
| alien-signals          |           ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| @preact/signals-core   |           ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| @reactively/core       |           ✅ |   ⬜ |   ⬜ |        ✅ |    ⬜ |    ✅ |    ❌ |        ✅ |
| tansu                  |           ✅ |   ⬜ |   ⬜ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| signal-polyfill (TC39) |           ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ✅ |        ✅ |
| @vue/reactivity        |           ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| mobx                   |           ✅ |   ⬜ |   ⬜ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| @reatom/core           |           ✅ |   ✅ |   ✅ |        ✅ |    ✅ |    ✅ |    ✅ |        ✅ |
| svelte                 |           ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ✅ |        ✅ |
| solid-js               |           ❌ |   ✅ |   ✅ |        ❌ |    ❌ |    ❌ |    ✅ |        ❌ |
| @solidjs/signals       |           ✅ |   ⬜ |   ⬜ |        ✅ |    ✅ |    ✅ |    ❌ |        ✅ |
| S.js                   |           ❌ |   ✅ |   ✅ |        ❌ |    ❌ |    ❌ |    ✅ |        ❌ |
| @angular/core          |           ✅ |   ✅ |   ✅ |        ✅ |    ⬜ |    ✅ |    ❌ |        ✅ |
| anod                   |           ✅ |   ✅ |   ✅ |        ✅ |    ❌ |    ✅ |    ✅ |        ✅ |
| r3                     |           ⬜ |   ❌ |   ✅ |        ⬜ |    ⬜ |    ⬜ |    ❌ |        ⬜ |

### Stale Evaluation Order

| Framework              | #94 | #95 | #96,#158,... x4 |
| ---------------------- | --- | --- | --------------- |
| alien-signals          |   ✅ |   ✅ |               ✅ |
| @preact/signals-core   |   ✅ |   ✅ |               ✅ |
| @reactively/core       |   ✅ |   ✅ |               ✅ |
| tansu                  |   ✅ |   ✅ |               ✅ |
| signal-polyfill (TC39) |   ✅ |   ✅ |               ✅ |
| @vue/reactivity        |   ✅ |   ✅ |               ✅ |
| mobx                   |   ✅ |   ❌ |               ✅ |
| @reatom/core           |   ✅ |   ✅ |               ✅ |
| svelte                 |   ✅ |   ✅ |               ✅ |
| solid-js               |   ✅ |   ✅ |               ✅ |
| @solidjs/signals       |   ✅ |   ✅ |               ✅ |
| S.js                   |   ✅ |   ✅ |               ✅ |
| @angular/core          |   ✅ |   ✅ |               ✅ |
| anod                   |   ✅ |   ✅ |               ✅ |
| r3                     |   ❌ |   ❌ |               ❌ |

### Memory & GC

| Framework              | #98,#99,... x5 |
| ---------------------- | -------------- |
| alien-signals          |              ✅ |
| @preact/signals-core   |              ✅ |
| @reactively/core       |              ✅ |
| tansu                  |              ✅ |
| signal-polyfill (TC39) |              ✅ |
| @vue/reactivity        |              ✅ |
| mobx                   |              ✅ |
| @reatom/core           |              ✅ |
| svelte                 |              ✅ |
| solid-js               |              ✅ |
| @solidjs/signals       |              ✅ |
| S.js                   |              ✅ |
| @angular/core          |              ✅ |
| anod                   |              ✅ |
| r3                     |              ❌ |

### Behavioral Differences

> Tests in this section reflect **design choice differences** between frameworks, not correctness issues. Different behaviors are all valid — for example, whether to use `Object.is` or `===` for equality, or whether inner writes are visible immediately within the same effect run.

| Framework              | #17   | #15                | #146             | #29,#167  | #30        | #176         | #173       | #174       | #88              | #106        | #86,#107      | #49                  | #62                | #175               |
| ---------------------- | ----- | ------------------ | ---------------- | --------- | ---------- | ------------ | ---------- | ---------- | ---------------- | ----------- | ------------- | -------------------- | ------------------ | ------------------ |
| alien-signals          |  lazy |    no subscription | single recompute |       === |      skips | returns void | post-write | post-write | keeps subscribed | halts flush | returns stale |    runs 1x per write |           no throw | unbatched (2 runs) |
| @preact/signals-core   |  lazy |    no subscription | single recompute |       === |      skips | returns void | post-write | post-write |     unsubscribes |   continues |  caches error |    runs 2x per write |     cycle detected |            batched |
| @reactively/core       |  lazy |    no subscription | single recompute |       === |      skips |            ⬜ |     throws |     throws | keeps subscribed | halts flush |  re-evaluates |    runs 2x per write | manual bail (200+) |              error |
| tansu                  |  lazy |    no subscription | single recompute | Object.is | propagates | returns void | post-write | post-write | keeps subscribed |   continues |  caches error |    runs 2x per write | manual bail (200+) |            batched |
| signal-polyfill (TC39) |  lazy |    no subscription | single recompute | Object.is |      skips |            ⬜ | post-write | post-write | keeps subscribed |   continues |  caches error | runs 1x, then blocks |           no throw | unbatched (2 runs) |
| @vue/reactivity        |  lazy |    no subscription | single recompute | Object.is |      skips | returns void | post-write | post-write | keeps subscribed |   continues | returns stale |    runs 1x per write |           no throw | unbatched (2 runs) |
| mobx                   |  lazy |    no subscription | single recompute |       === | propagates | returns void | post-write | post-write | keeps subscribed |   continues |  re-evaluates |    runs 2x per write |           no throw |            batched |
| @reatom/core           |  lazy |    no subscription | single recompute | Object.is |      skips | returns void | post-write | post-write |     unsubscribes |   continues |  caches error |    runs 2x per write |     cycle detected |            batched |
| svelte                 |  lazy |    no subscription | single recompute |       === |      skips |            ⬜ | post-write |     throws |     unsubscribes | halts flush |  re-evaluates |    runs 2x per write |     cycle detected |            batched |
| solid-js               | eager | subscribes eagerly |     2 recomputes |       === |      skips | returns void | post-write | post-write |     unsubscribes | halts flush |         error |    runs 2x per write | manual bail (200+) |            batched |
| @solidjs/signals       |  lazy |    no subscription | single recompute |       === |      skips | returns void | post-write | post-write | keeps subscribed | halts flush |  caches error | runs 1x, then blocks |           no throw |            batched |
| S.js                   | eager | subscribes eagerly |     2 recomputes |       === | propagates | returns void | post-write |     throws | keeps subscribed | halts flush |         error |    runs 2x per write | manual bail (200+) |            batched |
| @angular/core          |  lazy |    no subscription | single recompute | Object.is |      skips |            ⬜ | post-write | post-write | keeps subscribed | halts flush |  caches error |    runs 2x per write | manual bail (200+) | unbatched (2 runs) |
| anod                   | eager |    no subscription | single recompute |       === |      skips | returns void | post-write | post-write |     unsubscribes |   continues |  caches error |    runs 2x per write | manual bail (200+) |            batched |
| r3                     |  lazy |              error |            error |     error |      error |            ⬜ |     throws |     throws |     unsubscribes | halts flush | returns stale |            no re-run |           no throw |              error |


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
  signal(initialValue) { /* ... */ },
  computed(fn) { /* ... */ },
  effect(fn) { /* ... return dispose */ },
  run(fn) { /* ... */ },
  // Optional:
  name: "my-framework",
  batch(fn) { /* ... */ },
  untracked(fn) { /* ... */ },
};
```

Capabilities like `effectCleanup` and `computedThrows` are auto-detected — call `detectCapabilities(myFramework)` once before running tests.

Wire it up with your test runner (vitest, jest, mocha, etc.):

```ts
import { testSuite, SkipTest, detectCapabilities } from "reactive-framework-test-suite";

detectCapabilities(myFramework);

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

