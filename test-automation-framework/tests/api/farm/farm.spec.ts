import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/api/parseApiResponse";

test.describe("Farm API", () => {
  test("@api @regression should create farm", async ({ farmController, dataRegistry }) => {
    // arrange
    const payload = FarmFactory.valid();

    // act
    const created = await farmController.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
    expect(created.location).toBe(payload.location);
  });

  test("@api @regression should get farm by id", async ({ farmController, dataRegistry, userApiContext }) => {
    // arrange
    const payload = FarmFactory.valid();
    const created = await farmController.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    // act
    const byId = await userApiContext.get(`/api/farms/${created.id}`);

    // assert
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(payload.name);
    expect(body.location).toBe(payload.location);
  });

  test("@api @regression should update farm", async ({ farmController, dataRegistry }) => {
    // arrange
    const payload = FarmFactory.valid();
    const created = await farmController.createFarm(payload);
    dataRegistry.registerFarmId(created.id);

    // act
    const updated = await farmController.updateFarm(created.id!, {
      name: `${payload.name}-v2`,
      location: payload.location
    });

    // assert
    expect(updated.name).toContain("-v2");
    expect(updated.id).toBe(created.id);
  });

  test("@api @regression should delete farm", async ({ farmController }) => {
    // arrange
    const payload = FarmFactory.valid();
    const created = await farmController.createFarm(payload);

    // act
    await farmController.deleteFarm(created.id!);
    const afterDelete = await farmController.getFarmById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
