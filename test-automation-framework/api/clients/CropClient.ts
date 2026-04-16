import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient";
import { Crop } from "../types/domain";

export class CropClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createCrop(payload: Crop): Promise<Crop> {
    const response = await this.request.post("/api/crops", { data: payload });
    await this.expectStatus(response, 201);
    const raw = await response.text();
    const idMatch = raw.match(/"id":\s*(\d+)/);
    return { ...payload, id: idMatch ? Number(idMatch[1]) : undefined };
  }

  async getCropById(id: number): Promise<{ status: number; body?: Crop }> {
    const response = await this.request.get(`/api/crops/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    const raw = await response.text();
    const nameMatch = raw.match(/"name":"([^"]*)"/);
    const expectedYieldMatch = raw.match(/"expectedYield":([0-9.]+)/);
    return {
      status: 200,
      body: {
        id,
        name: nameMatch ? nameMatch[1] : "",
        expectedYield: expectedYieldMatch ? Number(expectedYieldMatch[1]) : 0
      }
    };
  }

  async updateCrop(id: number, payload: Crop): Promise<Crop> {
    const response = await this.request.put(`/api/crops/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return { ...payload, id };
  }

  async deleteCrop(id: number): Promise<void> {
    const response = await this.request.delete(`/api/crops/${id}`);
    await this.expectStatus(response, 204);
  }

  async listCrops(): Promise<Crop[]> {
    const response = await this.request.get("/api/crops");
    await this.expectStatus(response, 200);
    const raw = await response.text();
    const matches = [...raw.matchAll(/"id":(\d+),"name":"([^"]*)","expectedYield":([0-9.]+)/g)];
    return matches.map((m) => ({
      id: Number(m[1]),
      name: m[2],
      expectedYield: Number(m[3])
    }));
  }
}
