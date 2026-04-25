import { Locator, Page } from "@playwright/test";

export class CropFormPage {
  private readonly nameInput: Locator;
  private readonly expectedYieldInput: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.locator('input[name="name"]');
    this.expectedYieldInput = page.locator('input[name="expectedYield"]');
    this.saveButton = page.getByRole("button", { name: /зберегти|save/i });
  }

  async submit(name: string, expectedYield: number): Promise<void> {
    await this.nameInput.fill(name);
    await this.expectedYieldInput.fill(expectedYield.toString());
    await this.saveButton.click();
  }
}
