import { test, expect } from "../../../fixtures/auth.fixture";

test.describe("API validation suite", () => {
  test("@api @regression should reject invalid farm payloads", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const emptyName = await userApiContext.post("/api/farms", {
      data: { name: "", location: "x" }
    });

    // assert
    expect(emptyName.status()).toBe(400);

    // act
    const emptyLocation = await userApiContext.post("/api/farms", {
      data: { name: "x", location: "" }
    });

    // assert
    expect(emptyLocation.status()).toBe(400);
  });

  test("@api @regression should reject invalid field payloads", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const noFarm = await userApiContext.post("/api/fields", {
      data: { name: "f", area: 1.2 }
    });

    // assert
    expect(noFarm.status()).toBe(400);

    // act
    const negativeArea = await userApiContext.post("/api/fields", {
      data: { name: "f", area: -1, farm: { id: 999999 } }
    });

    // assert
    expect([400, 404]).toContain(negativeArea.status());

    // act
    const zeroArea = await userApiContext.post("/api/fields", {
      data: { name: "f-zero", area: 0, farm: { id: 999999 } }
    });

    // assert
    expect([400, 404]).toContain(zeroArea.status());
  });

  test("@api @regression should reject invalid crop payloads", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const emptyName = await userApiContext.post("/api/crops", {
      data: { name: "", expectedYield: 1 }
    });

    // assert
    expect(emptyName.status()).toBe(400);

    // act
    const negativeYield = await userApiContext.post("/api/crops", {
      data: { name: "crop-invalid", expectedYield: -10 }
    });

    // assert
    expect(negativeYield.status()).toBe(400);

    // act
    const zeroYield = await userApiContext.post("/api/crops", {
      data: { name: "crop-zero", expectedYield: 0 }
    });

    // assert
    expect(zeroYield.status()).toBe(400);
  });

  test("@api @regression should reject invalid planting payloads", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const missingRelations = await userApiContext.post("/api/plantings", {
      data: { plantingDate: "2026-01-01", expectedHarvestDate: "2026-01-02" }
    });

    // assert
    expect(missingRelations.status()).toBe(400);

    // act
    const invalidDates = await userApiContext.post("/api/plantings", {
      data: {
        plantingDate: "2026-12-31",
        expectedHarvestDate: "2026-01-01",
        field: { id: 999999 },
        crop: { id: 999999 }
      }
    });

    // assert
    expect([400, 404]).toContain(invalidDates.status());
  });

  test("@api @regression should reject invalid harvest payloads", async ({ userApiContext }) => {
    // arrange
    // no preconditions

    // act
    const missingPlanting = await userApiContext.post("/api/harvests", {
      data: { harvestDate: "2026-01-01", yieldAmount: 1.2 }
    });

    // assert
    expect(missingPlanting.status()).toBe(400);

    // act
    const negativeYield = await userApiContext.post("/api/harvests", {
      data: { harvestDate: "2026-01-01", yieldAmount: -1, planting: { id: 999999 } }
    });

    // assert
    expect([400, 404]).toContain(negativeYield.status());
  });
});
