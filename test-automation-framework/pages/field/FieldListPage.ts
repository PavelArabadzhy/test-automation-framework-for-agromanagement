import { expect, Locator, Page } from "@playwright/test";

export class FieldListPage {
  private readonly addFieldButton: Locator;

  constructor(private readonly page: Page) {
    this.addFieldButton = page.getByRole("link", { name: /додати поле|add field/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/fields");
    await expect(this.addFieldButton).toBeVisible();
  }

  async clickAddField(): Promise<void> {
    await this.addFieldButton.click();
  }

  async deleteByFieldName(name: string): Promise<void> {
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

  async expectFieldVisible(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toBeVisible();
  }

  async expectFieldHidden(name: string): Promise<void> {
    await expect(this.page.locator("tr", { hasText: name })).toHaveCount(0);
  }

  async getFieldIdByName(name: string): Promise<number | undefined> {
    const row = this.page.locator("tr", { hasText: name });
    await expect(row).toBeVisible();
    let href = await row.locator('a[href*="/edit/"]').getAttribute("href");
    if (!href) {
      href = await row.getByRole("link", { name: /редагувати|edit/i }).getAttribute("href");
    }
    if (!href) return undefined;
    const idMatch = href.match(/\/fields\/edit\/(\d+)/);
    return idMatch ? Number(idMatch[1]) : undefined;
  }
}
