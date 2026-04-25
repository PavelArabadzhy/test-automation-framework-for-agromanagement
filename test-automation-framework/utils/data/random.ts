import { ENV } from "../../config/env";

export function randomSuffix(prefix: string): string {
  return `${ENV.testDataPrefix}-${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}
