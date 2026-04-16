import { Farm } from "../../api/types/domain";
import { randomSuffix } from "../../utils/random";

export class FarmFactory {
  static valid(overrides?: Partial<Farm>): Farm {
    return {
      name: randomSuffix("farm"),
      location: randomSuffix("location"),
      ...overrides
    };
  }
}
