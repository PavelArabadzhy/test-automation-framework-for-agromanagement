import { defineConfig, devices } from "@playwright/test";
import { ENV } from "./config/env";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: ENV.baseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    {
      name: "ui",
      use: {
        ...devices["Desktop Chrome"]
      },
      grepInvert: /@api/
    },
    {
      name: "api",
      use: {
        baseURL: ENV.apiBaseUrl
      },
      grep: /@api/
    }
  ]
});
