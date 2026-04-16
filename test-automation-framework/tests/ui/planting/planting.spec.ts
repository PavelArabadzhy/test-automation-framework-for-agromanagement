import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { setupFieldAndCrop, test, expect } from "../../../fixtures/domain.fixture";
import { PlantingFormPage } from "../../../pages/planting/PlantingFormPage";
import { PlantingListPage } from "../../../pages/planting/PlantingListPage";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Planting UI", () => {
  test("@ui @regression should display plantings list", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    const listPage = new PlantingListPage(page);
    await listPage.open();
    await expect(page).toHaveURL(/\/plantings/);
  });

  test("@ui @regression should create planting", async ({
    page,
    env,
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { fieldId, cropId, fieldName, cropName } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const payload = PlantingFactory.valid(fieldId, cropId);
    const rowKey = `${fieldName} ${cropName} ${payload.plantingDate}`;

    // act
    const listPage = new PlantingListPage(page);
    const formPage = new PlantingFormPage(page);
    await listPage.open();
    await listPage.clickAddPlanting();
    await formPage.submit(fieldId, cropId, payload.plantingDate, payload.expectedHarvestDate);

    // assert
    await listPage.expectVisibleByText(rowKey);
    const createdPlantingId = await listPage.getPlantingIdByText(rowKey);
    dataRegistry.registerPlantingId(createdPlantingId);
    expect(createdPlantingId).toBeTruthy();
  });

  test("@ui @regression should delete planting", async ({
    page,
    env,
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { fieldId, cropId, fieldName, cropName } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const planting = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));
    const rowKey = `${fieldName} ${cropName} ${planting.plantingDate}`;

    // act
    const listPage = new PlantingListPage(page);
    await listPage.open();
    await listPage.deleteByText(rowKey);

    // assert
    await listPage.expectHiddenByText(rowKey);
    const afterDelete = await plantingClient.getPlantingById(planting.id!);
    expect(afterDelete.status).toBe(404);
  });

  test("@ui @regression should update planting", async ({
    page,
    env,
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
    const created = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));
    dataRegistry.registerPlantingId(created.id);
    const updatedPlantingDate = "2026-12-12";

    // act
    const formPage = new PlantingFormPage(page);
    await page.goto(`/plantings/edit/${created.id}`);
    await formPage.submit(fieldId, cropId, updatedPlantingDate, created.expectedHarvestDate);

    // assert
    const byId = await plantingClient.getPlantingById(created.id!);
    expect(byId.status).toBe(200);
    expect(byId.body?.plantingDate).toBe(updatedPlantingDate);
  });
});
