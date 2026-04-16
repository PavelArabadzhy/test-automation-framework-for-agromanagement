import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorAlert: Locator;

  constructor(private readonly page: Page) {
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.submitButton = page.getByRole("button", { name: /login/i });
    this.errorAlert = page.locator(".alert-danger");
  }

  async open(): Promise<void> {
    await this.page.goto("/login");
    await expect(this.usernameInput).toBeVisible();
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectInvalidLoginMessage(): Promise<void> {
    await expect(this.errorAlert).toBeVisible();
  }
}
