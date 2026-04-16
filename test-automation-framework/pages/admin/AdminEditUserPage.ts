import { expect, Page } from "@playwright/test";

export class AdminEditUserPage {
  constructor(private readonly page: Page) {}

  async expectEditFormVisible(): Promise<void> {
    await expect(this.page.locator("#username")).toBeVisible();
    await expect(this.page.locator("#email")).toBeVisible();
    await expect(this.page.getByRole("button", { name: /зберегти/i })).toBeVisible();
  }
}
