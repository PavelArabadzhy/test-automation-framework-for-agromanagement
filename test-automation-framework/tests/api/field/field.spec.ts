import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/api/parseApiResponse";

test.describe("Field API", () => {
  test("@api @regression should create field", async ({ farmController, fieldController, dataRegistry }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const payload = FieldFactory.valid(farm.id!);

    // act
    const created = await fieldController.createField(payload);
    dataRegistry.registerFieldId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
  });

  test("@api @regression should get field by id", async ({ farmController, fieldController, dataRegistry, userApiContext }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldController.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(created.id);

    // act
    const byId = await userApiContext.get(`/api/fields/${created.id}`);

    // assert
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
  });

  test("@api @regression should update field", async ({ farmController, fieldController, dataRegistry }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldController.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(created.id);

    // act
    const updated = await fieldController.updateField(created.id!, FieldFactory.valid(farm.id!, { name: `${created.name}-v2` }));

    // assert
    expect(updated.id).toBe(created.id);
    expect(updated.name).toContain("-v2");
  });

  test("@api @regression should delete field", async ({ farmController, fieldController, dataRegistry }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldController.createField(FieldFactory.valid(farm.id!));

    // act
    await fieldController.deleteField(created.id!);
    const afterDelete = await fieldController.getFieldById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
