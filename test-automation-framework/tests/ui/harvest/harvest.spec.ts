import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { setupPlanting, test, expect } from "../../../fixtures/domain.fixture";
import { HarvestFormPage } from "../../../pages/harvest/HarvestFormPage";
import { HarvestListPage } from "../../../pages/harvest/HarvestListPage";
import { loginViaUi } from "../../../utils/auth/uiAuth";

test.describe("Harvest UI", () => {
  test("@ui @regression should display harvests list", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    const listPage = new HarvestListPage(page);
    await listPage.open();
    await expect(page).toHaveURL(/\/harvests/);
  });

  test("@ui @regression should create harvest", async ({
    page,
    env,
    farmController,
    fieldController,
    cropController,
    plantingController,
    harvestController,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { plantingId } = await setupPlanting(farmController, fieldController, cropController, plantingController, dataRegistry);
    const payload = HarvestFactory.valid(plantingId);
    const rowKey = `${plantingId} ${payload.harvestDate}`;

    // act
    const listPage = new HarvestListPage(page);
    const formPage = new HarvestFormPage(page);
    await listPage.open();
    await listPage.clickAddHarvest();
    await formPage.submit(plantingId, payload.harvestDate, payload.yieldAmount);

    // assert
    await listPage.expectVisibleByText(rowKey);
    const createdHarvestId = await listPage.getHarvestIdByText(rowKey);
    dataRegistry.registerHarvestId(createdHarvestId);
    expect(createdHarvestId).toBeTruthy();
  });

  test("@ui @regression should delete harvest", async ({
    page,
    env,
    farmController,
    fieldController,
    cropController,
    plantingController,
    harvestController,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { plantingId } = await setupPlanting(farmController, fieldController, cropController, plantingController, dataRegistry);
    const harvest = await harvestController.createHarvest(HarvestFactory.valid(plantingId));
    const rowKey = `${plantingId} ${harvest.harvestDate}`;

    // act
    const listPage = new HarvestListPage(page);
    await listPage.open();
    await listPage.deleteByText(rowKey);

    // assert
    await listPage.expectHiddenByText(rowKey);
    const afterDelete = await harvestController.getHarvestById(harvest.id!);
    expect(afterDelete.status).toBe(404);
  });

  test("@ui @regression should update harvest", async ({
    page,
    env,
    farmController,
    fieldController,
    cropController,
    plantingController,
    harvestController,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { plantingId } = await setupPlanting(farmController, fieldController, cropController, plantingController, dataRegistry);
    const created = await harvestController.createHarvest(HarvestFactory.valid(plantingId));
    dataRegistry.registerHarvestId(created.id);
    const updatedHarvestDate = "2026-11-11";
    const rowKey = `${plantingId} ${updatedHarvestDate}`;

    // act
    const listPage = new HarvestListPage(page);
    const formPage = new HarvestFormPage(page);
    await page.goto(`/harvests/edit/${created.id}`);
    await formPage.submit(plantingId, updatedHarvestDate, created.yieldAmount);

    // assert
    await listPage.expectVisibleByText(rowKey);
  });
});
