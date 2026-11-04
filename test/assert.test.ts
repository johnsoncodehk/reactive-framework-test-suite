import { test, expect as vexpect } from "vitest";
import { expect } from "../src/assert.ts";

const equal = (a: unknown, b: unknown) => {
  try {
    expect(a).toEqual(b);
    return true;
  } catch {
    return false;
  }
};

test("toEqual compares structure, not serialization", () => {
  vexpect(equal([undefined], [null])).toBe(false);
  vexpect(equal([NaN], [null])).toBe(false);
  vexpect(equal({ a: undefined }, {})).toBe(false);
  vexpect(equal({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  vexpect(equal([NaN], [NaN])).toBe(true);
  vexpect(equal([1, [2, "x"]], [1, [2, "x"]])).toBe(true);
  vexpect(equal([1, 2], [1, 2, 3])).toBe(false);
  vexpect(equal([1], { 0: 1, length: 1 })).toBe(false);
});
