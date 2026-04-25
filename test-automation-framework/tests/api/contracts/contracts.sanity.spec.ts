import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test as domainTest, expect, setupPlanting } from "../../../fixtures/domain.fixture";

domainTest.describe("API contract sanity", () => {
  domainTest("@api @regression should return key fields for farm get/list", async ({ farmController, dataRegistry, userApiContext }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);

    // act
    const byId = await farmController.getFarmById(farm.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.location).toBe("string");

    const list = await userApiContext.get("/api/farms");

    // assert
    expect(list.status()).toBe(200);
    const listBody = (await list.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(listBody)).toBeTruthy();
    expect(listBody.length).toBeGreaterThan(0);
    expect(typeof listBody[0]?.id).toBe("number");
    expect(typeof listBody[0]?.name).toBe("string");
    expect(typeof listBody[0]?.location).toBe("string");
  });

  domainTest("@api @regression should return key fields for field get/list", async ({ farmController, fieldController, dataRegistry, userApiContext }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const field = await fieldController.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(field.id);

    // act
    const byId = await fieldController.getFieldById(field.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.area).toBe("number");

    const list = await userApiContext.get("/api/fields");

    // assert
    expect(list.status()).toBe(200);
    const listBody = (await list.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(listBody)).toBeTruthy();
    expect(listBody.length).toBeGreaterThan(0);
    expect(typeof listBody[0]?.id).toBe("number");
    expect(typeof listBody[0]?.name).toBe("string");
    expect(typeof listBody[0]?.area).toBe("number");
  });

  domainTest("@api @regression should return key fields for crop get/list", async ({ cropController, dataRegistry, userApiContext }) => {
    // arrange
    const crop = await cropController.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(crop.id);

    // act
    const byId = await cropController.getCropById(crop.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.name).toBe("string");
    expect(typeof byId.body?.expectedYield).toBe("number");

    const list = await userApiContext.get("/api/crops");

    // assert
    expect(list.status()).toBe(200);
    const listBody = (await list.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(listBody)).toBeTruthy();
    expect(listBody.length).toBeGreaterThan(0);
    expect(typeof listBody[0]?.id).toBe("number");
    expect(typeof listBody[0]?.name).toBe("string");
    expect(typeof listBody[0]?.expectedYield).toBe("number");
  });

  domainTest("@api @regression should return key fields for planting get/list", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    dataRegistry,
    userApiContext
  }) => {
    // arrange
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const field = await fieldController.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(field.id);
    const crop = await cropController.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(crop.id);
    const planting = await plantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    dataRegistry.registerPlantingId(planting.id);

    // act
    const byId = await plantingController.getPlantingById(planting.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");
    expect(typeof byId.body?.plantingDate).toBe("string");
    expect(typeof byId.body?.expectedHarvestDate).toBe("string");

    const list = await userApiContext.get("/api/plantings");

    // assert
    expect(list.status()).toBe(200);
    const listBody = (await list.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(listBody)).toBeTruthy();
    expect(listBody.length).toBeGreaterThan(0);
    expect(typeof listBody[0]?.id).toBe("number");
    expect(typeof listBody[0]?.plantingDate).toBe("string");
    expect(typeof listBody[0]?.expectedHarvestDate).toBe("string");
  });

  domainTest("@api @regression should return key fields for harvest get/list", async ({
    farmController,
    fieldController,
    cropController,
    plantingController,
    harvestController,
    dataRegistry,
    userApiContext
  }) => {
    // arrange
    const { plantingId } = await setupPlanting(farmController, fieldController, cropController, plantingController, dataRegistry);
    const harvest = await harvestController.createHarvest(HarvestFactory.valid(plantingId));
    dataRegistry.registerHarvestId(harvest.id);

    // act
    const byId = await harvestController.getHarvestById(harvest.id!);
    expect(byId.status).toBe(200);
    expect(typeof byId.body?.id).toBe("number");

    const list = await userApiContext.get("/api/harvests");

    // assert
    expect(list.status()).toBe(200);
    const listBody = (await list.json()) as Array<Record<string, unknown>>;
    expect(Array.isArray(listBody)).toBeTruthy();
    expect(listBody.length).toBeGreaterThan(0);
    expect(typeof listBody[0]?.id).toBe("number");
    expect(typeof listBody[0]?.harvestDate).toBe("string");
    expect(typeof listBody[0]?.yieldAmount).toBe("number");
  });
});
