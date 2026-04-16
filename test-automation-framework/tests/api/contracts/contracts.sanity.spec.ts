import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test as domainTest, expect, setupPlanting } from "../../../fixtures/domain.fixture";

domainTest.describe("API contract sanity", () => {
  domainTest("@api @regression should return key fields for farm get/list", async ({ farmClient, dataRegistry, userApiContext }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);

    const byId = await farmClient.getFarmById(farm.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.location).toBe("string");

    const list = await userApiContext.get("/api/farms");
    expect(list.status()).toBe(200);
    const rawList = await list.text();
    expect(rawList).toMatch(/"id"\s*:/);
    expect(rawList).toMatch(/"name"\s*:/);
    expect(rawList).toMatch(/"location"\s*:/);
  });

  domainTest("@api @regression should return key fields for field get/list", async ({ farmClient, fieldClient, dataRegistry, userApiContext }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const field = await fieldClient.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(field.id);

    const byId = await fieldClient.getFieldById(field.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.area).toBe("number");

    const list = await userApiContext.get("/api/fields");
    expect(list.status()).toBe(200);
    const rawList = await list.text();
    expect(rawList).toMatch(/"id"\s*:/);
    expect(rawList).toMatch(/"name"\s*:/);
    expect(rawList).toMatch(/"area"\s*:/);
  });

  domainTest("@api @regression should return key fields for crop get/list", async ({ cropClient, dataRegistry, userApiContext }) => {
    const crop = await cropClient.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(crop.id);

    const byId = await cropClient.getCropById(crop.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.expectedYield).toBe("number");

    const list = await userApiContext.get("/api/crops");
    expect(list.status()).toBe(200);
    const rawList = await list.text();
    expect(rawList).toMatch(/"id"\s*:/);
    expect(rawList).toMatch(/"name"\s*:/);
    expect(rawList).toMatch(/"expectedYield"\s*:/);
  });

  domainTest("@api @regression should return key fields for planting get/list", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry,
    userApiContext
  }) => {
    const farm = await farmClient.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const field = await fieldClient.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(field.id);
    const crop = await cropClient.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(crop.id);
    const planting = await plantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    dataRegistry.registerPlantingId(planting.id);

    const byId = await plantingClient.getPlantingById(planting.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.plantingDate).toBe("string");
    expect(typeof byId.body?.expectedHarvestDate).toBe("string");

    const list = await userApiContext.get("/api/plantings");
    expect(list.status()).toBe(200);
    const rawList = await list.text();
    expect(rawList).toMatch(/"id"\s*:/);
    expect(rawList).toMatch(/"plantingDate"\s*:/);
    expect(rawList).toMatch(/"expectedHarvestDate"\s*:/);
  });

  domainTest("@api @regression should return key fields for harvest get/list", async ({
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry,
    userApiContext
  }) => {
    const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
    const harvest = await harvestClient.createHarvest(HarvestFactory.valid(plantingId));
    dataRegistry.registerHarvestId(harvest.id);

    const byId = await harvestClient.getHarvestById(harvest.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");

    const list = await userApiContext.get("/api/harvests");
    expect(list.status()).toBe(200);
    const rawList = await list.text();
    expect(rawList).toMatch(/"id"\s*:/);
    expect(rawList).toMatch(/"harvestDate"\s*:/);
    expect(rawList).toMatch(/"yieldAmount"\s*:/);
  });
});
