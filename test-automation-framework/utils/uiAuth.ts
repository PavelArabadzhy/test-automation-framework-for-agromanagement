import { Page } from "@playwright/test";
import { LoginPage } from "../pages/auth/LoginPage";

export async function loginViaUi(page: Page, username: string, password: string): Promise<void> {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(username, password);
}
