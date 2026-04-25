import { expect } from "@playwright/test";

export function expectForbiddenOrNotFound(status: number): void {
  expect([403, 404]).toContain(status);
}
