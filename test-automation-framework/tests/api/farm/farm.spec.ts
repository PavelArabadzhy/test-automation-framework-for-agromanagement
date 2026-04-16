import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/parseApiResponse";

test.describe("Farm API", () => {
  test("@api @regression should create farm", async ({ farmClient, dataRegistry }) => {
    const payload = FarmFactory.valid();
    const created = await farmClient.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
    expect(created.location).toBe(payload.location);
  });

  test("@api @regression should get farm by id", async ({ farmClient, dataRegistry, userApiContext }) => {
    const payload = FarmFactory.valid();
    const created = await farmClient.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    const byId = await userApiContext.get(`/api/farms/${created.id}`);
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(payload.name);
    expect(body.location).toBe(payload.location);
  });

  test("@api @regression should update farm", async ({ farmClient, dataRegistry }) => {
    const payload = FarmFactory.valid();
    const created = await farmClient.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    const updated = await farmClient.updateFarm(created.id!, {
      name: `${payload.name}-v2`,
      location: payload.location
    });
    expect(updated.name).toContain("-v2");
    expect(updated.id).toBe(created.id);
  });

  test("@api @regression should delete farm", async ({ farmClient }) => {
    const payload = FarmFactory.valid();
    const created = await farmClient.createFarm(payload);

    await farmClient.deleteFarm(created.id!);
    const afterDelete = await farmClient.getFarmById(created.id!);
    expect(afterDelete.status).toBe(404);
  });
});
