import { LoginPage } from "../../../pages/auth/LoginPage";
import { HomePage } from "../../../pages/home/HomePage";
import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Auth UI", () => {
  test("@smoke @ui should login with valid credentials", async ({ page, env }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.open();
    await loginPage.login(env.userUsername, env.userPassword);
    await homePage.expectAuthenticatedDashboard();
  });

  test("@smoke @ui should show error on invalid login", async ({ page, env }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(env.userUsername, `${env.userPassword}-wrong`);
    await loginPage.expectInvalidLoginMessage();
    await expect(page).toHaveURL(/\/login/);
  });
});
