import { CropController } from "../../../api/controllers/CropController";
import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/api/securityAssertions";

test.describe("Crop ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new CropController(userApiContext);
    const crop = await ownerClient.createCrop(CropFactory.valid());

    // act
    const foreignRead = await adminApiContext.get(`/api/crops/${crop.id}`);

    // assert
    expect(crop.id).toBeTruthy();
    expectForbiddenOrNotFound(foreignRead.status());

    await ownerClient.deleteCrop(crop.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new CropController(userApiContext);
    const crop = await ownerClient.createCrop(CropFactory.valid());

    // act
    const foreignUpdate = await adminApiContext.put(`/api/crops/${crop.id}`, {
      data: CropFactory.valid({ name: `${crop.name}-x` })
    });

    // assert
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerClient.deleteCrop(crop.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    // arrange
    const ownerClient = new CropController(userApiContext);
    const crop = await ownerClient.createCrop(CropFactory.valid());

    // act
    const foreignDelete = await adminApiContext.delete(`/api/crops/${crop.id}`);

    // assert
    expectForbiddenOrNotFound(foreignDelete.status());

    await ownerClient.deleteCrop(crop.id!);
  });
});
