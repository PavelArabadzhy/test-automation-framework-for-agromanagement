import { test, expect } from "../../../fixtures/base.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("UI form validation", () => {
  test("@ui @regression should validate required fields on farm form", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/farms/add");
    const valid = await page.locator("form").evaluate((f) => (f as HTMLFormElement).reportValidity());
    expect(valid).toBeFalsy();
  });

  test("@ui @regression should validate required fields on field form", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/fields/add");
    const valid = await page.locator("form").evaluate((f) => (f as HTMLFormElement).reportValidity());
    expect(valid).toBeFalsy();
  });

  test("@ui @regression should validate required fields on crop form", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/crops/add");
    const valid = await page.locator("form").evaluate((f) => (f as HTMLFormElement).reportValidity());
    expect(valid).toBeFalsy();
  });

  test("@ui @regression should validate required fields on planting form", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/plantings/add");
    const valid = await page.locator("form").evaluate((f) => (f as HTMLFormElement).reportValidity());
    expect(valid).toBeFalsy();
  });

  test("@ui @regression should validate required fields on harvest form", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/harvests/add");
    const valid = await page.locator("form").evaluate((f) => (f as HTMLFormElement).reportValidity());
    expect(valid).toBeFalsy();
  });
});
