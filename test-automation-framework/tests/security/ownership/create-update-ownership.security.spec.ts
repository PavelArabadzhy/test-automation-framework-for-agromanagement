import { CropController } from "../../../api/controllers/CropController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { PlantingController } from "../../../api/controllers/PlantingController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Create/update ownership matrix", () => {
  test("@api @security @ownership should deny creating field with foreign farm link", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());

    // act
    const foreignCreate = await userApiContext.post("/api/fields", {
      data: FieldFactory.valid(farm.id!)
    });

    // assert
    expectForbiddenOrNotFound(foreignCreate.status());

    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny creating planting with foreign field and crop links", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const ownerFieldController = new FieldController(adminApiContext);
    const ownerCropController = new CropController(adminApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());

    // act
    const foreignCreate = await userApiContext.post("/api/plantings", {
      data: PlantingFactory.valid(field.id!, crop.id!)
    });

    // assert
    expectForbiddenOrNotFound(foreignCreate.status());

    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny creating crop with foreign owner overposting", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const foreignCreate = await userApiContext.post("/api/crops", {
      data: {
        ...CropFactory.valid(),
        owner: { id: 1, username: "admin" }
      }
    });

    // assert
    expectForbiddenOrNotFound(foreignCreate.status());
  });

  test("@api @security @ownership should deny updating planting with foreign relation ids", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const ownerFieldController = new FieldController(adminApiContext);
    const ownerCropController = new CropController(adminApiContext);
    const ownerPlantingController = new PlantingController(adminApiContext);

    const ownerFarm = await ownerFarmController.createFarm(FarmFactory.valid());
    const ownerField = await ownerFieldController.createField(FieldFactory.valid(ownerFarm.id!));
    const ownerCrop = await ownerCropController.createCrop(CropFactory.valid());
    const ownerPlanting = await ownerPlantingController.createPlanting(
      PlantingFactory.valid(ownerField.id!, ownerCrop.id!)
    );

    const foreignFarm = await ownerFarmController.createFarm(FarmFactory.valid());
    const foreignField = await ownerFieldController.createField(FieldFactory.valid(foreignFarm.id!));
    const foreignCrop = await ownerCropController.createCrop(CropFactory.valid());

    // act
    const foreignUpdate = await userApiContext.put(`/api/plantings/${ownerPlanting.id}`, {
      data: PlantingFactory.valid(foreignField.id!, foreignCrop.id!)
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerPlantingController.deletePlanting(ownerPlanting.id!);
    await ownerFieldController.deleteField(ownerField.id!);
    await ownerCropController.deleteCrop(ownerCrop.id!);
    await ownerFarmController.deleteFarm(ownerFarm.id!);
    await ownerFieldController.deleteField(foreignField.id!);
    await ownerCropController.deleteCrop(foreignCrop.id!);
    await ownerFarmController.deleteFarm(foreignFarm.id!);
  });
});
