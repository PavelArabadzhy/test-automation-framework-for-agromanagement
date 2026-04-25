import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { FieldFormPage } from "../../../pages/field/FieldFormPage";
import { FieldListPage } from "../../../pages/field/FieldListPage";
import { loginViaUi } from "../../../utils/auth/uiAuth";

test.describe("Field UI", () => {
  test("@ui @regression should display fields list", async ({ page, env }) => {
    await loginViaUi(page, env.userUsername, env.userPassword);
    const listPage = new FieldListPage(page);
    await listPage.open();
    await expect(page).toHaveURL(/\/fields/);
  });

  test("@ui @regression should create field", async ({ page, env, farmController, fieldController, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const payload = FieldFactory.valid(farm.id!);

    // act
    const listPage = new FieldListPage(page);
    const formPage = new FieldFormPage(page);
    await listPage.open();
    await listPage.clickAddField();
    await formPage.expectFormVisible();
    await formPage.submit(payload.name, payload.area, farm.id!);

    // assert
    await listPage.expectFieldVisible(payload.name);
    const createdFieldId = await listPage.getFieldIdByName(payload.name);
    dataRegistry.registerFieldId(createdFieldId);
    expect(createdFieldId).toBeTruthy();
  });

  test("@ui @regression should delete field", async ({ page, env, farmController, fieldController, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const field = await fieldController.createField(FieldFactory.valid(farm.id!));

    // act
    const listPage = new FieldListPage(page);
    await listPage.open();
    await listPage.deleteByFieldName(field.name);

    // assert
    await listPage.expectFieldHidden(field.name);
    const afterDelete = await fieldController.getFieldById(field.id!);
    expect(afterDelete.status).toBe(404);
  });

  test("@ui @regression should update field", async ({ page, env, farmController, fieldController, dataRegistry }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const farm = await farmController.createFarm(FarmFactory.valid());
    dataRegistry.registerFarmId(farm.id);
    const created = await fieldController.createField(FieldFactory.valid(farm.id!));
    dataRegistry.registerFieldId(created.id);
    const updatedName = `${created.name}-upd`;

    // act
    const formPage = new FieldFormPage(page);
    await page.goto(`/fields/edit/${created.id}`);
    await formPage.expectFormVisible();
    await formPage.submit(updatedName, created.area, farm.id!);

    // assert
    const listPage = new FieldListPage(page);
    await listPage.expectFieldVisible(updatedName);
    const byId = await fieldController.getFieldById(created.id!);
    expect(byId.status).toBe(200);
    expect(byId.body?.name).toBe(updatedName);
  });
});
