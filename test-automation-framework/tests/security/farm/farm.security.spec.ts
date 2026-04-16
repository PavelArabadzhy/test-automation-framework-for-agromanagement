import { FarmClient } from "../../../api/clients/FarmClient";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Farm ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new FarmClient(userApiContext);
    const foreignClient = new FarmClient(adminApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    expect(farm.id).toBeTruthy();
    const foreignRead = await foreignClient.getFarmById(farm.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new FarmClient(userApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    const foreignUpdate = await adminApiContext.put(`/api/farms/${farm.id}`, {
      data: FarmFactory.valid({ name: `${farm.name}-x` })
    });
    expect([403, 404]).toContain(foreignUpdate.status());

    await ownerClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new FarmClient(userApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    const foreignDelete = await adminApiContext.delete(`/api/farms/${farm.id}`);
    expect([403, 404]).toContain(foreignDelete.status());

    await ownerClient.deleteFarm(farm.id!);
  });
});
