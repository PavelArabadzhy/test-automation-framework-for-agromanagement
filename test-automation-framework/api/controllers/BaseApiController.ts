import { APIRequestContext, expect } from "@playwright/test";

export class BaseApiController {
  constructor(protected readonly request: APIRequestContext) {}

  protected async expectStatus(response: { status(): number }, expectedStatus: number): Promise<void> {
    expect(response.status(), "Unexpected status code").toBe(expectedStatus);
  }
}
