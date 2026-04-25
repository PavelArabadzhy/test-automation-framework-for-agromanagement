import { Harvest } from "../../api/types/contracts";

export class HarvestFactory {
  static valid(plantingId: number, overrides?: Partial<Harvest>): Harvest {
    const day = ((Date.now() + Math.floor(Math.random() * 1000)) % 27) + 1;
    return {
      planting: { id: plantingId },
      harvestDate: `2026-10-${String(day).padStart(2, "0")}`,
      yieldAmount: Number(`25.${(Date.now() % 90) + 10}`),
      ...overrides
    };
  }
}
