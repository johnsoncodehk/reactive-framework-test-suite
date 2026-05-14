type ExpectFn = (actual: unknown) => any;

const defaultExpect: ExpectFn = (actual) => {
  return {
    toBe(expected: unknown) {
      if (!Object.is(actual, expected)) {
        throw new Error(
          `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
        );
      }
    },
    toEqual(expected: unknown) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
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
};

let activeExpect: ExpectFn = defaultExpect;

/**
 * Replace the built-in expect with one from your test runner
 * (e.g. vitest's `expect`) for richer error messages and tighter
 * integration. Pass nothing to restore the built-in implementation.
 */
export function setExpect(fn?: ExpectFn): void {
  activeExpect = fn ?? defaultExpect;
}

export function expect(actual: unknown) {
  return activeExpect(actual);
}
