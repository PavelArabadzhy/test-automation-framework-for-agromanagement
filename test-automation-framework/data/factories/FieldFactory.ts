import { Field } from "../../api/types/contracts";
import { randomSuffix } from "../../utils/data/random";

export class FieldFactory {
  static valid(farmId: number, overrides?: Partial<Field>): Field {
    return {
      name: randomSuffix("field"),
      area: 12.5,
      farm: { id: farmId },
      ...overrides
    };
  }
}
