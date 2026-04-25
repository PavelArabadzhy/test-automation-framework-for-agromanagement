import { request } from "@playwright/test";
import { AuthController } from "../../api/controllers/AuthController";
import { ENV, assertRequiredEnv } from "../../config/env";

async function createAuthenticatedAdminContext() {
  const bootstrap = await request.newContext({ baseURL: ENV.apiBaseUrl });
  const authController = new AuthController(bootstrap);
  await authController.loginWithFormSession({
    username: ENV.adminUsername,
    password: ENV.adminPassword
  });

  const formPage = await bootstrap.get("/farms/add");
  const html = await formPage.text();
  const csrf = html.match(/name="_csrf"\s+value="([^"]+)"/)?.[1];
  if (!csrf) {
    throw new Error("Unable to extract CSRF token for cleanup");
  }

  const state = await bootstrap.storageState();
  await bootstrap.dispose();

  return request.newContext({
    baseURL: ENV.apiBaseUrl,
    storageState: state,
    extraHTTPHeaders: {
      "X-CSRF-TOKEN": csrf
    }
  });
}

async function cleanupByPrefix() {
  assertRequiredEnv();
  const api = await createAuthenticatedAdminContext();
  const prefix = `${ENV.testDataPrefix}-`;

  const farms = (await (await api.get("/api/farms")).json()) as Array<{ id?: number; name?: string }>;
  const farmIds = farms.filter((item) => item?.name?.startsWith(prefix)).map((item) => Number(item.id));

  for (const farmId of farmIds) {
    await api.delete(`/api/farms/${farmId}`);
  }

  const crops = (await (await api.get("/api/crops")).json()) as Array<{ id?: number; name?: string }>;
  const cropIds = crops.filter((item) => item?.name?.startsWith(prefix)).map((item) => Number(item.id));

  for (const cropId of cropIds) {
    await api.delete(`/api/crops/${cropId}`);
  }

  const fields = (await (await api.get("/api/fields")).json()) as Array<{ id?: number; name?: string }>;
  const fieldIds = fields.filter((item) => item?.name?.startsWith(prefix)).map((item) => Number(item.id));

  for (const fieldId of fieldIds) {
    await api.delete(`/api/fields/${fieldId}`);
  }

  await api.dispose();
}

cleanupByPrefix().catch((err) => {
  console.error("cleanupTestData failed:", err);
  process.exitCode = 1;
});
