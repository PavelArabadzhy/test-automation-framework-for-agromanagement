import { FieldController } from "../../../api/controllers/FieldController";
import { FarmController } from "../../../api/controllers/FarmController";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Field ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));

    // act
    const foreignRead = await adminApiContext.get(`/api/fields/${field.id}`);

    // assert
    expect(field.id).toBeTruthy();
    expectForbiddenOrNotFound(foreignRead.status());

    await ownerFieldController.deleteField(field.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));

    // act
    const foreignUpdate = await adminApiContext.put(`/api/fields/${field.id}`, {
      data: FieldFactory.valid(farm.id!, { name: `${field.name}-x` })
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerFieldController.deleteField(field.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerFarmController = new FarmController(userApiContext);
    const ownerFieldController = new FieldController(userApiContext);
    const farm = await ownerFarmController.createFarm(FarmFactory.valid());
    const field = await ownerFieldController.createField(FieldFactory.valid(farm.id!));

    // act
    const foreignDelete = await adminApiContext.delete(`/api/fields/${field.id}`);

    // assert
    expectForbiddenOrNotFound(foreignDelete.status());

    await ownerFieldController.deleteField(field.id!);
    await ownerFarmController.deleteFarm(farm.id!);
  });
});
