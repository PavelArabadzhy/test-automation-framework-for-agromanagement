import { Planting } from "../../api/types/contracts";

export class PlantingFactory {
  static valid(fieldId: number, cropId: number, overrides?: Partial<Planting>): Planting {
    const day = ((Date.now() + Math.floor(Math.random() * 1000)) % 27) + 1;
    const harvestDay = Math.min(day + 10, 28);
    return {
      plantingDate: `2026-03-${String(day).padStart(2, "0")}`,
      expectedHarvestDate: `2026-09-${String(harvestDay).padStart(2, "0")}`,
      field: { id: fieldId },
      crop: { id: cropId },
      ...overrides
    };
  }
}
