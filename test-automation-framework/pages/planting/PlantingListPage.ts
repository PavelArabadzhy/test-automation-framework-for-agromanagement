import { expect, Locator, Page } from "@playwright/test";

export class PlantingListPage {
  private readonly addPlantingButton: Locator;

  constructor(private readonly page: Page) {
    this.addPlantingButton = page.getByRole("link", { name: /додати (посів|посадку)|add planting/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/plantings");
    await expect(this.addPlantingButton).toBeVisible();
  }

  async clickAddPlanting(): Promise<void> {
    await this.addPlantingButton.click();
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

  async getPlantingIdByText(rowText: string): Promise<number | undefined> {
    const row = this.page.locator("tr", { hasText: rowText });
    await expect(row).toBeVisible();
    let href = await row.locator('a[href*="/edit/"]').getAttribute("href");
    if (!href) {
      href = await row.getByRole("link", { name: /редагувати|edit/i }).getAttribute("href");
    }
    if (!href) return undefined;
    const idMatch = href.match(/\/plantings\/edit\/(\d+)/);
    return idMatch ? Number(idMatch[1]) : undefined;
  }
}
