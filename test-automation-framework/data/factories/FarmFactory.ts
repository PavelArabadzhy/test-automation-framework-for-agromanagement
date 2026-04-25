import { Farm } from "../../api/types/contracts";
import { randomSuffix } from "../../utils/data/random";

export class FarmFactory {
  static valid(overrides?: Partial<Farm>): Farm {
    return {
      name: randomSuffix("farm"),
      location: randomSuffix("location"),
      ...overrides
    };
  }
}
