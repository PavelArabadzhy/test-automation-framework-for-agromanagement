import { test, expect } from "../../../fixtures/base.fixture";

test.describe("Health API", () => {
  test("@api @smoke should keep auth and protected api invariants", async ({ request, env }) => {
    const loginPage = await request.get(`${env.apiBaseUrl}/login`);
    expect(loginPage.status()).toBe(200);
    expect(await loginPage.text()).toContain("username");

    const farmsApi = await request.get(`${env.apiBaseUrl}/api/farms`, { maxRedirects: 0 });
    expect([302, 401, 403]).toContain(farmsApi.status());
  });
});
