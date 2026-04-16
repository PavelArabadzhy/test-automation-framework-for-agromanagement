import { expect, Locator, Page } from "@playwright/test";

export class HarvestListPage {
  private readonly addHarvestButton: Locator;

  constructor(private readonly page: Page) {
    this.addHarvestButton = page.getByRole("link", { name: /додати (урожай|збір)|add harvest/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/harvests");
    await expect(this.addHarvestButton).toBeVisible();
  }

  async clickAddHarvest(): Promise<void> {
    await this.addHarvestButton.click();
  }

  async deleteByText(rowText: string): Promise<void> {
    const row = this.page.locator("tr", { hasText: rowText });
    await expect(row).toBeVisible();
    this.page.once("dialog", (dialog) => dialog.accept());
    const byHref = row.locator('a[href*="/delete/"]');
    if (await byHref.count()) {
      await byHref.click();
      return;
    }
    await row.getByRole("link", { name: /видалити|delete/i }).click();
  }

  async expectVisibleByText(rowText: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: rowText })).toBeVisible();
  }

  async expectHiddenByText(rowText: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: rowText })).toHaveCount(0);
  }

  async getHarvestIdByText(rowText: string): Promise<number | undefined> {
    const row = this.page.locator("tr", { hasText: rowText });
    await expect(row).toBeVisible();
    let href = await row.locator('a[href*="/edit/"]').getAttribute("href");
    if (!href) {
      href = await row.getByRole("link", { name: /редагувати|edit/i }).getAttribute("href");
    }
    if (!href) return undefined;
    const idMatch = href.match(/\/harvests\/edit\/(\d+)/);
    return idMatch ? Number(idMatch[1]) : undefined;
  }
}
