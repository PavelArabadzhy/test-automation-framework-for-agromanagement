import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { setupPlanting, test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/parseApiResponse";

test.describe("Harvest API", () => {
  test("@api @regression should create harvest", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry
  }) => {
    // arrange
    const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
    const payload = HarvestFactory.valid(plantingId);

    // act
    const created = await harvestClient.createHarvest(payload);
    dataRegistry.registerHarvestId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.harvestDate).toBe(payload.harvestDate);
  });

  test("@api @regression should get harvest by id", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry,
    userApiContext
  }) => {
    // arrange
    const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
    const created = await harvestClient.createHarvest(HarvestFactory.valid(plantingId));
    dataRegistry.registerHarvestId(created.id);

    // act
    const byId = await userApiContext.get(`/api/harvests/${created.id}`);

    // assert
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.harvestDate).toBe(created.harvestDate);
  });

  test("@api @regression should update harvest", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry
  }) => {
    // arrange
    const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
    const created = await harvestClient.createHarvest(HarvestFactory.valid(plantingId));
    dataRegistry.registerHarvestId(created.id);

    // act
    const updated = await harvestClient.updateHarvest(created.id!, HarvestFactory.valid(plantingId, { yieldAmount: 31.2 }));

    // assert
    expect(updated.id).toBe(created.id);
    expect(updated.yieldAmount).toBe(31.2);
  });

  test("@api @regression should delete harvest", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry
  }) => {
    // arrange
    const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
    const created = await harvestClient.createHarvest(HarvestFactory.valid(plantingId));

    // act
    await harvestClient.deleteHarvest(created.id!);
    const afterDelete = await harvestClient.getHarvestById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
