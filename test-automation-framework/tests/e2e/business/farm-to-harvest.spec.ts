import { CropFactory } from "../../../data/factories/CropFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { HarvestFactory } from "../../../data/factories/HarvestFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test, expect } from "../../../fixtures/domain.fixture";
import { CropListPage } from "../../../pages/crop/CropListPage";
import { FarmListPage } from "../../../pages/farm/FarmListPage";
import { FieldListPage } from "../../../pages/field/FieldListPage";
import { HarvestListPage } from "../../../pages/harvest/HarvestListPage";
import { PlantingListPage } from "../../../pages/planting/PlantingListPage";
import { loginViaUi } from "../../../utils/uiAuth";

test.describe("Business flow Farm -> Harvest", () => {
  test("@ui @critical should keep full chain consistent across UI and API", async ({
    page,
    env,
    farmClient,
    fieldClient,
    cropClient,
    plantingClient,
    harvestClient,
    dataRegistry
  }) => {
    // arrange
    await loginViaUi(page, env.userUsername, env.userPassword);
    const farmPayload = FarmFactory.valid();
    const farm = await farmClient.createFarm(farmPayload);
    dataRegistry.registerFarmId(farm.id);
    expect(farm.id).toBeTruthy();

    const fieldPayload = FieldFactory.valid(farm.id!);
    const field = await fieldClient.createField(fieldPayload);
    dataRegistry.registerFieldId(field.id);
    expect(field.id).toBeTruthy();

    const cropPayload = CropFactory.valid();
    const crop = await cropClient.createCrop(cropPayload);
    dataRegistry.registerCropId(crop.id);
    expect(crop.id).toBeTruthy();

    const plantingPayload = PlantingFactory.valid(field.id!, crop.id!);
    const planting = await plantingClient.createPlanting(plantingPayload);
    dataRegistry.registerPlantingId(planting.id);
    expect(planting.id).toBeTruthy();

    const harvestPayload = HarvestFactory.valid(planting.id!);
    const harvest = await harvestClient.createHarvest(harvestPayload);
    dataRegistry.registerHarvestId(harvest.id);
    expect(harvest.id).toBeTruthy();

    // act + assert
    const farmList = new FarmListPage(page);
    await farmList.open();
    await farmList.expectFarmVisible(farmPayload.name);

    const fieldList = new FieldListPage(page);
    await fieldList.open();
    await fieldList.expectFieldVisible(fieldPayload.name);

    const cropList = new CropListPage(page);
    await cropList.open();
    await cropList.expectCropVisible(cropPayload.name);

    const plantingList = new PlantingListPage(page);
    const plantingRowKey = `${fieldPayload.name} ${cropPayload.name} ${plantingPayload.plantingDate}`;
    await plantingList.open();
    await plantingList.expectVisibleByText(plantingRowKey);

    const harvestList = new HarvestListPage(page);
    const harvestRowKey = `${planting.id} ${harvestPayload.harvestDate}`;
    await harvestList.open();
    await harvestList.expectVisibleByText(harvestRowKey);
  });
});
