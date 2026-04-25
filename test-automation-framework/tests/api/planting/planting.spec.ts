import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { setupFieldAndCrop, test, expect } from "../../../fixtures/domain.fixture";

test.describe("Planting API", () => {
  test("@api @regression should create planting", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmController, fieldController, cropController, dataRegistry);
    const payload = PlantingFactory.valid(fieldId, cropId);

    // act
    const created = await plantingController.createPlanting(payload);
    dataRegistry.registerPlantingId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.plantingDate).toBe(payload.plantingDate);
  });

  test("@api @regression should get planting by id", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    dataRegistry,
    userApiContext
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmController, fieldController, cropController, dataRegistry);
    const created = await plantingController.createPlanting(PlantingFactory.valid(fieldId, cropId));
    dataRegistry.registerPlantingId(created.id);

    // act
    const byId = await userApiContext.get(`/api/plantings/${created.id}`);

    // assert
    expect(byId.status()).toBe(200);
    const body = await byId.json();
    expect(body.id).toBe(created.id);
    expect(body.plantingDate).toBe(created.plantingDate);
  });

  test("@api @regression should update planting", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmController, fieldController, cropController, dataRegistry);
    const created = await plantingController.createPlanting(PlantingFactory.valid(fieldId, cropId));
    dataRegistry.registerPlantingId(created.id);

    // act
    const updated = await plantingController.updatePlanting(
      created.id!,
      PlantingFactory.valid(fieldId, cropId, { expectedHarvestDate: "2026-10-10" })
    );

    // assert
    expect(updated.id).toBe(created.id);
    expect(updated.expectedHarvestDate).toBe("2026-10-10");
  });

  test("@api @regression should delete planting", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmController, fieldController, cropController, dataRegistry);
    const created = await plantingController.createPlanting(PlantingFactory.valid(fieldId, cropId));

    // act
    await plantingController.deletePlanting(created.id!);
    const afterDelete = await plantingController.getPlantingById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
