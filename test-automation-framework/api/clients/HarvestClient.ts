import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient";
import { Harvest } from "../types/domain";

export class HarvestClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createHarvest(payload: Harvest): Promise<Harvest> {
    const response = await this.request.post("/api/harvests", { data: payload });
    await this.expectStatus(response, 201);
    const raw = await response.text();
    const idMatch = raw.match(/"id":\s*(\d+)/);
    return { ...payload, id: idMatch ? Number(idMatch[1]) : undefined };
  }

  async getHarvestById(id: number): Promise<{ status: number; body?: Harvest }> {
    const response = await this.request.get(`/api/harvests/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    const raw = await response.text();
    const harvestDateMatch = raw.match(/"harvestDate"\s*:\s*"([^"]*)"/);
    const harvestDateAltMatch = raw.match(/"harvest_date"\s*:\s*"([^"]*)"/);
    const yieldAmountMatch = raw.match(/"yieldAmount":([0-9.]+)/);
    const plantingIdMatch = raw.match(/"planting"\s*:\s*\{\s*"id"\s*:\s*(\d+)/);
    let harvestDate = harvestDateMatch?.[1] ?? harvestDateAltMatch?.[1] ?? "";
    if (!harvestDate) {
      const fromList = (await this.listHarvests()).find((item) => item.id === id);
      harvestDate = fromList?.harvestDate ?? "";
    }
    return {
      status: 200,
      body: {
        id,
        planting: { id: plantingIdMatch ? Number(plantingIdMatch[1]) : 0 },
        harvestDate,
        yieldAmount: yieldAmountMatch ? Number(yieldAmountMatch[1]) : 0
      }
    };
  }

  async updateHarvest(id: number, payload: Harvest): Promise<Harvest> {
    const response = await this.request.put(`/api/harvests/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return { ...payload, id };
  }

  async deleteHarvest(id: number): Promise<void> {
    const response = await this.request.delete(`/api/harvests/${id}`);
    await this.expectStatus(response, 204);
  }

  async listHarvests(): Promise<Harvest[]> {
    const response = await this.request.get("/api/harvests");
    await this.expectStatus(response, 200);
    const raw = await response.text();
    const matches = [...raw.matchAll(/"id":(\d+),"harvestDate":"([^"]*)","yieldAmount":([0-9.]+)/g)];
    return matches.map((m) => ({
      id: Number(m[1]),
      planting: { id: 0 },
      harvestDate: m[2],
      yieldAmount: Number(m[3])
    }));
  }
}
