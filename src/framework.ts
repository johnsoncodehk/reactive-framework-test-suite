export interface ReactiveFramework {
  name?: string;
  signal<T>(initialValue: T): Signal<T>;
  computed<T>(fn: () => T): Computed<T>;
  effect(fn: () => void | (() => void)): () => void;
  run(fn: () => void): void;
  batch?(fn: () => void): void;
  untracked?<T>(fn: () => T): T;
}

const caps = new WeakMap<ReactiveFramework, { effectCleanup: boolean; computedThrows: boolean }>();

export function detectCapabilities(fw: ReactiveFramework): void {
  if (caps.has(fw)) return;

  let effectCleanup = false;
  try {
    fw.run(() => {
      let cleaned = false;
      const s = fw.signal(0);
      const dispose = fw.effect(() => {
        s.read();
        return () => { cleaned = true; };
      });
      s.write(1);
      dispose();
      effectCleanup = cleaned;
    });
  } catch {}

  let computedThrows = false;
  try {
    fw.run(() => {
      const s = fw.signal(1);
      const c = fw.computed(() => {
        if (s.read() === 0) throw new Error("probe");
        return s.read();
      });
      let threw = false;
      try { s.write(0); } catch { threw = true; }
      try { c.read(); } catch { threw = true; }
      if (!threw) return;
      try { s.write(1); } catch { throw new Error("no recovery"); }
      if (c.read() !== 1) throw new Error("no recovery");
      computedThrows = true;
    });
  } catch {}

  caps.set(fw, { effectCleanup, computedThrows });
}

export function hasEffectCleanup(fw: ReactiveFramework): boolean {
  detectCapabilities(fw);
  return caps.get(fw)!.effectCleanup;
}

export function hasComputedThrows(fw: ReactiveFramework): boolean {
  detectCapabilities(fw);
  return caps.get(fw)!.computedThrows;
}

export interface Signal<T> {
  read(): T;
  write(v: T): void;
}

export interface Computed<T> {
  read(): T;
}

export class SkipTest extends Error {
  constructor(public reason: string) {
    super(reason);
  }
}
