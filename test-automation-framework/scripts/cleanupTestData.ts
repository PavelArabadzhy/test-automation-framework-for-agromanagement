import { request } from "@playwright/test";
import { AuthClient } from "../api/clients/AuthClient";
import { ENV, assertRequiredEnv } from "../config/env";

async function createAuthenticatedAdminContext() {
  const bootstrap = await request.newContext({ baseURL: ENV.apiBaseUrl });
  const authClient = new AuthClient(bootstrap);
  await authClient.loginWithFormSession({
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

  const farmsRaw = await (await api.get("/api/farms")).text();
  const farmMatches = [...farmsRaw.matchAll(/"id":(\d+),"name":"([^"]*)","location":"([^"]*)"/g)];
  const farmIds = farmMatches.filter((m) => m[2].startsWith(prefix)).map((m) => Number(m[1]));

  for (const farmId of farmIds) {
    await api.delete(`/api/farms/${farmId}`);
  }

  const cropsRaw = await (await api.get("/api/crops")).text();
  const cropMatches = [...cropsRaw.matchAll(/"id":(\d+),"name":"([^"]*)","expectedYield":([0-9.]+)/g)];
  const cropIds = cropMatches.filter((m) => m[2].startsWith(prefix)).map((m) => Number(m[1]));

  for (const cropId of cropIds) {
    await api.delete(`/api/crops/${cropId}`);
  }

  const fieldsRaw = await (await api.get("/api/fields")).text();
  const fieldMatches = [...fieldsRaw.matchAll(/"id":(\d+),"name":"([^"]*)","area":([0-9.]+)/g)];
  const fieldIds = fieldMatches.filter((m) => m[2].startsWith(prefix)).map((m) => Number(m[1]));

  for (const fieldId of fieldIds) {
    await api.delete(`/api/fields/${fieldId}`);
  }

  await api.dispose();
}

cleanupByPrefix().catch((err) => {
  console.error("cleanupTestData failed:", err);
  process.exitCode = 1;
});
