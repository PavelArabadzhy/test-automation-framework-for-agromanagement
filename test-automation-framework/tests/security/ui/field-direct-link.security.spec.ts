import { FarmController } from "../../../api/controllers/FarmController";
import { FieldController } from "../../../api/controllers/FieldController";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Field UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(adminApiContext);
    const ownerFieldController = new FieldController(adminApiContext);
    const foreignClient = new FieldController(userApiContext);

    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const foreignField = await ownerFieldController.createField(FieldFactory.valid(farm.id!));
    expect(foreignField.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto(`/fields/edit/${foreignField.id}`);
    await page.goto(`/fields/delete/${foreignField.id}`);
    const afterDeleteAttempt = await ownerFieldController.getFieldById(foreignField.id!);
    const foreignRead = await foreignClient.getFieldById(foreignField.id!);

    // assert
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
    expect(afterDeleteAttempt.status).toBe(200);
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerFieldController.deleteField(foreignField.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
