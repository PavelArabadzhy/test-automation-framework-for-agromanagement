import { CropClient } from "../../../api/clients/CropClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { HarvestClient } from "../../../api/clients/HarvestClient";
import { PlantingClient } from "../../../api/clients/PlantingClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("Harvest ownership security", () => {
  test("@api @security @ownership should deny foreign read", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(userApiContext);
    const ownerFieldClient = new FieldClient(userApiContext);
    const ownerCropClient = new CropClient(userApiContext);
    const ownerPlantingClient = new PlantingClient(userApiContext);
    const ownerHarvestClient = new HarvestClient(userApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestClient.createHarvest(HarvestFactory.valid(planting.id!));
    expect(harvest.id).toBeTruthy();

    const foreignRead = await adminApiContext.get(`/api/harvests/${harvest.id}`);
    expect([403, 404]).toContain(foreignRead.status());

    await ownerHarvestClient.deleteHarvest(harvest.id!);
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
    const ownerHarvestClient = new HarvestClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestClient.createHarvest(HarvestFactory.valid(planting.id!));

    const foreignUpdate = await adminApiContext.put(`/api/harvests/${harvest.id}`, {
      data: HarvestFactory.valid(planting.id!, { yieldAmount: 77.7 })
    });
    expect([403, 404]).toContain(foreignUpdate.status());

    await ownerHarvestClient.deleteHarvest(harvest.id!);
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
    const ownerHarvestClient = new HarvestClient(userApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));
    const harvest = await ownerHarvestClient.createHarvest(HarvestFactory.valid(planting.id!));

    const foreignDelete = await adminApiContext.delete(`/api/harvests/${harvest.id}`);
    expect([403, 404]).toContain(foreignDelete.status());

    await ownerHarvestClient.deleteHarvest(harvest.id!);
    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
