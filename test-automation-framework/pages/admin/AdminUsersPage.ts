import { expect, Page } from "@playwright/test";

export class AdminUsersPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto("/admin/users");
  }

  async expectUsersStatsVisible(): Promise<void> {
    await expect(this.page.getByRole("heading", { name: /користувачі та статистика/i })).toBeVisible();
  }

  async openFirstEdit(): Promise<void> {
    await this.page.locator("tbody tr").first().getByRole("link", { name: /редагувати/i }).click();
  }
}
