import type { ReactiveFramework } from "../../src/framework.js";
import { detectCapabilities } from "../../src/framework.js";

import { alienSignalsFramework } from "./alienSignals.js";
import { preactSignalsFramework } from "./preactSignals.js";
import { reactivelyFramework } from "./reactively.js";
import { tansuFramework } from "./tansu.js";
import { tc39SignalsFramework } from "./tc39Signals.js";
import { vueReactivityFramework } from "./vueReactivity.js";
import { mobxFramework } from "./mobx.js";
import { reatomFramework } from "./reatom.js";

export const frameworks: ReactiveFramework[] = [
  alienSignalsFramework,
  preactSignalsFramework,
  reactivelyFramework,
  tansuFramework,
  tc39SignalsFramework,
  vueReactivityFramework,
  mobxFramework,
  reatomFramework,
];

try {
  const { svelteFramework } = await import("./svelte.js");
  frameworks.push(svelteFramework);
} catch {}

try {
  const { solidFramework } = await import("./solid.js");
  frameworks.push(solidFramework);
} catch {}

try {
  const { xReactivityFramework } = await import("./xReactivity.js");
  frameworks.push(xReactivityFramework);
} catch {}

try {
  const { sjsFramework } = await import("./sjs.js");
  frameworks.push(sjsFramework);
} catch {}

try {
  const { potaFramework } = await import("./pota.js");
  frameworks.push(potaFramework);
} catch {}

try {
  const { angularSignalsFramework } = await import("./angularSignals.js");
  frameworks.push(angularSignalsFramework);
} catch {}

try {
  const { anodFramework } = await import("./anod.js");
  frameworks.push(anodFramework);
} catch {}

try {
  const { r3Framework } = await import("./r3.js");
  frameworks.push(r3Framework);
} catch {}

for (const fw of frameworks) {
  detectCapabilities(fw);
}
