import { FarmController } from "../../../api/controllers/FarmController";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { loginViaUi } from "../../../utils/auth/uiAuth";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Farm UI direct-link security", () => {
  test("@ui @security @ownership should block foreign edit/delete direct links", async ({
    page,
    env,
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new FarmController(adminApiContext);
    const foreignClient = new FarmController(userApiContext);
    const foreignFarm = await ownerClient.createFarm(FarmFactory.valid());
    expect(foreignFarm.id).toBeTruthy();
    await loginViaUi(page, env.userUsername, env.userPassword);

    // act
    await page.goto(`/farms/edit/${foreignFarm.id}`);
    await page.goto(`/farms/delete/${foreignFarm.id}`);
    const afterDeleteAttempt = await ownerClient.getFarmById(foreignFarm.id!);
    const foreignRead = await foreignClient.getFarmById(foreignFarm.id!);

    // assert
    await expect(page.locator('input[name="name"]')).toHaveCount(0);
    expect(afterDeleteAttempt.status).toBe(200);
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerClient.deleteFarm(foreignFarm.id!);
  });
});
