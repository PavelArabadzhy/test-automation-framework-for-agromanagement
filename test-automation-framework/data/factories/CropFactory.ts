import { Crop } from "../../api/types/contracts";
import { randomSuffix } from "../../utils/data/random";

export class CropFactory {
  static valid(overrides?: Partial<Crop>): Crop {
    return {
      name: randomSuffix("crop"),
      expectedYield: 40.5,
      ...overrides
    };
  }
}
