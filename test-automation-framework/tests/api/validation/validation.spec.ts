import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("API validation suite", () => {
  test("@api @regression should reject invalid farm payloads", async ({ userApiContext }) => {
    const emptyName = await userApiContext.post("/api/farms", {
      data: { name: "", location: "x" }
    });
    expect(emptyName.status()).toBe(400);

    const emptyLocation = await userApiContext.post("/api/farms", {
      data: { name: "x", location: "" }
    });
    expect(emptyLocation.status()).toBe(400);
  });

  test("@api @regression should reject invalid field payloads", async ({ userApiContext }) => {
    const noFarm = await userApiContext.post("/api/fields", {
      data: { name: "f", area: 1.2 }
    });
    expect(noFarm.status()).toBe(400);

    const negativeArea = await userApiContext.post("/api/fields", {
      data: { name: "f", area: -1, farm: { id: 999999 } }
    });
    expect([400, 404]).toContain(negativeArea.status());

    const zeroArea = await userApiContext.post("/api/fields", {
      data: { name: "f-zero", area: 0, farm: { id: 999999 } }
    });
    expect([400, 404]).toContain(zeroArea.status());
  });

  test("@api @regression should reject invalid crop payloads", async ({ userApiContext }) => {
    const emptyName = await userApiContext.post("/api/crops", {
      data: { name: "", expectedYield: 1 }
    });
    expect(emptyName.status()).toBe(400);

    const negativeYield = await userApiContext.post("/api/crops", {
      data: { name: "crop-invalid", expectedYield: -10 }
    });
    expect(negativeYield.status()).toBe(400);

    const zeroYield = await userApiContext.post("/api/crops", {
      data: { name: "crop-zero", expectedYield: 0 }
    });
    expect(zeroYield.status()).toBe(400);
  });

  test("@api @regression should reject invalid planting payloads", async ({ userApiContext }) => {
    const missingRelations = await userApiContext.post("/api/plantings", {
      data: { plantingDate: "2026-01-01", expectedHarvestDate: "2026-01-02" }
    });
    expect(missingRelations.status()).toBe(400);

    const invalidDates = await userApiContext.post("/api/plantings", {
      data: {
        plantingDate: "2026-12-31",
        expectedHarvestDate: "2026-01-01",
        field: { id: 999999 },
        crop: { id: 999999 }
      }
    });
    expect([400, 404]).toContain(invalidDates.status());
  });

  test("@api @regression should reject invalid harvest payloads", async ({ userApiContext }) => {
    const missingPlanting = await userApiContext.post("/api/harvests", {
      data: { harvestDate: "2026-01-01", yieldAmount: 1.2 }
    });
    expect(missingPlanting.status()).toBe(400);

    const negativeYield = await userApiContext.post("/api/harvests", {
      data: { harvestDate: "2026-01-01", yieldAmount: -1, planting: { id: 999999 } }
    });
    expect([400, 404]).toContain(negativeYield.status());
  });
});
