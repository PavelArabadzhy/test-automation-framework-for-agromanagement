import { APIRequestContext, request } from "@playwright/test";
import { AuthClient } from "../api/clients/AuthClient";
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
  const authClient = new AuthClient(bootstrapContext);
  await authClient.loginWithFormSession({ username, password });

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
