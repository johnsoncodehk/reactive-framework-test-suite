export function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (!Object.is(actual, expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
        );
      }
    },
    toEqual(expected: unknown) {
      if (!deepEqual(actual, expected)) {
        throw new Error(
          `Expected deep equal ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
        );
      }
    },
    toThrow(message?: string) {
      if (typeof actual !== "function") {
        throw new Error("Expected a function for toThrow");
      }
      let threw = false;
      try {
        (actual as Function)();
      } catch (e: any) {
        threw = true;
        if (message !== undefined && !String(e?.message ?? e).includes(message)) {
          throw new Error(
            `Expected error containing "${message}" but got "${e?.message ?? e}"`
          );
        }
      }
      if (!threw) {
        throw new Error("Expected function to throw but it did not");
      }
    },
    toBeGreaterThan(expected: number) {
      if (!((actual as number) > expected)) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (!((actual as number) >= expected)) {
        throw new Error(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (!((actual as number) < expected)) {
        throw new Error(`Expected ${actual} < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (!((actual as number) <= expected)) {
        throw new Error(`Expected ${actual} <= ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error("Expected value to be defined but got undefined");
      }
    },
    toContain(expected: unknown) {
      if (!(actual as any[]).includes(expected)) {
        throw new Error(
          `Expected ${JSON.stringify(actual)} to contain ${JSON.stringify(expected)}`
        );
      }
    },
    toHaveLength(expected: number) {
      const len = (actual as any[]).length;
      if (len !== expected) {
        throw new Error(`Expected length ${expected} but got ${len}`);
      }
    },
    not: {
      toThrow() {
        if (typeof actual !== "function") {
          throw new Error("Expected a function for not.toThrow");
        }
        try {
          (actual as Function)();
        } catch (e: any) {
          throw new Error(
            `Expected function not to throw but it threw: ${e?.message ?? e}`
          );
        }
      },
    },
  };
}

/** Same primitives (Object.is), or arrays / plain objects with the same keys and deep-equal values. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  return keys.every(
    (k) => Object.hasOwn(b, k) && deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  );
}
