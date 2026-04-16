import { FieldClient } from "../../../api/clients/FieldClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Field ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    expect(field.id).toBeTruthy();

    const foreignRead = await adminApiContext.get(`/api/fields/${field.id}`);
    expect([403, 404]).toContain(foreignRead.status());

    await ownerFieldClient.deleteField(field.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));

    const foreignUpdate = await adminApiContext.put(`/api/fields/${field.id}`, {
      data: FieldFactory.valid(farm.id!, { name: `${field.name}-x` })
    });
    expect([403, 404]).toContain(foreignUpdate.status());

    await ownerFieldClient.deleteField(field.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));

    const foreignDelete = await adminApiContext.delete(`/api/fields/${field.id}`);
    expect([403, 404]).toContain(foreignDelete.status());

    await ownerFieldClient.deleteField(field.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
