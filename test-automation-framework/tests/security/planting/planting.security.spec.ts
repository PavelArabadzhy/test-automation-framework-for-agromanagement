import { CropClient } from "../../../api/clients/CropClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { PlantingClient } from "../../../api/clients/PlantingClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Planting ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const ownerCropClient = new CropClient(userApiContext);
    const ownerPlantingClient = new PlantingClient(userApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    expect(planting.id).toBeTruthy();

    const foreignRead = await adminApiContext.get(`/api/plantings/${planting.id}`);
    expect([403, 404]).toContain(foreignRead.status());

    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign update", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const ownerCropClient = new CropClient(userApiContext);
    const ownerPlantingClient = new PlantingClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    const foreignUpdate = await adminApiContext.put(`/api/plantings/${planting.id}`, {
      data: PlantingFactory.valid(field.id!, crop.id!, { expectedHarvestDate: "2026-10-10" })
    });
    expect([403, 404]).toContain(foreignUpdate.status());

    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny foreign delete", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const ownerCropClient = new CropClient(userApiContext);
    const ownerPlantingClient = new PlantingClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    const foreignDelete = await adminApiContext.delete(`/api/plantings/${planting.id}`);
    expect([403, 404]).toContain(foreignDelete.status());

    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
