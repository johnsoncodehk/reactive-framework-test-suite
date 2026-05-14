# Reactive Framework Test Suite

Cross-library test suite for comparing reactive signal behavior across **15 frameworks** with **182 test cases**.

> 2191 passed, 309 failed, 230 skipped out of 2730 total runs

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
| alien-signals          |  182 |    0 |    0 |   182 |
| @reatom/core           |  181 |    1 |    0 |   182 |
| @preact/signals-core   |  180 |    2 |    0 |   182 |
| anod                   |  168 |   14 |    0 |   182 |
| tansu                  |  165 |    4 |   13 |   182 |
| @solidjs/signals       |  159 |   10 |   13 |   182 |
| solid-js               |  156 |   26 |    0 |   182 |
| mobx                   |  150 |   19 |   13 |   182 |
| @vue/reactivity        |  149 |   33 |    0 |   182 |
| signal-polyfill (TC39) |  145 |    8 |   29 |   182 |
| @angular/core          |  143 |   10 |   29 |   182 |
| svelte                 |  132 |   13 |   37 |   182 |
| S.js                   |  132 |   50 |    0 |   182 |
| @reactively/core       |  116 |   16 |   50 |   182 |
| r3                     |   33 |  103 |   46 |   182 |

## Results

### Graph Propagation

| Framework              | #1 | #2..#6,... ×16 | #7 | #187,#205 | #188 | #189 | #192 | #204 |
| ---------------------- | -- | -------------- | -- | --------- | ---- | ---- | ---- | ---- |
| alien-signals          |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |  ✅ |              ✅ |  ✅ |         ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |
| tansu                  |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |  ✅ |              ✅ |  ✅ |         ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |
| @vue/reactivity        |  ✅ |              ✅ |  ✅ |         ✅ |    ❌ |    ✅ |    ✅ |    ❌ |
| mobx                   |  ✅ |              ✅ |  ❌ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |  ✅ |              ✅ |  ✅ |         ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |
| solid-js               |  ✅ |              ✅ |  ✅ |         ❌ |    ❌ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals       |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| S.js                   |  ✅ |              ✅ |  ❌ |         ❌ |    ❌ |    ❌ |    ❌ |    ✅ |
| @angular/core          |  ✅ |              ✅ |  ✅ |         ✅ |    ⬜ |    ✅ |    ✅ |    ⬜ |
| anod                   |  ✅ |              ✅ |  ✅ |         ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| r3                     |  ✅ |              ❌ |  ❌ |         ❌ |    ⬜ |    ✅ |    ❌ |    ⬜ |

### Dynamic Dependencies

| Framework              | #12..#13 | #14,#16,... ×9 | #193 | #197 | #200 |
| ---------------------- | -------- | -------------- | ---- | ---- | ---- |
| alien-signals          |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |        ✅ |              ✅ |    ✅ |    ✅ |    ❌ |
| tansu                  |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| @vue/reactivity        |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| mobx                   |        ❌ |              ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| solid-js               |        ✅ |              ✅ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals       |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| S.js                   |        ✅ |              ✅ |    ❌ |    ❌ |    ✅ |
| @angular/core          |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| anod                   |        ✅ |              ✅ |    ✅ |    ✅ |    ✅ |
| r3                     |        ❌ |              ❌ |    ❌ |    ❌ |    ❌ |

### Computed Evaluation

