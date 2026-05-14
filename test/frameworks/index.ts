import type { ReactiveFramework } from "../../src/framework.js";

import { alienSignalsFramework } from "./alienSignals.js";
import { angularSignalsFramework } from "./angularSignals.js";
import { anodFramework } from "./anod.js";
import { mobxFramework } from "./mobx.js";
import { potaFramework } from "./pota.js";
import { preactSignalsFramework } from "./preactSignals.js";
import { reactivelyFramework } from "./reactively.js";
import { reatomFramework } from "./reatom.js";
import { sjsFramework } from "./sjs.js";
import { solidFramework } from "./solid.js";
import { svelteFramework } from "./svelte.js";
import { tansuFramework } from "./tansu.js";
import { tc39SignalsFramework } from "./tc39Signals.js";
import { vueReactivityFramework } from "./vueReactivity.js";
import { xReactivityFramework } from "./xReactivity.js";

export const frameworks: ReactiveFramework[] = [
  alienSignalsFramework,
  preactSignalsFramework,
  reactivelyFramework,
  tansuFramework,
  tc39SignalsFramework,
  vueReactivityFramework,
  mobxFramework,
  reatomFramework,
  svelteFramework,
  solidFramework,
  xReactivityFramework,
  sjsFramework,
  potaFramework,
  angularSignalsFramework,
  anodFramework,
];
