import { test, expect } from "../../../fixtures/base.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";

test.describe("Home dashboard", () => {
  test("@ui @critical should render statistics chart without javascript errors", async ({ page, env }) => {
    // arrange
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    // act
    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/");

    // assert
    await expect(page.locator("#yieldChart")).toBeVisible();
    expect(jsErrors).toEqual([]);
  });
});
