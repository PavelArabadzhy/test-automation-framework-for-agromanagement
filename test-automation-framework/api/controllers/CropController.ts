import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { Crop } from "../types/contracts";

export class CropController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createCrop(payload: Crop): Promise<Crop> {
    const response = await this.request.post("/api/crops", { data: payload });
    await this.expectStatus(response, 201);
    return this.toCrop(await response.json(), payload);
  }

  async getCropById(id: number): Promise<{ status: number; body?: Crop }> {
    const response = await this.request.get(`/api/crops/${id}`);
    if (response.status() !== 200) return { status: response.status() };
    return { status: 200, body: this.toCrop(await response.json(), { id, name: "", expectedYield: 0 }) };
  }

  async updateCrop(id: number, payload: Crop): Promise<Crop> {
    const response = await this.request.put(`/api/crops/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return this.toCrop(await response.json(), { ...payload, id });
  }

  async deleteCrop(id: number): Promise<void> {
    const response = await this.request.delete(`/api/crops/${id}`);
    await this.expectStatus(response, 204);
  }

  async listCrops(): Promise<Crop[]> {
    const response = await this.request.get("/api/crops");
    await this.expectStatus(response, 200);
    const body = await response.json();
    if (!Array.isArray(body)) return [];
    return body.map((item) => this.toCrop(item, { name: "", expectedYield: 0 }));
  }

  private toCrop(raw: unknown, fallback: Crop): Crop {
    const data = (raw ?? {}) as Record<string, unknown>;
    return {
      id: typeof data.id === "number" ? data.id : fallback.id,
      name: typeof data.name === "string" ? data.name : fallback.name,
      expectedYield: typeof data.expectedYield === "number" ? data.expectedYield : fallback.expectedYield
    };
  }
}
