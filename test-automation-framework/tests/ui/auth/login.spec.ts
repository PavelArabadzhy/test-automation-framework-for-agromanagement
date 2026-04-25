import { LoginPage } from "../../../pages/auth/LoginPage";
import { HomePage } from "../../../pages/home/HomePage";
import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Auth UI", () => {
  test("@smoke @ui should login with valid credentials", async ({ page, env }) => {
    // arrange
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    // act
    await loginPage.open();
    await loginPage.login(env.userUsername, env.userPassword);

    // assert
    await homePage.expectAuthenticatedDashboard();
  });

  test("@smoke @ui should show error on invalid login", async ({ page, env }) => {
    // arrange
    const loginPage = new LoginPage(page);

    // act
    await loginPage.open();
    await loginPage.login(env.userUsername, `${env.userPassword}-wrong`);

    // assert
    await loginPage.expectInvalidLoginMessage();
    await expect(page).toHaveURL(/\/login/);
  });
});
