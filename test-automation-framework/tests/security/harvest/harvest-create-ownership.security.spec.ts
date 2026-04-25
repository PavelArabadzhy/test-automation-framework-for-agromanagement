import { CropController } from "../../../api/controllers/CropController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { PlantingController } from "../../../api/controllers/PlantingController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Harvest create ownership security", () => {
  test("@api @security @ownership should deny creating harvest for foreign planting", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const ownerFieldController = new FieldController(adminApiContext);
    const ownerCropController = new CropController(adminApiContext);
    const ownerPlantingController = new PlantingController(adminApiContext);
    const foreignApi = userApiContext;

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    // act
    const foreignCreate = await foreignApi.post("/api/harvests", {
      data: HarvestFactory.valid(planting.id!)
    });

    // assert
    expect(foreignCreate.status()).toBe(403);

    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
