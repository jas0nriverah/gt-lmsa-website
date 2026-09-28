import { defineConfig, devices } from "@playwright/test";
import { validateTestDatabaseUrl } from "./scripts/test-database";

const testDatabaseUrl = validateTestDatabaseUrl(process.env.TEST_DATABASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 12_000 },
  reporter: process.env.CI ? "github" : "list",
  outputDir: "./test-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3100",
    timezoneId: "America/New_York",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm exec -- tsx scripts/preview-test-platform.ts",
    url: "http://127.0.0.1:3100/member",
    reuseExistingServer: false,
    timeout: 180_000,
    env: { TEST_DATABASE_URL: testDatabaseUrl },
  },
});
