import { CropClient } from "../../../api/clients/CropClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { PlantingClient } from "../../../api/clients/PlantingClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Planting UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const ownerFieldClient = new FieldClient(adminApiContext);
    const ownerCropClient = new CropClient(adminApiContext);
    const ownerPlantingClient = new PlantingClient(adminApiContext);
    const foreignClient = new PlantingClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const foreignPlanting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    expect(foreignPlanting.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    await page.goto(`/plantings/edit/${foreignPlanting.id}`);
    await expect(page.locator('select[name="field.id"]')).toHaveCount(0);

    await page.goto(`/plantings/delete/${foreignPlanting.id}`);
    const afterDeleteAttempt = await ownerPlantingClient.getPlantingById(foreignPlanting.id!);
    expect(afterDeleteAttempt.status).toBe(200);

    const foreignRead = await foreignClient.getPlantingById(foreignPlanting.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerPlantingClient.deletePlanting(foreignPlanting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
