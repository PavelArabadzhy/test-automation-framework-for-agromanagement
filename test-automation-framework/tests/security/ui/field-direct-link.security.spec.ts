import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Field UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const ownerFieldClient = new FieldClient(adminApiContext);
    const foreignClient = new FieldClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const foreignField = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    expect(foreignField.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    await page.goto(`/fields/edit/${foreignField.id}`);
    await expect(page.locator('input[name="name"]')).toHaveCount(0);

    await page.goto(`/fields/delete/${foreignField.id}`);
    const afterDeleteAttempt = await ownerFieldClient.getFieldById(foreignField.id!);
    expect(afterDeleteAttempt.status).toBe(200);

    const foreignRead = await foreignClient.getFieldById(foreignField.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerFieldClient.deleteField(foreignField.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
