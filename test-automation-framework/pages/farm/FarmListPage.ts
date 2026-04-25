import { expect, Locator, Page } from "@playwright/test";

export class FarmListPage {
  private readonly addFarmButton: Locator;

  constructor(private readonly page: Page) {
    this.addFarmButton = page.getByRole("link", { name: /додати ферму|add farm/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/farms");
    await expect(this.addFarmButton).toBeVisible();
  }

  async clickAddFarm(): Promise<void> {
    await this.addFarmButton.click();
  }

  async openEditByFarmName(name: string): Promise<void> {
    const row = this.page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    const byHref = row.locator('a[href*="/edit/"]');
    if (await byHref.count()) {
      await byHref.click();
      return;
    }
    await row.getByRole("link", { name: /редагувати|edit/i }).click();
  }

  async deleteByFarmName(name: string): Promise<void> {
    const row = this.page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    this.page.once("dialog", (dialog) => dialog.accept());
    const byHref = row.locator('a[href*="/delete/"]');
    if (await byHref.count()) {
      await byHref.click();
      return;
    }
    await row.getByRole("link", { name: /видалити|delete/i }).click();
  }

  async expectFarmVisible(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toBeVisible();
  }

  async expectFarmHidden(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toHaveCount(0);
  }

  async getFarmIdByName(name: string): Promise<number | undefined> {
    const row = this.page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    let href = await row.locator('a[href*="/edit/"]').getAttribute("href");
    if (!href) {
      href = await row.getByRole("link", { name: /редагувати|edit/i }).getAttribute("href");
    }
    if (!href) return undefined;
    const idMatch = href.match(/\/farms\/edit\/(\d+)/);
    return idMatch ? Number(idMatch[1]) : undefined;
  }
}
