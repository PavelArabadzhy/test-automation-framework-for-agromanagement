import { CropController } from "../../../api/controllers/CropController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { HarvestController } from "../../../api/controllers/HarvestController";
import { PlantingController } from "../../../api/controllers/PlantingController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Harvest ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const ownerCropController = new CropController(userApiContext);
    const ownerPlantingController = new PlantingController(userApiContext);
    const ownerHarvestController = new HarvestController(userApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestController.createHarvest(HarvestFactory.valid(planting.id!));
    // act
    const foreignRead = await adminApiContext.get(`/api/harvests/${harvest.id}`);

    // assert
    expect(harvest.id).toBeTruthy();
    expectForbiddenOrNotFound(foreignRead.status());

    await ownerHarvestController.deleteHarvest(harvest.id!);
    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const ownerCropController = new CropController(userApiContext);
    const ownerPlantingController = new PlantingController(userApiContext);
    const ownerHarvestController = new HarvestController(userApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestController.createHarvest(HarvestFactory.valid(planting.id!));

    // act
    const foreignUpdate = await adminApiContext.put(`/api/harvests/${harvest.id}`, {
      data: HarvestFactory.valid(planting.id!, { yieldAmount: 77.7 })
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerHarvestController.deleteHarvest(harvest.id!);
    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const ownerCropController = new CropController(userApiContext);
    const ownerPlantingController = new PlantingController(userApiContext);
    const ownerHarvestController = new HarvestController(userApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestController.createHarvest(HarvestFactory.valid(planting.id!));

    // act
    const foreignDelete = await adminApiContext.delete(`/api/harvests/${harvest.id}`);

    // assert
    expectForbiddenOrNotFound(foreignDelete.status());

    await ownerHarvestController.deleteHarvest(harvest.id!);
    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