| Framework              | #18,#25 | #19..#23,#26,... ×7 | #24,#115 | #147 | #148,#27 | #149 |
| ---------------------- | ------- | ------------------- | -------- | ---- | -------- | ---- |
| alien-signals          |       ✅ |                   ✅ |        ✅ |    ✅ |        ✅ |    ✅ |
| @preact/signals-core   |       ✅ |                   ✅ |        ✅ |    ✅ |        ✅ |    ✅ |
| @reactively/core       |       ✅ |                   ✅ |        ✅ |    ⬜ |        ✅ |    ⬜ |
| tansu                  |       ✅ |                   ✅ |        ✅ |    ✅ |        ✅ |    ✅ |
| signal-polyfill (TC39) |       ✅ |                   ✅ |        ✅ |    ⬜ |        ✅ |    ⬜ |
| @vue/reactivity        |       ✅ |                   ✅ |        ✅ |    ❌ |        ✅ |    ❌ |
| mobx                   |       ❌ |                   ✅ |        ✅ |    ❌ |        ❌ |    ✅ |
| @reatom/core           |       ✅ |                   ✅ |        ✅ |    ✅ |        ✅ |    ✅ |
| svelte                 |       ✅ |                   ✅ |        ✅ |    ⬜ |        ✅ |    ⬜ |
| solid-js               |       ✅ |                   ✅ |        ✅ |    ❌ |        ✅ |    ✅ |
| @solidjs/signals       |       ✅ |                   ✅ |        ✅ |    ❌ |        ✅ |    ✅ |
| S.js                   |       ✅ |                   ✅ |        ✅ |    ❌ |        ❌ |    ✅ |
| @angular/core          |       ✅ |                   ✅ |        ✅ |    ⬜ |        ✅ |    ⬜ |
| anod                   |       ✅ |                   ✅ |        ✅ |    ❌ |        ✅ |    ✅ |
| r3                     |       ❌ |                   ❌ |        ✅ |    ⬜ |        ❌ |    ⬜ |

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

| Framework              | #35..#37,... ×8 | #38..#39,... ×5 | #40 | #42 | #111 | #141 | #144 | #178 | #201 | #202 | #203 |
| ---------------------- | --------------- | --------------- | --- | --- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| alien-signals          |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |               ✅ |               ⬜ |   ⬜ |   ⬜ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ❌ |    ✅ |    ✅ |
| tansu                  |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ❌ |    ✅ |    ✅ |
| signal-polyfill (TC39) |               ✅ |               ✅ |   ❌ |   ⬜ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |    ✅ |    ✅ |
| @vue/reactivity        |               ✅ |               ✅ |   ✅ |   ❌ |    ✅ |    ❌ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| mobx                   |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |               ✅ |               ✅ |   ✅ |   ⬜ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |
| solid-js               |               ✅ |               ✅ |   ✅ |   ✅ |    ❌ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @solidjs/signals       |               ✅ |               ⬜ |   ⬜ |   ✅ |    ⬜ |    ✅ |    ⬜ |    ⬜ |    ✅ |    ✅ |    ✅ |
| S.js                   |               ✅ |               ✅ |   ❌ |   ❌ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| @angular/core          |               ✅ |               ✅ |   ❌ |   ⬜ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |    ❌ |    ✅ |
| anod                   |               ✅ |               ✅ |   ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ✅ |    ✅ |
| r3                     |               ❌ |               ❌ |   ❌ |   ⬜ |    ❌ |    ❌ |    ✅ |    ✅ |    ❌ |    ❌ |    ✅ |

### Nested Effects & Ordering

| Framework              | #43,#164,#48 | #44 | #45 | #46 | #47 | #163 | #170 | #209..#210 |
| ---------------------- | ------------ | --- | --- | --- | --- | ---- | ---- | ---------- |
| alien-signals          |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |
| @preact/signals-core   |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| @reactively/core       |            ❌ |   ❌ |   ⬜ |   ✅ |   ✅ |    ❌ |    ❌ |          ❌ |
| tansu                  |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| signal-polyfill (TC39) |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| @vue/reactivity        |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| mobx                   |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| @reatom/core           |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |
| svelte                 |            ✅ |   ✅ |   ⬜ |   ✅ |   ❌ |    ❌ |    ✅ |          ❌ |
| solid-js               |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| @solidjs/signals       |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |
| S.js                   |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ❌ |          ❌ |
| @angular/core          |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ❌ |
| anod                   |            ✅ |   ✅ |   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |          ✅ |
| r3                     |            ❌ |   ✅ |   ⬜ |   ❌ |   ❌ |    ❌ |    ❌ |          ✅ |

### Inner Write

