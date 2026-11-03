import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unbounded cycle tests rely on their own run/time guard; frameworks
    // without cycle detection can take a few seconds to unwind after it trips.
    testTimeout: 30_000,
  },
  resolve: {
    conditions: ["browser", "development"],
  },
  ssr: {
    resolve: {
      conditions: ["browser", "development"],
    },
  },
});
