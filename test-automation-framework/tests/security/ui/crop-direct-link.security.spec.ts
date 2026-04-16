import { CropClient } from "../../../api/clients/CropClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Crop UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new CropClient(adminApiContext);
    const foreignClient = new CropClient(userApiContext);
    const foreignCrop = await ownerClient.createCrop(CropFactory.valid());
    expect(foreignCrop.id).toBeTruthy();

    await loginViaUi(page, env.userUsername, env.userPassword);

    await page.goto(`/crops/edit/${foreignCrop.id}`);
    await expect(page.locator('input[name="name"]')).toHaveCount(0);

    await page.goto(`/crops/delete/${foreignCrop.id}`);
    const afterDeleteAttempt = await ownerClient.getCropById(foreignCrop.id!);
    expect(afterDeleteAttempt.status).toBe(200);

    const foreignRead = await foreignClient.getCropById(foreignCrop.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerClient.deleteCrop(foreignCrop.id!);
  });
});
