import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient";
import { Planting } from "../types/domain";

export class PlantingClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createPlanting(payload: Planting): Promise<Planting> {
    const response = await this.request.post("/api/plantings", { data: payload });
    await this.expectStatus(response, 201);
    const raw = await response.text();
    const idMatch = raw.match(/"id":\s*(\d+)/);
    return { ...payload, id: idMatch ? Number(idMatch[1]) : undefined };
  }

  async getPlantingById(id: number): Promise<{ status: number; body?: Planting }> {
    const response = await this.request.get(`/api/plantings/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    const raw = await response.text();
    const plantingDateMatch = raw.match(/"plantingDate":"([^"]*)"/);
    const expectedHarvestDateMatch = raw.match(/"expectedHarvestDate":"([^"]*)"/);
    return {
      status: 200,
      body: {
        id,
        plantingDate: plantingDateMatch ? plantingDateMatch[1] : "",
        expectedHarvestDate: expectedHarvestDateMatch ? expectedHarvestDateMatch[1] : "",
        field: { id: 0 },
        crop: { id: 0 }
      }
    };
  }

  async updatePlanting(id: number, payload: Planting): Promise<Planting> {
    const response = await this.request.put(`/api/plantings/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return { ...payload, id };
  }

  async deletePlanting(id: number): Promise<void> {
    const response = await this.request.delete(`/api/plantings/${id}`);
    await this.expectStatus(response, 204);
  }

  async listPlantings(): Promise<Planting[]> {
    const response = await this.request.get("/api/plantings");
    await this.expectStatus(response, 200);
    const raw = await response.text();
    const matches = [...raw.matchAll(/"id":(\d+),"plantingDate":"([^"]*)","expectedHarvestDate":"([^"]*)"/g)];
    return matches.map((m) => ({
      id: Number(m[1]),
      plantingDate: m[2],
      expectedHarvestDate: m[3],
      field: { id: 0 },
      crop: { id: 0 }
    }));
  }
}
