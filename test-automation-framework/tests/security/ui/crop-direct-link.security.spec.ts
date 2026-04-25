import { CropController } from "../../../api/controllers/CropController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Crop UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new CropController(adminApiContext);
    const foreignClient = new CropController(userApiContext);
    const foreignCrop = await ownerClient.createCrop(CropFactory.valid());
    expect(foreignCrop.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto(`/crops/edit/${foreignCrop.id}`);
    await page.goto(`/crops/delete/${foreignCrop.id}`);
    const afterDeleteAttempt = await ownerClient.getCropById(foreignCrop.id!);
    const foreignRead = await foreignClient.getCropById(foreignCrop.id!);

    // assert
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
    expect(afterDeleteAttempt.status).toBe(200);
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerClient.deleteCrop(foreignCrop.id!);
  });
});