| Framework              | #50,#186 | #51 | #52,#55,#112,... ×11 | #53,#56,#133,... ×6 | #54 | #139 | #179 | #57 | #182 | #183 | #185 | #213 | #212 |
| ---------------------- | -------- | --- | -------------------- | ------------------- | --- | ---- | ---- | --- | ---- | ---- | ---- | ---- | ---- |
| alien-signals          |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @preact/signals-core   |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reactively/core       |        ❌ |   ⬜ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |
| tansu                  |        ✅ |   ⬜ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| signal-polyfill (TC39) |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ⬜ |    ✅ |    ✅ |    ❌ |    ❌ |
| @vue/reactivity        |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |
| mobx                   |        ✅ |   ⬜ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ✅ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| @reatom/core           |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ✅ |    ✅ |    ✅ |    ✅ |    ✅ |
| svelte                 |        ✅ |   ✅ |                    ✅ |                   ✅ |   ❌ |    ❌ |    ❌ |   ❌ |    ⬜ |    ✅ |    ✅ |    ❌ |    ✅ |
| solid-js               |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ✅ |    ❌ |    ❌ |    ✅ |    ✅ |
| @solidjs/signals       |        ✅ |   ⬜ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ✅ |    ✅ |    ✅ |    ❌ |    ❌ |
| S.js                   |        ✅ |   ❌ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ❌ |    ❌ |    ❌ |    ✅ |    ✅ |
| @angular/core          |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ❌ |    ⬜ |    ✅ |    ✅ |    ✅ |    ✅ |
| anod                   |        ✅ |   ✅ |                    ✅ |                   ✅ |   ✅ |    ✅ |    ❌ |   ✅ |    ❌ |    ✅ |    ✅ |    ✅ |    ✅ |
| r3                     |        ✅ |   ❌ |                    ✅ |                   ❌ |   ✅ |    ❌ |    ❌ |   ❌ |    ⬜ |    ❌ |    ⬜ |    ❌ |    ❌ |

### Cycle & Infinite Loop Detection

| Framework              | #58..#61,#63 | #150,#152 | #151 | #153 | #64 |
| ---------------------- | ------------ | --------- | ---- | ---- | --- |
| alien-signals          |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @preact/signals-core   |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @reactively/core       |            ✅ |         ✅ |    ⬜ |    ✅ |   ❌ |
| tansu                  |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| signal-polyfill (TC39) |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @vue/reactivity        |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| mobx                   |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @reatom/core           |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| svelte                 |            ✅ |         ✅ |    ⬜ |    ❌ |   ✅ |
| solid-js               |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @solidjs/signals       |            ✅ |         ❌ |    ✅ |    ✅ |   ✅ |
| S.js                   |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| @angular/core          |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| anod                   |            ✅ |         ✅ |    ✅ |    ✅ |   ✅ |
| r3                     |            ✅ |         ✅ |    ⬜ |    ❌ |   ✅ |

### Batching / Transaction

| Framework              | #65..#66,#72,... ×6 | #67..#68,... ×5 | #69 | #70 | #71,... ×6 | #73,#123,#132 | #120 | #130 |
| ---------------------- | ------------------- | --------------- | --- | --- | ---------- | ------------- | ---- | ---- |
| alien-signals          |                   ✅ |               ✅ |   ✅ |   ✅ |          ✅ |             ✅ |    ✅ |    ✅ |
| @preact/signals-core   |                   ✅ |               ✅ |   ✅ |   ✅ |          ✅ |             ✅ |    ✅ |    ✅ |
| @reactively/core       |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |          ⬜ |             ⬜ |    ⬜ |    ❌ |
| tansu                  |                   ✅ |               ✅ |   ✅ |   ✅ |          ✅ |             ✅ |    ⬜ |    ✅ |
| signal-polyfill (TC39) |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |          ⬜ |             ⬜ |    ✅ |    ✅ |
| @vue/reactivity        |                   ❌ |               ❌ |   ❌ |   ❌ |          ❌ |             ❌ |    ✅ |    ✅ |
| mobx                   |                   ✅ |               ✅ |   ✅ |   ❌ |          ✅ |             ❌ |    ⬜ |    ✅ |
| @reatom/core           |                   ✅ |               ✅ |   ✅ |   ✅ |          ✅ |             ✅ |    ✅ |    ✅ |
| svelte                 |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |          ⬜ |             ⬜ |    ❌ |    ✅ |
| solid-js               |                   ✅ |               ✅ |   ❌ |   ✅ |          ✅ |             ❌ |    ✅ |    ✅ |
| @solidjs/signals       |                   ✅ |               ✅ |   ✅ |   ✅ |          ✅ |             ❌ |    ⬜ |    ✅ |
| S.js                   |                   ❌ |               ❌ |   ❌ |   ✅ |          ✅ |             ❌ |    ✅ |    ✅ |
| @angular/core          |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |          ⬜ |             ⬜ |    ✅ |    ✅ |
| anod                   |                   ✅ |               ❌ |   ❌ |   ✅ |          ✅ |             ❌ |    ✅ |    ✅ |
| r3                     |                   ⬜ |               ⬜ |   ⬜ |   ⬜ |          ⬜ |             ⬜ |    ❌ |    ❌ |

