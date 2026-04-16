import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { CropFormPage } from "../../../pages/crop/CropFormPage";
import { CropListPage } from "../../../pages/crop/CropListPage";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Crop UI", () => {
  test("@ui @regression should display crops list", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    const listPage = new CropListPage(page);
    await listPage.open();
    await expect(page).toHaveURL(/\/crops/);
  });

  test("@ui @regression should create crop", async ({ page, env, cropClient, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const payload = CropFactory.valid();

    // act
    const listPage = new CropListPage(page);
    const formPage = new CropFormPage(page);
    await listPage.open();
    await listPage.clickAddCrop();
    await formPage.submit(payload.name, payload.expectedYield);

    // assert
    await listPage.expectCropVisible(payload.name);
    const createdCropId = await listPage.getCropIdByName(payload.name);
    dataRegistry.registerCropId(createdCropId);
    expect(createdCropId).toBeTruthy();
  });

  test("@ui @regression should delete crop", async ({ page, env, cropClient }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const crop = await cropClient.createCrop(CropFactory.valid());

    // act
    const listPage = new CropListPage(page);
    await listPage.open();
    await listPage.deleteByCropName(crop.name);

    // assert
    await listPage.expectCropHidden(crop.name);
    const afterDelete = await cropClient.getCropById(crop.id!);
    expect(afterDelete.status).toBe(404);
  });

  test("@ui @regression should update crop", async ({ page, env, cropClient, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const created = await cropClient.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(created.id);
    const updatedName = `${created.name}-upd`;

    // act
    const formPage = new CropFormPage(page);
    await page.goto(`/crops/edit/${created.id}`);
    await formPage.submit(updatedName, created.expectedYield);

    // assert
    const listPage = new CropListPage(page);
    await listPage.expectCropVisible(updatedName);
    const byId = await cropClient.getCropById(created.id!);
    expect(byId.status).toBe(200);
    expect(byId.body?.name).toBe(updatedName);
  });
});
