import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { Harvest } from "../types/contracts";

export class HarvestController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createHarvest(payload: Harvest): Promise<Harvest> {
    const response = await this.request.post("/api/harvests", { data: payload });
    await this.expectStatus(response, 201);
    return this.toHarvest(await response.json(), payload);
  }

  async getHarvestById(id: number): Promise<{ status: number; body?: Harvest }> {
    const response = await this.request.get(`/api/harvests/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    return {
      status: 200,
      body: this.toHarvest(await response.json(), { id, planting: { id: 0 }, harvestDate: "", yieldAmount: 0 })
    };
  }

  async updateHarvest(id: number, payload: Harvest): Promise<Harvest> {
    const response = await this.request.put(`/api/harvests/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return this.toHarvest(await response.json(), { ...payload, id });
  }

  async deleteHarvest(id: number): Promise<void> {
    const response = await this.request.delete(`/api/harvests/${id}`);
    await this.expectStatus(response, 204);
  }

  async listHarvests(): Promise<Harvest[]> {
    const response = await this.request.get("/api/harvests");
    await this.expectStatus(response, 200);
    const body = await response.json();
    if (!Array.isArray(body)) return [];
    return body.map((item) => this.toHarvest(item, { planting: { id: 0 }, harvestDate: "", yieldAmount: 0 }));
  }

  private toHarvest(raw: unknown, fallback: Harvest): Harvest {
    const data = (raw ?? {}) as Record<string, unknown>;
    const planting = (data.planting ?? {}) as Record<string, unknown>;
    return {
      id: typeof data.id === "number" ? data.id : fallback.id,
      planting: { id: typeof planting.id === "number" ? planting.id : fallback.planting.id },
      harvestDate: typeof data.harvestDate === "string" ? data.harvestDate : fallback.harvestDate,
      yieldAmount: typeof data.yieldAmount === "number" ? data.yieldAmount : fallback.yieldAmount
    };
  }
}
