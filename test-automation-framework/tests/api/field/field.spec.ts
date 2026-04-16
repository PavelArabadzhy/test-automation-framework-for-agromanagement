import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/parseApiResponse";

test.describe("Field API", () => {
  test("@api @regression should create field", async ({ farmClient, fieldClient, dataRegistry }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const payload = FieldFactory.valid(farm.id!);

    const created = await fieldClient.createField(payload);
    dataRegistry.registerFieldId(created.id);

    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
  });

  test("@api @regression should get field by id", async ({ farmClient, fieldClient, dataRegistry, userApiContext }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldClient.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(created.id);

    const byId = await userApiContext.get(`/api/fields/${created.id}`);
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
  });

  test("@api @regression should update field", async ({ farmClient, fieldClient, dataRegistry }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldClient.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(created.id);

    const updated = await fieldClient.updateField(created.id!, FieldFactory.valid(farm.id!, { name: `${created.name}-v2` }));
    expect(updated.id).toBe(created.id);
    expect(updated.name).toContain("-v2");
  });

  test("@api @regression should delete field", async ({ farmClient, fieldClient, dataRegistry }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldClient.createField(FieldFactory.valid(farm.id!));

    await fieldClient.deleteField(created.id!);
    const afterDelete = await fieldClient.getFieldById(created.id!);
    expect(afterDelete.status).toBe(404);
  });
});
