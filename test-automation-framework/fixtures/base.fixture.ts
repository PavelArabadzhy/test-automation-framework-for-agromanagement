import { test as base } from "@playwright/test";
import { assertRequiredEnv, ENV } from "../config/env";

type BaseFixture = {
  env: typeof ENV;
};

export const test = base.extend<BaseFixture>({
  env: async ({}, use) => {
    assertRequiredEnv();
    await use(ENV);
  }
});

export { expect } from "@playwright/test";
