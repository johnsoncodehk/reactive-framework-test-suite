export interface ReactiveFramework {
  name: string;
  signal<T>(initialValue: T): Signal<T>;
  computed<T>(fn: () => T): Computed<T>;
  effect(fn: () => void | (() => void)): () => void;
  run(fn: () => void): void;
  batch?(fn: () => void): void;
  untracked?<T>(fn: () => T): T;
  /**
   * The function an effect returns runs before the effect re-runs and
   * when it is disposed. Cases about cleanup are skipped without it.
   */
  effectCleanup?: true;
}

export interface Signal<T> {
  read(): T;
  write(v: T): void;
}

export interface Computed<T> {
  read(): T;
}

export class SkipTest extends Error {
  reason: string;
  constructor(reason: string) {
    super(reason);
    this.reason = reason;
  }
}
