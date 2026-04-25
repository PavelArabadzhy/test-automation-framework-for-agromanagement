import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/api/parseApiResponse";

test.describe("Crop API", () => {
  test("@api @regression should create crop", async ({ cropController, dataRegistry }) => {
    // arrange
    const payload = CropFactory.valid();

    // act
    const created = await cropController.createCrop(payload);
    dataRegistry.registerCropId(created.id);

    // assert
    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
  });

  test("@api @regression should get crop by id", async ({ cropController, dataRegistry, userApiContext }) => {
    // arrange
    const created = await cropController.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(created.id);

    // act
    const byId = await userApiContext.get(`/api/crops/${created.id}`);

    // assert
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
  });

  test("@api @regression should update crop", async ({ cropController, dataRegistry }) => {
    // arrange
    const created = await cropController.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(created.id);

    // act
    const updated = await cropController.updateCrop(created.id!, CropFactory.valid({ name: `${created.name}-v2` }));

    // assert
    expect(updated.id).toBe(created.id);
    expect(updated.name).toContain("-v2");
  });

  test("@api @regression should delete crop", async ({ cropController }) => {
    // arrange
    const created = await cropController.createCrop(CropFactory.valid());

    // act
    await cropController.deleteCrop(created.id!);
    const afterDelete = await cropController.getCropById(created.id!);

    // assert
    expect(afterDelete.status).toBe(404);
  });
});
