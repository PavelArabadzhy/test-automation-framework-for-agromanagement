import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { ApiResponseMessage, LoginRequest } from "../types/contracts";

export class AuthController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async loginViaApi(payload: LoginRequest): Promise<ApiResponseMessage> {
    const response = await this.request.post("/api/auth/login", {
      data: payload
    });
    await this.expectStatus(response, 200);
    return response.json();
  }

  async loginWithFormSession(payload: LoginRequest): Promise<void> {
    const loginPage = await this.request.get("/login");
    await this.expectStatus(loginPage, 200);
    const html = await loginPage.text();
    const tokenMatch = html.match(/name="_csrf"\s+value="([^"]+)"/);
    if (!tokenMatch) {
      throw new Error("CSRF token was not found on /login");
    }
    const csrfToken = tokenMatch[1];

    const response = await this.request.post("/login", {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      maxRedirects: 0,
      form: {
        username: payload.username,
        password: payload.password,
        _csrf: csrfToken
      }
    });

    if (response.status() !== 302) {
      throw new Error(`Expected 302 after form login, got ${response.status()}`);
    }
    const location = response.headers()["location"] ?? "";
    if (location.includes("/login")) {
      throw new Error(`Form login failed for user '${payload.username}', redirected to ${location}`);
    }
  }
}
