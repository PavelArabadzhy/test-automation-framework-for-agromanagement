import { CropController } from "../../../api/controllers/CropController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { PlantingController } from "../../../api/controllers/PlantingController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Planting UI direct-link security", () => {
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
    const foreignClient = new PlantingController(userApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropController.createCrop(CropFactory.valid());
    const foreignPlanting = await ownerPlantingController.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    expect(foreignPlanting.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto(`/plantings/edit/${foreignPlanting.id}`);
    await page.goto(`/plantings/delete/${foreignPlanting.id}`);
    const afterDeleteAttempt = await ownerPlantingController.getPlantingById(foreignPlanting.id!);
    const foreignRead = await foreignClient.getPlantingById(foreignPlanting.id!);

    // assert
    await expect(page.locator('select[name="field.id"]')).toHaveCount(0);
    expect(afterDeleteAttempt.status).toBe(200);
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerPlantingController.deletePlanting(foreignPlanting.id!);
    await ownerFieldController.deleteField(field.id!);
    await ownerCropController.deleteCrop(crop.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
