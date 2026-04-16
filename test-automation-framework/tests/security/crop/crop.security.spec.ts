import { CropClient } from "../../../api/clients/CropClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Crop ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new CropClient(userApiContext);

    const crop = await ownerClient.createCrop(CropFactory.valid());
    expect(crop.id).toBeTruthy();

    const foreignRead = await adminApiContext.get(`/api/crops/${crop.id}`);
    expect([403, 404]).toContain(foreignRead.status());

    await ownerClient.deleteCrop(crop.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new CropClient(userApiContext);
    const crop = await ownerClient.createCrop(CropFactory.valid());

    const foreignUpdate = await adminApiContext.put(`/api/crops/${crop.id}`, {
      data: CropFactory.valid({ name: `${crop.name}-x` })
    });
    expect([403, 404]).toContain(foreignUpdate.status());

    await ownerClient.deleteCrop(crop.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerClient = new CropClient(userApiContext);
    const crop = await ownerClient.createCrop(CropFactory.valid());

    const foreignDelete = await adminApiContext.delete(`/api/crops/${crop.id}`);
    expect([403, 404]).toContain(foreignDelete.status());

    await ownerClient.deleteCrop(crop.id!);
  });
});
