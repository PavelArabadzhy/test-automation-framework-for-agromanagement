import { FarmController } from "../../../api/controllers/FarmController";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Farm ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new FarmController(userApiContext);
    const foreignClient = new FarmController(adminApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    // act
    const foreignRead = await foreignClient.getFarmById(farm.id!);

    // assert
    expect(farm.id).toBeTruthy();
    expectForbiddenOrNotFound(foreignRead.status);

    await ownerClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new FarmController(userApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    // act
    const foreignUpdate = await adminApiContext.put(`/api/farms/${farm.id}`, {
      data: FarmFactory.valid({ name: `${farm.name}-x` })
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new FarmController(userApiContext);
    const farm = await ownerClient.createFarm(FarmFactory.valid());

    // act
    const foreignDelete = await adminApiContext.delete(`/api/farms/${farm.id}`);

    // assert
    expectForbiddenOrNotFound(foreignDelete.status());

    await ownerClient.deleteFarm(farm.id!);
  });
});