### Untracked / Unsampled Reads

| Framework              | #75,... ×5 | #76 |
| ---------------------- | ---------- | --- |
| alien-signals          |          ✅ |   ✅ |
| @preact/signals-core   |          ✅ |   ✅ |
| @reactively/core       |          ⬜ |   ⬜ |
| tansu                  |          ✅ |   ✅ |
| signal-polyfill (TC39) |          ✅ |   ✅ |
| @vue/reactivity        |          ✅ |   ✅ |
| mobx                   |          ✅ |   ❌ |
| @reatom/core           |          ✅ |   ✅ |
| svelte                 |          ⬜ |   ⬜ |
| solid-js               |          ✅ |   ✅ |
| @solidjs/signals       |          ✅ |   ✅ |
| S.js                   |          ✅ |   ✅ |
| @angular/core          |          ✅ |   ✅ |
| anod                   |          ✅ |   ✅ |
| r3                     |          ⬜ |   ⬜ |

### Error Handling

| Framework              | #84..#85,#87,... ×8 | #89 | #90 | #154 | #177 |
| ---------------------- | ------------------- | --- | --- | ---- | ---- |
| alien-signals          |                   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |
| @preact/signals-core   |                   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |
| @reactively/core       |                   ✅ |   ⬜ |   ⬜ |    ⬜ |    ❌ |
| tansu                  |                   ✅ |   ⬜ |   ⬜ |    ✅ |    ✅ |
| signal-polyfill (TC39) |                   ✅ |   ✅ |   ✅ |    ⬜ |    ✅ |
| @vue/reactivity        |                   ✅ |   ✅ |   ✅ |    ❌ |    ✅ |
| mobx                   |                   ✅ |   ⬜ |   ⬜ |    ✅ |    ✅ |
| @reatom/core           |                   ✅ |   ✅ |   ✅ |    ✅ |    ✅ |
| svelte                 |                   ✅ |   ✅ |   ✅ |    ⬜ |    ✅ |
| solid-js               |                   ❌ |   ✅ |   ✅ |    ❌ |    ✅ |
| @solidjs/signals       |                   ✅ |   ⬜ |   ⬜ |    ✅ |    ❌ |
| S.js                   |                   ❌ |   ✅ |   ✅ |    ❌ |    ✅ |
| @angular/core          |                   ✅ |   ✅ |   ✅ |    ⬜ |    ❌ |
| anod                   |                   ✅ |   ✅ |   ✅ |    ❌ |    ✅ |
| r3                     |                   ⬜ |   ❌ |   ✅ |    ⬜ |    ❌ |

### Stale Evaluation Order

| Framework              | #94,#96,... ×5 | #95 |
| ---------------------- | -------------- | --- |
| alien-signals          |              ✅ |   ✅ |
| @preact/signals-core   |              ✅ |   ✅ |
| @reactively/core       |              ✅ |   ✅ |
| tansu                  |              ✅ |   ✅ |
| signal-polyfill (TC39) |              ✅ |   ✅ |
| @vue/reactivity        |              ✅ |   ✅ |
| mobx                   |              ✅ |   ❌ |
| @reatom/core           |              ✅ |   ✅ |
| svelte                 |              ✅ |   ✅ |
| solid-js               |              ✅ |   ✅ |
| @solidjs/signals       |              ✅ |   ✅ |
| S.js                   |              ✅ |   ✅ |
| @angular/core          |              ✅ |   ✅ |
| anod                   |              ✅ |   ✅ |
| r3                     |              ❌ |   ❌ |

