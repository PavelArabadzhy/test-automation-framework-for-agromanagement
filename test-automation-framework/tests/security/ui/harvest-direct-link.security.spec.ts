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
import { loginViaUi } from "../../../utils/auth/uiAuth";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Harvest UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const ownerFieldController = new FieldController(adminApiContext);
    const ownerCropController = new CropController(adminApiContext);
    const ownerPlantingController = new PlantingController(adminApiContext);
    const ownerHarvestController = new HarvestController(adminApiContext);
    const foreignClient = new HarvestController(userApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const planting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const foreignHarvest = await ownerHarvestController.createHarvest(HarvestFactory.valid(planting.id!));
    expect(foreignHarvest.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto(`/harvests/edit/${foreignHarvest.id}`);
    await page.goto(`/harvests/delete/${foreignHarvest.id}`);
    const afterDeleteAttempt = await ownerHarvestController.getHarvestById(foreignHarvest.id!);
    const foreignRead = await foreignClient.getHarvestById(foreignHarvest.id!);

    // assert
    await expect(page.locator('select[name="planting.id"]')).toHaveCount(0);
    expect(afterDeleteAttempt.status).toBe(200);
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerHarvestController.deleteHarvest(foreignHarvest.id!);
    await ownerPlantingController.deletePlanting(planting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
