import { expect, Locator, Page } from "@playwright/test";

export class FarmFormPage {
  private readonly nameInput: Locator;
  private readonly locationInput: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.locator('input[name="name"]');
    this.locationInput = page.locator('input[name="location"]');
    this.saveButton = page.getByRole("button", { name: /зберегти|save/i });
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.nameInput).toBeVisible();
    await expect(this.locationInput).toBeVisible();
  }

  async submit(name: string, location: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.locationInput.fill(location);
    await this.saveButton.click();
  }
}
