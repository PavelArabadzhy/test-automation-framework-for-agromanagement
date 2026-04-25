import { expect, Locator, Page } from "@playwright/test";

export class HomePage {
  private readonly farmsCard: Locator;

  constructor(private readonly page: Page) {
    this.farmsCard = page.getByRole("link", { name: /ферми|farms/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/");
  }

  async expectAuthenticatedDashboard(): Promise<void> {
    await expect(this.farmsCard).toBeVisible();
  }
}
