import { APIRequestContext, request } from "@playwright/test";
import { AuthController } from "../api/controllers/AuthController";
import { test as base } from "./base.fixture";

type AuthFixtures = {
  userApiContext: APIRequestContext;
  adminApiContext: APIRequestContext;
};

async function createAuthenticatedApiContext(
  baseURL: string,
  username: string,
  password: string
): Promise<APIRequestContext> {
  const bootstrapContext = await request.newContext({ baseURL });
  const authController = new AuthController(bootstrapContext);
  await authController.loginWithFormSession({ username, password });

  // Extract CSRF token from a Thymeleaf form page after authentication.
  const formPageResponse = await bootstrapContext.get("/farms/add");
  if (formPageResponse.status() !== 200) {
    throw new Error(`Unable to open CSRF source page, status=${formPageResponse.status()}`);
  }
  const html = await formPageResponse.text();
  const tokenMatch = html.match(/name="_csrf"\s+value="([^"]+)"/);
  if (!tokenMatch) {
    throw new Error("CSRF token was not found in /farms/add page");
  }
  const csrfToken = tokenMatch[1];

  const state = await bootstrapContext.storageState();
  await bootstrapContext.dispose();

  return request.newContext({
    baseURL,
    storageState: state,
    extraHTTPHeaders: {
      "X-CSRF-TOKEN": csrfToken
    }
  });
}

export const test = base.extend<AuthFixtures>({
  userApiContext: async ({ env }, use) => {
    const context = await createAuthenticatedApiContext(env.apiBaseUrl, env.userUsername, env.userPassword);
    await use(context);
    await context.dispose();
  },
  adminApiContext: async ({ env }, use) => {
    const context = await createAuthenticatedApiContext(env.apiBaseUrl, env.adminUsername, env.adminPassword);
    await use(context);
    await context.dispose();
  }
});

export { expect } from "./base.fixture";
