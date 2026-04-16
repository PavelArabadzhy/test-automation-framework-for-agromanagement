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

test.describe("Harvest create ownership security", () => {
  test("@api @security @ownership should deny creating harvest for foreign planting", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const ownerFieldClient = new FieldClient(adminApiContext);
    const ownerCropClient = new CropClient(adminApiContext);
    const ownerPlantingClient = new PlantingClient(adminApiContext);
    const ownerHarvestClient = new HarvestClient(adminApiContext);
    const foreignApi = userApiContext;

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());
    const planting = await ownerPlantingClient.createPlanting(PlantingFactory.valid(field.id!, crop.id!));

    const foreignCreate = await foreignApi.post("/api/harvests", {
      data: HarvestFactory.valid(planting.id!)
    });
    const foreignCreateRaw = await foreignCreate.text();
    const foreignHarvestId = foreignCreateRaw.match(/"id"\s*:\s*(\d+)/)?.[1];
    expect(foreignCreate.status()).toBe(403);

    if (foreignHarvestId) {
      try {
        await ownerHarvestClient.deleteHarvest(Number(foreignHarvestId));
      } catch {
        // best-effort cleanup
      }
    }

    await ownerPlantingClient.deletePlanting(planting.id!);
    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });
});
