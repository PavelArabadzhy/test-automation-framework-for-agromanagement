import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { setupFieldAndCrop, test, expect } from "../../../fixtures/domain.fixture";

test.describe("Planting API", () => {
  test("@api @regression should create planting", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const payload = PlantingFactory.valid(fieldId, cropId);

    // act
    const created = await plantingClient.createPlanting(payload);
    dataRegistry.registerPlantingId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.plantingDate).toBe(payload.plantingDate);
  });

  test("@api @regression should get planting by id", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry,
    userApiContext
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const created = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));
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
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const created = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));
    dataRegistry.registerPlantingId(created.id);

    // act
    const updated = await plantingClient.updatePlanting(
      created.id!,
      PlantingFactory.valid(fieldId, cropId, { expectedHarvestDate: "2026-10-10" })
    );

    // assert
    expect(updated.id).toBe(created.id);
    expect(updated.expectedHarvestDate).toBe("2026-10-10");
  });

  test("@api @regression should delete planting", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const created = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));

    // act
    await plantingClient.deletePlanting(created.id!);
    const afterDelete = await plantingClient.getPlantingById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
