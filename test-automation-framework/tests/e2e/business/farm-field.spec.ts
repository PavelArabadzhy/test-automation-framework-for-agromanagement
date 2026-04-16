import { test, expect } from "../../../fixtures/domain.fixture";
import { loginViaUi } from "../../../utils/uiAuth";
import { FarmListPage } from "../../../pages/farm/FarmListPage";
import { FieldFormPage } from "../../../pages/field/FieldFormPage";
import { FieldListPage } from "../../../pages/field/FieldListPage";
import { randomSuffix } from "../../../utils/random";

test.describe("Business flow Farm -> Field", () => {
  test("@ui @critical should create field for an owned farm", async ({
    page,
    env,
    farmClient,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    const farm = await farmClient.createFarm({
      name: randomSuffix("farm-business"),
      location: randomSuffix("location-business")
    });
    dataRegistry.registerFarmId(farm.id);
    expect(farm.id).toBeTruthy();

    // act
    await page.goto("/fields/add");
    const fieldForm = new FieldFormPage(page);
    const fieldList = new FieldListPage(page);
    const fieldName = randomSuffix("field-business");
    await fieldForm.submit(fieldName, 12.5, farm.id!);
    
    // assert
    await fieldList.open();
    await fieldList.expectFieldVisible(fieldName);
    const createdFieldId = await fieldList.getFieldIdByName(fieldName);
    dataRegistry.registerFieldId(createdFieldId);
    expect(createdFieldId).toBeTruthy();

    const farmList = new FarmListPage(page);
    await farmList.open();
    await farmList.expectFarmVisible(farm.name);
  });
});
