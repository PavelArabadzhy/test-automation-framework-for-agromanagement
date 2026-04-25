import { CropController } from "../../../api/controllers/CropController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { PlantingController } from "../../../api/controllers/PlantingController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Planting ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const ownerCropController = new CropController(userApiContext);
    const ownerPlantingController = new PlantingController(userApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    // act
    const foreignRead = await adminApiContext.get(`/api/plantings/${planting.id}`);

    // assert
    expect(planting.id).toBeTruthy();
    expectForbiddenOrNotFound(foreignRead.status());

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

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    // act
    const foreignUpdate = await adminApiContext.put(`/api/plantings/${planting.id}`, {
      data: PlantingFactory.valid(field.id!, crop.id!, { expectedHarvestDate: "2026-10-10" })
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

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

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    // act
    const foreignDelete = await adminApiContext.delete(`/api/plantings/${planting.id}`);

    // assert
    expectForbiddenOrNotFound(foreignDelete.status());

    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
