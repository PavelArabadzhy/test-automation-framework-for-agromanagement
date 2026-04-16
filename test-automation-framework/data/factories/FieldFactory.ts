import { Field } from "../../api/types/domain";
import { randomSuffix } from "../../utils/random";

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