### Memory & GC

| Framework              | #98..#99,... ×5 |
| ---------------------- | --------------- |
| alien-signals          |               ✅ |
| @preact/signals-core   |               ✅ |
| @reactively/core       |               ✅ |
| tansu                  |               ✅ |
| signal-polyfill (TC39) |               ✅ |
| @vue/reactivity        |               ✅ |
| mobx                   |               ✅ |
| @reatom/core           |               ✅ |
| svelte                 |               ✅ |
| solid-js               |               ✅ |
| @solidjs/signals       |               ✅ |
| S.js                   |               ✅ |
| @angular/core          |               ✅ |
| anod                   |               ✅ |
| r3                     |               ❌ |

### Behavioral Differences

> Tests in this section reflect **design choice differences** between frameworks, not correctness issues. Different behaviors are all valid — for example, whether to use `Object.is` or `===` for equality, or whether inner writes are visible immediately within the same effect run.

| Framework              | #17   | #15                | #146             | #29,#167  | #30        | #176         | #173       | #174       | #88              | #106        | #86,#107      | #49                  | #62                | #175               |
| ---------------------- | ----- | ------------------ | ---------------- | --------- | ---------- | ------------ | ---------- | ---------- | ---------------- | ----------- | ------------- | -------------------- | ------------------ | ------------------ |
| alien-signals          | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | returns stale | runs 1x per write    | no throw           | unbatched (2 runs) |
| @preact/signals-core   | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | cycle detected     | batched            |
| @reactively/core       | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | throws     | throws     | keeps subscribed | halts flush | re-evaluates  | runs 2x per write    | manual bail (200+) | error              |
| tansu                  | lazy  | no subscription    | single recompute | Object.is | propagates | returns void | post-write | post-write | keeps subscribed | continues   | caches error  | runs 2x per write    | manual bail (200+) | batched            |
| signal-polyfill (TC39) | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | continues   | caches error  | runs 1x, then blocks | no throw           | unbatched (2 runs) |
| @vue/reactivity        | lazy  | no subscription    | single recompute | Object.is | skips      | error        | post-write | post-write | keeps subscribed | continues   | returns stale | runs 1x per write    | no throw           | unbatched (2 runs) |
| mobx                   | lazy  | no subscription    | single recompute | ===       | propagates | returns void | post-write | post-write | keeps subscribed | continues   | re-evaluates  | runs 2x per write    | no throw           | batched            |
| @reatom/core           | lazy  | no subscription    | single recompute | Object.is | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | cycle detected     | batched            |
| svelte                 | lazy  | no subscription    | single recompute | ===       | skips      | ⬜            | post-write | throws     | unsubscribes     | halts flush | re-evaluates  | runs 2x per write    | cycle detected     | batched            |
| solid-js               | eager | subscribes eagerly | 2 recomputes     | ===       | skips      | returns void | post-write | post-write | unsubscribes     | halts flush | error         | runs 2x per write    | manual bail (200+) | batched            |
| @solidjs/signals       | lazy  | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | keeps subscribed | halts flush | caches error  | runs 1x, then blocks | no throw           | batched            |
| S.js                   | eager | subscribes eagerly | 2 recomputes     | ===       | propagates | returns void | post-write | throws     | keeps subscribed | halts flush | error         | runs 2x per write    | manual bail (200+) | batched            |
| @angular/core          | lazy  | no subscription    | single recompute | Object.is | skips      | ⬜            | post-write | post-write | keeps subscribed | halts flush | caches error  | runs 2x per write    | manual bail (200+) | unbatched (2 runs) |
| anod                   | eager | no subscription    | single recompute | ===       | skips      | returns void | post-write | post-write | unsubscribes     | continues   | caches error  | runs 2x per write    | manual bail (200+) | batched            |
| r3                     | lazy  | error              | error            | error     | error      | ⬜            | throws     | throws     | unsubscribes     | halts flush | returns stale | no re-run            | no throw           | error              |

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
import { testSuite, SkipTest } from "reactive-framework-test-suite";

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
