import { expect, Locator, Page } from "@playwright/test";

export class CropListPage {
  private readonly addCropButton: Locator;

  constructor(private readonly page: Page) {
    this.addCropButton = page.getByRole("link", { name: /додати культуру|add crop/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/crops");
    await expect(this.addCropButton).toBeVisible();
  }

  async clickAddCrop(): Promise<void> {
    await this.addCropButton.click();
  }

  async deleteByCropName(name: string): Promise<void> {
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

  async expectCropVisible(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toBeVisible();
  }

  async expectCropHidden(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toHaveCount(0);
  }

  async getCropIdByName(name: string): Promise<number | undefined> {
    const row = this.page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    let href = await row.locator('a[href*="/edit/"]').getAttribute("href");
    if (!href) {
      href = await row.getByRole("link", { name: /редагувати|edit/i }).getAttribute("href");
    }
    if (!href) return undefined;
    const idMatch = href.match(/\/crops\/edit\/(\d+)/);
    return idMatch ? Number(idMatch[1]) : undefined;
  }
}
