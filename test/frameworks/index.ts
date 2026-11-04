import type { AdapterModule } from "../../src/node/index.ts";

// Adapters load in plain Node too (cycle cases run in separate processes);
// these conditions select the libraries' reactive client builds.
const execArgv = ["--conditions=browser", "--conditions=development"];

const adapter = (file: string, name: string): AdapterModule => ({
  module: new URL(`./${file}`, import.meta.url),
  export: name,
  execArgv,
});

export const adapters: AdapterModule[] = [
  adapter("alienSignals.ts", "alienSignalsFramework"),
  adapter("preactSignals.ts", "preactSignalsFramework"),
  adapter("reactively.ts", "reactivelyFramework"),
  adapter("tansu.ts", "tansuFramework"),
  adapter("tc39Signals.ts", "tc39SignalsFramework"),
  adapter("vueReactivity.ts", "vueReactivityFramework"),
  adapter("mobx.ts", "mobxFramework"),
  adapter("reatom.ts", "reatomFramework"),
  adapter("svelte.ts", "svelteFramework"),
  adapter("solid.ts", "solidFramework"),
  adapter("solidSignals.ts", "solidSignalsFramework"),
  adapter("sjs.ts", "sjsFramework"),
  adapter("pota.ts", "potaFramework"),
  adapter("angularSignals.ts", "angularSignalsFramework"),
  adapter("anod.ts", "anodFramework"),
  adapter("reactiveEngine.ts", "reactiveEngineFramework"),
];
