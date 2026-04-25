import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { Planting } from "../types/contracts";

export class PlantingController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createPlanting(payload: Planting): Promise<Planting> {
    const response = await this.request.post("/api/plantings", { data: payload });
    await this.expectStatus(response, 201);
    return this.toPlanting(await response.json(), payload);
  }

  async getPlantingById(id: number): Promise<{ status: number; body?: Planting }> {
    const response = await this.request.get(`/api/plantings/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    return {
      status: 200,
      body: this.toPlanting(await response.json(), { id, plantingDate: "", expectedHarvestDate: "", field: { id: 0 }, crop: { id: 0 } })
    };
  }

  async updatePlanting(id: number, payload: Planting): Promise<Planting> {
    const response = await this.request.put(`/api/plantings/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return this.toPlanting(await response.json(), { ...payload, id });
  }

  async deletePlanting(id: number): Promise<void> {
    const response = await this.request.delete(`/api/plantings/${id}`);
    await this.expectStatus(response, 204);
  }

  async listPlantings(): Promise<Planting[]> {
    const response = await this.request.get("/api/plantings");
    await this.expectStatus(response, 200);
    const body = await response.json();
    if (!Array.isArray(body)) return [];
    return body.map((item) => this.toPlanting(item, { plantingDate: "", expectedHarvestDate: "", field: { id: 0 }, crop: { id: 0 } }));
  }

  private toPlanting(raw: unknown, fallback: Planting): Planting {
    const data = (raw ?? {}) as Record<string, unknown>;
    const field = (data.field ?? {}) as Record<string, unknown>;
    const crop = (data.crop ?? {}) as Record<string, unknown>;

    return {
      id: typeof data.id === "number" ? data.id : fallback.id,
      plantingDate: typeof data.plantingDate === "string" ? data.plantingDate : fallback.plantingDate,
      expectedHarvestDate:
        typeof data.expectedHarvestDate === "string" ? data.expectedHarvestDate : fallback.expectedHarvestDate,
      field: { id: typeof field.id === "number" ? field.id : fallback.field.id },
      crop: { id: typeof crop.id === "number" ? crop.id : fallback.crop.id }
    };
  }
}
