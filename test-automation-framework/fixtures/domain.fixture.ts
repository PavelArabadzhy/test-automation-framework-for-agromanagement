import { CropClient } from "../api/clients/CropClient";
import { FieldClient } from "../api/clients/FieldClient";
import { FarmClient } from "../api/clients/FarmClient";
import { HarvestClient } from "../api/clients/HarvestClient";
import { PlantingClient } from "../api/clients/PlantingClient";
import { CropFactory } from "../data/factories/CropFactory";
import { FieldFactory } from "../data/factories/FieldFactory";
import { FarmFactory } from "../data/factories/FarmFactory";
import { HarvestFactory } from "../data/factories/HarvestFactory";
import { PlantingFactory } from "../data/factories/PlantingFactory";
import { randomSuffix } from "../utils/random";
import { TestDataRegistry } from "../utils/TestDataRegistry";
import { test as base } from "./auth.fixture";

type DomainFixtures = {
  farmClient: FarmClient;
  fieldClient: FieldClient;
  cropClient: CropClient;
  plantingClient: PlantingClient;
  harvestClient: HarvestClient;
  dataRegistry: TestDataRegistry;
};

export const test = base.extend<DomainFixtures>({
  farmClient: async ({ userApiContext }, use) => {
    await use(new FarmClient(userApiContext));
  },
  fieldClient: async ({ userApiContext }, use) => {
    await use(new FieldClient(userApiContext));
  },
  cropClient: async ({ userApiContext }, use) => {
    await use(new CropClient(userApiContext));
  },
  plantingClient: async ({ userApiContext }, use) => {
    await use(new PlantingClient(userApiContext));
  },
  harvestClient: async ({ userApiContext }, use) => {
    await use(new HarvestClient(userApiContext));
  },
  dataRegistry: async ({ farmClient, fieldClient, cropClient, plantingClient, harvestClient }, use) => {
    const registry = new TestDataRegistry();
    await use(registry);

    for (const harvestId of registry.consumeHarvestIds()) {
      try {
        await harvestClient.deleteHarvest(harvestId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const plantingId of registry.consumePlantingIds()) {
      try {
        await plantingClient.deletePlanting(plantingId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const fieldId of registry.consumeFieldIds()) {
      try {
        await fieldClient.deleteField(fieldId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const cropId of registry.consumeCropIds()) {
      try {
        await cropClient.deleteCrop(cropId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const farmId of registry.consumeFarmIds()) {
      try {
        await farmClient.deleteFarm(farmId);
      } catch {
        // best-effort cleanup
      }
    }
  }
});

export async function setupFarmAndField(
  farmClient: FarmClient,
  fieldClient: FieldClient,
  dataRegistry: TestDataRegistry
): Promise<{ farmId: number; fieldId: number; farmName: string; fieldName: string }> {
  const farmPayload = FarmFactory.valid();
  const farm = await farmClient.createFarm(farmPayload);
  if (!farm.id) throw new Error("Farm ID was not returned");
  dataRegistry.registerFarmId(farm.id);

  const fieldName = randomSuffix("field");
  const field = await fieldClient.createField({
    name: fieldName,
    area: 15.25,
    farm: { id: farm.id }
  });
  if (!field.id) throw new Error("Field ID was not returned");
  dataRegistry.registerFieldId(field.id);

  return {
    farmId: farm.id,
    fieldId: field.id,
    farmName: farm.name,
    fieldName
  };
}

export async function setupFieldAndCrop(
  farmClient: FarmClient,
  fieldClient: FieldClient,
  cropClient: CropClient,
  dataRegistry: TestDataRegistry
): Promise<{ fieldId: number; cropId: number; fieldName: string; cropName: string }> {
  const farm = await farmClient.createFarm(FarmFactory.valid());
  if (!farm.id) throw new Error("Farm ID was not returned");
  dataRegistry.registerFarmId(farm.id);

  const field = await fieldClient.createField(FieldFactory.valid(farm.id));
  if (!field.id) throw new Error("Field ID was not returned");
  dataRegistry.registerFieldId(field.id);

  const crop = await cropClient.createCrop(CropFactory.valid());
  if (!crop.id) throw new Error("Crop ID was not returned");
  dataRegistry.registerCropId(crop.id);

  return { fieldId: field.id, cropId: crop.id, fieldName: field.name, cropName: crop.name };
}

export async function setupPlanting(
  farmClient: FarmClient,
  fieldClient: FieldClient,
  cropClient: CropClient,
  plantingClient: PlantingClient,
  dataRegistry: TestDataRegistry
): Promise<{ plantingId: number }> {
  const { fieldId, cropId } = await setupFieldAndCrop(farmClient, fieldClient, cropClient, dataRegistry);
  const planting = await plantingClient.createPlanting(PlantingFactory.valid(fieldId, cropId));
  if (!planting.id) throw new Error("Planting ID was not returned");
  dataRegistry.registerPlantingId(planting.id);

  return { plantingId: planting.id };
}

export async function setupHarvest(
  farmClient: FarmClient,
  fieldClient: FieldClient,
  cropClient: CropClient,
  plantingClient: PlantingClient,
  harvestClient: HarvestClient,
  dataRegistry: TestDataRegistry
): Promise<{ plantingId: number; harvestId: number }> {
  const { plantingId } = await setupPlanting(farmClient, fieldClient, cropClient, plantingClient, dataRegistry);
  const harvest = await harvestClient.createHarvest(HarvestFactory.valid(plantingId));
  if (!harvest.id) throw new Error("Harvest ID was not returned");
  dataRegistry.registerHarvestId(harvest.id);

  return { plantingId, harvestId: harvest.id };
}

export { expect } from "./auth.fixture";
