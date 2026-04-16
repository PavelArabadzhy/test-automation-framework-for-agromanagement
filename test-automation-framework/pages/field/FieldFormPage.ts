import { Locator, Page } from "@playwright/test";

export class FieldFormPage {
  private readonly nameInput: Locator;
  private readonly areaInput: Locator;
  private readonly farmSelect: Locator;
  private readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.locator('input[name="name"]');
    this.areaInput = page.locator('input[name="area"]');
    this.farmSelect = page.locator('select[name="farm.id"]');
    this.saveButton = page.getByRole("button", { name: /зберегти|save/i });
  }

  async open(): Promise<void> {
    await this.page.goto("/fields/add");
  }

  async expectFormVisible(): Promise<void> {
    await this.nameInput.waitFor({ state: "visible" });
  }

  async submit(name: string, area: number, farmId: number): Promise<void> {
    await this.nameInput.fill(name);
    await this.areaInput.fill(area.toString());
    await this.farmSelect.selectOption({ value: farmId.toString() });
    await this.saveButton.click();
  }
}
