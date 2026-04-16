import { CropClient } from "../../../api/clients/CropClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { HarvestClient } from "../../../api/clients/HarvestClient";
import { PlantingClient } from "../../../api/clients/PlantingClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Harvest UI direct-link security", () => {
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
    const ownerHarvestClient = new HarvestClient(adminApiContext);
    const foreignClient = new HarvestClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const foreignHarvest = await ownerHarvestClient.createHarvest(HarvestFactory.valid(planting.id!));
    expect(foreignHarvest.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    await page.goto(`/harvests/edit/${foreignHarvest.id}`);
    await expect(page.locator('select[name="planting.id"]')).toHaveCount(0);

    await page.goto(`/harvests/delete/${foreignHarvest.id}`);
    const afterDeleteAttempt = await ownerHarvestClient.getHarvestById(foreignHarvest.id!);
    expect(afterDeleteAttempt.status).toBe(200);

    const foreignRead = await foreignClient.getHarvestById(foreignHarvest.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerHarvestClient.deleteHarvest(foreignHarvest.id!);
    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
