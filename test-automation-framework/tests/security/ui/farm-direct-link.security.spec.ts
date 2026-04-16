import { FarmClient } from "../../../api/clients/FarmClient";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Farm UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new FarmClient(adminApiContext);
    const foreignClient = new FarmClient(userApiContext);
    const foreignFarm = await ownerClient.createFarm(FarmFactory.valid());
    expect(foreignFarm.id).toBeTruthy();

    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);

    // act + assert (edit)
    await page.goto(`/farms/edit/${foreignFarm.id}`);
    await expect(page.locator('input[name="name"]')).toHaveCount(0);

    // act + assert (delete)
    await page.goto(`/farms/delete/${foreignFarm.id}`);
    const afterDeleteAttempt = await ownerClient.getFarmById(foreignFarm.id!);
    expect(afterDeleteAttempt.status).toBe(200);

    // api ownership sanity check for the same foreign resource
    const foreignRead = await foreignClient.getFarmById(foreignFarm.id!);
    expect([403, 404]).toContain(foreignRead.status);

    await ownerClient.deleteFarm(foreignFarm.id!);
  });
});
