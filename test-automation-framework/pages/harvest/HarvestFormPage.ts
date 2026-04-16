import { Locator, Page } from "@playwright/test";

export class HarvestFormPage {
  private readonly plantingSelect: Locator;
  private readonly harvestDateInput: Locator;
  private readonly yieldAmountInput: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.plantingSelect = page.locator('select[name="planting.id"]');
    this.harvestDateInput = page.locator('input[name="harvestDate"]');
    this.yieldAmountInput = page.locator('input[name="yieldAmount"]');
    this.saveButton = page.getByRole("button", { name: /зберегти|save/i });
  }

  async submit(plantingId: number, harvestDate: string, yieldAmount: number): Promise<void> {
    await this.plantingSelect.selectOption({ value: plantingId.toString() });
    await this.harvestDateInput.fill(harvestDate);
    await this.yieldAmountInput.fill(yieldAmount.toString());
    await this.saveButton.click();
  }
}
