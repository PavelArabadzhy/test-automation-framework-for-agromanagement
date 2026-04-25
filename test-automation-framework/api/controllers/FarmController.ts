import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { Farm } from "../types/contracts";

export class FarmController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createFarm(payload: Farm): Promise<Farm> {
    const response = await this.request.post("/api/farms", { data: payload });
    await this.expectStatus(response, 201);
    return this.toFarm(await response.json(), payload);
  }

  async getFarmById(id: number): Promise<{ status: number; body?: Farm }> {
    const response = await this.request.get(`/api/farms/${id}`);
    if (response.status() === 200) {
      return { status: 200, body: this.toFarm(await response.json(), { id, name: "", location: "" }) };
    }
    return { status: response.status() };
  }

  async listFarms(): Promise<Farm[]> {
    const response = await this.request.get("/api/farms");
    await this.expectStatus(response, 200);
    const body = await response.json();
    if (!Array.isArray(body)) return [];
    return body.map((item) => this.toFarm(item, { name: "", location: "" }));
  }

  async updateFarm(id: number, payload: Farm): Promise<Farm> {
    const response = await this.request.put(`/api/farms/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return this.toFarm(await response.json(), { ...payload, id });
  }

  async deleteFarm(id: number): Promise<void> {
    const response = await this.request.delete(`/api/farms/${id}`);
    await this.expectStatus(response, 204);
  }

  private toFarm(raw: unknown, fallback: Farm): Farm {
    const data = (raw ?? {}) as Record<string, unknown>;
    return {
      id: typeof data.id === "number" ? data.id : fallback.id,
      name: typeof data.name === "string" ? data.name : fallback.name,
      location: typeof data.location === "string" ? data.location : fallback.location
    };
  }
}
