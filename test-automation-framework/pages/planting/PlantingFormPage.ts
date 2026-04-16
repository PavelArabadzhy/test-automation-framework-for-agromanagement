import { Locator, Page } from "@playwright/test";

export class PlantingFormPage {
  private readonly fieldSelect: Locator;
  private readonly cropSelect: Locator;
  private readonly plantingDateInput: Locator;
  private readonly expectedHarvestDateInput: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.fieldSelect = page.locator('select[name="field.id"]');
    this.cropSelect = page.locator('select[name="crop.id"]');
    this.plantingDateInput = page.locator('input[name="plantingDate"]');
    this.expectedHarvestDateInput = page.locator('input[name="expectedHarvestDate"]');
    this.saveButton = page.getByRole("button", { name: /зберегти|save/i });
  }

  async submit(fieldId: number, cropId: number, plantingDate: string, expectedHarvestDate: string): Promise<void> {
    await this.fieldSelect.selectOption({ value: fieldId.toString() });
    await this.cropSelect.selectOption({ value: cropId.toString() });
    await this.plantingDateInput.fill(plantingDate);
    await this.expectedHarvestDateInput.fill(expectedHarvestDate);
    await this.saveButton.click();
  }
}
