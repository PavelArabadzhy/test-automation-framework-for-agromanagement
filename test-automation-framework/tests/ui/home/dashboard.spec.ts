import { test, expect } from "../../../fixtures/base.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Home dashboard", () => {
  test("@ui @critical should render statistics chart without javascript errors", async ({ page, env }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await loginViaUi(page, env.userUsername, env.userPassword);
    await page.goto("/");

    await expect(page.locator("#yieldChart")).toBeVisible();
    expect(jsErrors).toEqual([]);
  });
});
