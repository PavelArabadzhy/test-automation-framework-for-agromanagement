import { CropClient } from "../../../api/clients/CropClient";
import { FarmClient } from "../../../api/clients/FarmClient";
import { FieldClient } from "../../../api/clients/FieldClient";
import { PlantingClient } from "../../../api/clients/PlantingClient";
import { CropFactory } from "../../../data/factories/CropFactory";
import { FarmFactory } from "../../../data/factories/FarmFactory";
import { FieldFactory } from "../../../data/factories/FieldFactory";
import { PlantingFactory } from "../../../data/factories/PlantingFactory";
import { test } from "../../../fixtures/auth.fixture";
import { expectForbiddenOrNotFound } from "../../../utils/securityAssertions";

test.describe("Create/update ownership matrix", () => {
  test("@api @security @ownership should deny creating field with foreign farm link", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());

    const foreignCreate = await userApiContext.post("/api/fields", {
      data: FieldFactory.valid(farm.id!)
    });
    expectForbiddenOrNotFound(foreignCreate.status());

    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny creating planting with foreign field and crop links", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const ownerFieldClient = new FieldClient(adminApiContext);
    const ownerCropClient = new CropClient(adminApiContext);

    const farm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const field = await ownerFieldClient.createField(FieldFactory.valid(farm.id!));
    const crop = await ownerCropClient.createCrop(CropFactory.valid());

    const foreignCreate = await userApiContext.post("/api/plantings", {
      data: PlantingFactory.valid(field.id!, crop.id!)
    });
    expectForbiddenOrNotFound(foreignCreate.status());

    await ownerFieldClient.deleteField(field.id!);
    await ownerCropClient.deleteCrop(crop.id!);
    await ownerFarmClient.deleteFarm(farm.id!);
  });

  test("@api @security @ownership should deny creating crop with foreign owner overposting", async ({ userApiContext }) => {
    const foreignCreate = await userApiContext.post("/api/crops", {
      data: {
        ...CropFactory.valid(),
        owner: { id: 1, username: "admin" }
      }
    });
    expectForbiddenOrNotFound(foreignCreate.status());
  });

  test("@api @security @ownership should deny updating planting with foreign relation ids", async ({
    userApiContext,
    adminApiContext
  }) => {
    const ownerFarmClient = new FarmClient(adminApiContext);
    const ownerFieldClient = new FieldClient(adminApiContext);
    const ownerCropClient = new CropClient(adminApiContext);
    const ownerPlantingClient = new PlantingClient(adminApiContext);

    const ownerFarm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const ownerField = await ownerFieldClient.createField(FieldFactory.valid(ownerFarm.id!));
    const ownerCrop = await ownerCropClient.createCrop(CropFactory.valid());
    const ownerPlanting = await ownerPlantingClient.createPlanting(
      PlantingFactory.valid(ownerField.id!, ownerCrop.id!)
    );

    const foreignFarm = await ownerFarmClient.createFarm(FarmFactory.valid());
    const foreignField = await ownerFieldClient.createField(FieldFactory.valid(foreignFarm.id!));
    const foreignCrop = await ownerCropClient.createCrop(CropFactory.valid());

    const foreignUpdate = await userApiContext.put(`/api/plantings/${ownerPlanting.id}`, {
      data: PlantingFactory.valid(foreignField.id!, foreignCrop.id!)
    });
    expectForbiddenOrNotFound(foreignUpdate.status());

    await ownerPlantingClient.deletePlanting(ownerPlanting.id!);
    await ownerFieldClient.deleteField(ownerField.id!);
    await ownerCropClient.deleteCrop(ownerCrop.id!);
    await ownerFarmClient.deleteFarm(ownerFarm.id!);
    await ownerFieldClient.deleteField(foreignField.id!);
    await ownerCropClient.deleteCrop(foreignCrop.id!);
    await ownerFarmClient.deleteFarm(foreignFarm.id!);
  });
});
