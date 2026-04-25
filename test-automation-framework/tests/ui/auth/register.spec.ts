import { test, expect } from "../../../fixtures/base.fixture";
import { LoginPage } from "../../../pages/auth/LoginPage";
import { RegisterPage } from "../../../pages/auth/RegisterPage";
import { randomSuffix } from "../../../utils/data/random";

test.describe("Auth Register UI", () => {
  test("@ui @critical should register new user and login into dashboard", async ({ page }) => {
    // arrange
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const username = randomSuffix("register-ui");
    const email = `${username}@example.com`;
    const password = "Passw0rd!";

    // act
    await registerPage.open();
    await registerPage.register(username, email, password);

    // assert register redirect
    await expect(page).toHaveURL(/\/login/);

    // act login with new user
    await loginPage.login(username, password);

    // assert dashboard access
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("link", { name: /ферми|farms/i })).toBeVisible();
  });
});
