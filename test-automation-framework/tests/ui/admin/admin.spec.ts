import { test, expect } from "../../../fixtures/base.fixture";
import { AdminEditUserPage } from "../../../pages/admin/AdminEditUserPage";
import { AdminUsersPage } from "../../../pages/admin/AdminUsersPage";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Admin UI", () => {
  test("@ui @critical should redirect admin root to users page", async ({ page, env }) => {
    await loginViaUi(page, env.adminUsername, env.adminPassword);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test("@ui @critical should allow admin to open users stats page", async ({ page, env }) => {
    // arrange
    await loginViaUi(page, env.adminUsername, env.adminPassword);
    const usersPage = new AdminUsersPage(page);

    // act
    await usersPage.open();

    // assert
    await usersPage.expectUsersStatsVisible();
    await expect(page).toHaveURL(/\/admin\/users/);
  });

  test("@ui @security should deny non-admin access to users stats page", async ({ page, env }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const usersPage = new AdminUsersPage(page);

    // act
    await usersPage.open();

    // assert
    await expect(page.getByRole("heading", { name: /користувачі та статистика/i })).toHaveCount(0);
  });

  test("@ui @critical should allow admin to open edit user page", async ({ page, env }) => {
    // arrange
    await loginViaUi(page, env.adminUsername, env.adminPassword);
    const usersPage = new AdminUsersPage(page);
    const editPage = new AdminEditUserPage(page);
    await usersPage.open();

    // act
    await usersPage.openFirstEdit();

    // assert
    await editPage.expectEditFormVisible();
    await expect(page).toHaveURL(/\/admin\/users\/\d+\/edit/);
  });

  test("@ui @critical should update user data and show it on users table", async ({ page, env }) => {
    await loginViaUi(page, env.adminUsername, env.adminPassword);
    const usersPage = new AdminUsersPage(page);
    await usersPage.open();

    const firstRow = page.locator("tbody tr").first();
    const initialUsername = (await firstRow.locator("td").nth(1).textContent())?.trim() ?? "";
    const initialEmail = (await firstRow.locator("td").nth(2).textContent())?.trim() ?? "";

    await usersPage.openFirstEdit();

    const updatedUsername = `${initialUsername}-u`;
    const updatedEmail = initialEmail.replace("@", "+upd@");
    await page.locator("#username").fill(updatedUsername);
    await page.locator("#email").fill(updatedEmail);
    await page.getByRole("button", { name: /зберегти/i }).click();

    await expect(page).toHaveURL(/\/admin\/users/);
    await expect(page.locator("tbody tr").first().locator("td").nth(1)).toHaveText(updatedUsername);
    await expect(page.locator("tbody tr").first().locator("td").nth(2)).toHaveText(updatedEmail);

    // revert to keep environment clean
    await usersPage.openFirstEdit();
    await page.locator("#username").fill(initialUsername);
    await page.locator("#email").fill(initialEmail);
    await page.getByRole("button", { name: /зберегти/i }).click();
    await expect(page).toHaveURL(/\/admin\/users/);
  });
});
