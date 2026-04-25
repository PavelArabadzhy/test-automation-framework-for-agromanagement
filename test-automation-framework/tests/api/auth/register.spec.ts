import { test, expect } from "../../../fixtures/base.fixture";
import { randomSuffix } from "../../../utils/data/random";

test.describe("Auth Register API", () => {
  test("@api @regression should redirect anonymous register api request to login", async ({ request, env }) => {
    // arrange
    const username = randomSuffix("register-api");
    const payload = {
      username,
      password: "Passw0rd!"
    };

    // act
    const response = await request.post(`${env.apiBaseUrl}/api/auth/register`, {
      data: payload,
      maxRedirects: 0
    });

    // assert
    expect(response.status()).toBe(302);
    expect(response.headers()["location"] ?? "").toContain("/login");
  });

  test("@api @regression should redirect duplicate register api request to login", async ({ request, env }) => {
    // arrange
    const payload = {
      username: env.userUsername,
      password: "Passw0rd!"
    };

    // act
    const response = await request.post(`${env.apiBaseUrl}/api/auth/register`, {
      data: payload,
      maxRedirects: 0
    });

    // assert
    expect(response.status()).toBe(302);
    expect(response.headers()["location"] ?? "").toContain("/login");
  });
});
