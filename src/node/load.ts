import type { ReactiveFramework } from "../framework.ts";
import type { AdapterModule } from "./index.ts";

export async function loadAdapter({ module, export: name }: AdapterModule): Promise<ReactiveFramework> {
  const url = module instanceof URL ? module.href : module;
  const fw = (await import(url))[name];
  if (!fw) throw new Error(`${url} has no export named ${name}`);
  return fw;
}
