import { test, expect } from "../../../fixtures/domain.fixture";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FarmFormPage } from "../../../pages/farm/FarmFormPage";
import { FarmListPage } from "../../../pages/farm/FarmListPage";
import { loginViaUi } from "../../../utils/auth/uiAuth";

test.describe("Farm UI", () => {
  test("@ui @regression should display farms list", async ({ page, env }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const listPage = new FarmListPage(page);

    // act
    await listPage.open();

    // assert
    await expect(page).toHaveURL(/\/farms/);
  });

  test("@ui @regression should create farm", async ({ page, env, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    const listPage = new FarmListPage(page);
    const formPage = new FarmFormPage(page);
    const createPayload = FarmFactory.valid();

    // act
    await listPage.open();
    await listPage.clickAddFarm();
    await formPage.expectFormVisible();
    await formPage.submit(createPayload.name, createPayload.location);

    // assert
    await listPage.expectFarmVisible(createPayload.name);

    const createdFarmId = await listPage.getFarmIdByName(createPayload.name);
    dataRegistry.registerFarmId(createdFarmId);
    expect(createdFarmId).toBeTruthy();
  });

  test("@ui @regression should update farm", async ({ page, env, farmController, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    const createPayload = FarmFactory.valid();
    const createdFarm = await farmController.createFarm(createPayload);
    dataRegistry.registerFarmId(createdFarm.id);
    const updatedName = `${createPayload.name}-updated`;

    const listPage = new FarmListPage(page);
    const formPage = new FarmFormPage(page);
    // act
    await listPage.open();
    await listPage.openEditByFarmName(createPayload.name);
    await formPage.submit(updatedName, createPayload.location);

    // assert
    await listPage.expectFarmVisible(updatedName);
  });

  test("@ui @regression should delete farm", async ({ page, env, farmController }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    const createPayload = FarmFactory.valid();
    const createdFarm = await farmController.createFarm(createPayload);

    const listPage = new FarmListPage(page);
    // act
    await listPage.open();
    await listPage.deleteByFarmName(createPayload.name);

    // assert
    await listPage.expectFarmHidden(createPayload.name);

    const afterDelete = await farmController.getFarmById(createdFarm.id!);
    expect(afterDelete.status).toBe(404);
  });
});
