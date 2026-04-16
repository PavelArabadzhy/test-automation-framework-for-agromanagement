import { Crop } from "../../api/types/domain";
import { randomSuffix } from "../../utils/random";

export class CropFactory {
  static valid(overrides?: Partial<Crop>): Crop {
    return {
      name: randomSuffix("crop"),
      expectedYield: 40.5,
      ...overrides
    };
  }
}
