import { test, expect } from "../../../fixtures/base.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";

test.describe("Auth session flow", () => {
  test("@ui @regression should show logout message on login page after logout", async ({ page, env }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto("/");
    await page.locator('form[action="/logout"] button').click();

    // assert
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /register/i })).toBeVisible();
  });

  test("@ui @security should redirect anonymous user from protected page to login", async ({ page }) => {
    // arrange
    // no preconditions

    // act
    await page.goto("/farms");

    // assert
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator("#username")).toBeVisible();
  });
});
