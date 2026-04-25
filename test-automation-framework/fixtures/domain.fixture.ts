import { CropController } from "../api/controllers/CropController";
import { FieldController } from "../api/controllers/FieldController";
import { FarmController } from "../api/controllers/FarmController";
import { HarvestController } from "../api/controllers/HarvestController";
import { PlantingController } from "../api/controllers/PlantingController";
import { CropFactory } from "../data/factories/CropFactory";
import { FieldFactory } from "../data/factories/FieldFactory";
import { FarmFactory } from "../data/factories/FarmFactory";
import { HarvestFactory } from "../data/factories/HarvestFactory";
import { PlantingFactory } from "../data/factories/PlantingFactory";
import { randomSuffix } from "../utils/data/random";
import { TestDataRegistry } from "../utils/data/TestDataRegistry";
import { test as base } from "./auth.fixture";

type DomainFixtures = {
  farmController: FarmController;
  fieldController: FieldController;
  cropController: CropController;
  plantingController: PlantingController;
  harvestController: HarvestController;
  dataRegistry: TestDataRegistry;
};

export const test = base.extend<DomainFixtures>({
  farmController: async ({ userApiContext }, use) => {
    await use(new FarmController(userApiContext));
  },
  fieldController: async ({ userApiContext }, use) => {
    await use(new FieldController(userApiContext));
  },
  cropController: async ({ userApiContext }, use) => {
    await use(new CropController(userApiContext));
  },
  plantingController: async ({ userApiContext }, use) => {
    await use(new PlantingController(userApiContext));
  },
  harvestController: async ({ userApiContext }, use) => {
    await use(new HarvestController(userApiContext));
  },
  dataRegistry: async ({ farmController, fieldController, cropController, plantingController, harvestController }, use) => {
    const registry = new TestDataRegistry();
    await use(registry);

    for (const harvestId of registry.consumeHarvestIds()) {
      try {
        await harvestController.deleteHarvest(harvestId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const plantingId of registry.consumePlantingIds()) {
      try {
        await plantingController.deletePlanting(plantingId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const fieldId of registry.consumeFieldIds()) {
      try {
        await fieldController.deleteField(fieldId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const cropId of registry.consumeCropIds()) {
      try {
        await cropController.deleteCrop(cropId);
      } catch {
        // best-effort cleanup
      }
    }

    for (const farmId of registry.consumeFarmIds()) {
      try {
        await farmController.deleteFarm(farmId);
      } catch {
        // best-effort cleanup
      }
    }
  }
});

export async function setupFarmAndField(
  farmController: FarmController,
  fieldController: FieldController,
  dataRegistry: TestDataRegistry
): Promise<{ farmId: number; fieldId: number; farmName: string; fieldName: string }> {
  const farmPayload = FarmFactory.valid();
  const farm = await farmController.createFarm(farmPayload);
  if (!farm.id) throw new Error("Farm ID was not returned");
  dataRegistry.registerFarmId(farm.id);

  const fieldName = randomSuffix("field");
  const field = await fieldController.createField({
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
  farmController: FarmController,
  fieldController: FieldController,
  cropController: CropController,
  dataRegistry: TestDataRegistry
): Promise<{ fieldId: number; cropId: number; fieldName: string; cropName: string }> {
  const farm = await farmController.createFarm(FarmFactory.valid());
  if (!farm.id) throw new Error("Farm ID was not returned");
  dataRegistry.registerFarmId(farm.id);

  const field = await fieldController.createField(FieldFactory.valid(farm.id));
  if (!field.id) throw new Error("Field ID was not returned");
  dataRegistry.registerFieldId(field.id);

  const crop = await cropController.createCrop(CropFactory.valid());
  if (!crop.id) throw new Error("Crop ID was not returned");
  dataRegistry.registerCropId(crop.id);

  return { fieldId: field.id, cropId: crop.id, fieldName: field.name, cropName: crop.name };
}

export async function setupPlanting(
  farmController: FarmController,
  fieldController: FieldController,
  cropController: CropController,
  plantingController: PlantingController,
  dataRegistry: TestDataRegistry
): Promise<{ plantingId: number }> {
  const { fieldId, cropId } = await setupFieldAndCrop(farmController, fieldController, cropController, dataRegistry);
  const planting = await plantingController.createPlanting(PlantingFactory.valid(fieldId, cropId));
  if (!planting.id) throw new Error("Planting ID was not returned");
  dataRegistry.registerPlantingId(planting.id);

  return { plantingId: planting.id };
}

export async function setupHarvest(
  farmController: FarmController,
  fieldController: FieldController,
  cropController: CropController,
  plantingController: PlantingController,
  harvestController: HarvestController,
  dataRegistry: TestDataRegistry
): Promise<{ plantingId: number; harvestId: number }> {
  const { plantingId } = await setupPlanting(farmController, fieldController, cropController, plantingController, dataRegistry);
  const harvest = await harvestController.createHarvest(HarvestFactory.valid(plantingId));
  if (!harvest.id) throw new Error("Harvest ID was not returned");
  dataRegistry.registerHarvestId(harvest.id);

  return { plantingId, harvestId: harvest.id };
}

export { expect } from "./auth.fixture";
