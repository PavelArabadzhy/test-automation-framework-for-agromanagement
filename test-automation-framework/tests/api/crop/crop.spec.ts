import { CropFactory } from "../../../data/factories/CropFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { parseJsonWithFallback } from "../../../utils/parseApiResponse";

test.describe("Crop API", () => {
  test("@api @regression should create crop", async ({ cropClient, dataRegistry }) => {
    const payload = CropFactory.valid();
    const created = await cropClient.createCrop(payload);
    dataRegistry.registerCropId(created.id);

    expect(created.id).toBeTruthy();
    expect(created.name).toBe(payload.name);
  });

  test("@api @regression should get crop by id", async ({ cropClient, dataRegistry, userApiContext }) => {
    const created = await cropClient.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(created.id);

    const byId = await userApiContext.get(`/api/crops/${created.id}`);
    expect(byId.status()).toBe(200);
    const body = await parseJsonWithFallback(byId);
    expect(body.id).toBe(created.id);
    expect(body.name).toBe(created.name);
  });

  test("@api @regression should update crop", async ({ cropClient, dataRegistry }) => {
    const created = await cropClient.createCrop(CropFactory.valid());
    dataRegistry.registerCropId(created.id);

    const updated = await cropClient.updateCrop(created.id!, CropFactory.valid({ name: `${created.name}-v2` }));
    expect(updated.id).toBe(created.id);
    expect(updated.name).toContain("-v2");
  });

  test("@api @regression should delete crop", async ({ cropClient }) => {
    const created = await cropClient.createCrop(CropFactory.valid());

    await cropClient.deleteCrop(created.id!);
    const afterDelete = await cropClient.getCropById(created.id!);
    expect(afterDelete.status).toBe(404);
  });
});
