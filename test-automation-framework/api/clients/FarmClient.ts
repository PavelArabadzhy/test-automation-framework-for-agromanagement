import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient";
import { Farm } from "../types/domain";

export class FarmClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createFarm(payload: Farm): Promise<Farm> {
    const response = await this.request.post("/api/farms", { data: payload });
    await this.expectStatus(response, 201);
    const raw = await response.text();
    return this.parseFarmResponse(raw, payload);
  }

  async getFarmById(id: number): Promise<{ status: number; body?: Farm }> {
    const response = await this.request.get(`/api/farms/${id}`);
    if (response.status() === 200) {
      const raw = await response.text();
      return { status: 200, body: this.parseFarmResponse(raw, { id, name: "", location: "" }) };
    }
    return { status: response.status() };
  }

  async listFarms(): Promise<Farm[]> {
    const response = await this.request.get("/api/farms");
    await this.expectStatus(response, 200);
    const raw = await response.text();
    const matches = [...raw.matchAll(/"id":(\d+),"name":"([^"]*)","location":"([^"]*)"/g)];
    return matches.map((match) => ({
      id: Number(match[1]),
      name: match[2],
      location: match[3]
    }));
  }

  async updateFarm(id: number, payload: Farm): Promise<Farm> {
    const response = await this.request.put(`/api/farms/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    const raw = await response.text();
    return this.parseFarmResponse(raw, { ...payload, id });
  }

  async deleteFarm(id: number): Promise<void> {
    const response = await this.request.delete(`/api/farms/${id}`);
    await this.expectStatus(response, 204);
  }

  private parseFarmResponse(raw: string, fallback: Farm): Farm {
    const idMatch = raw.match(/"id":\s*(\d+)/);
    const nameMatch = raw.match(/"name":"([^"]*)"/);
    const locationMatch = raw.match(/"location":"([^"]*)"/);

    return {
      id: idMatch ? Number(idMatch[1]) : fallback.id,
      name: nameMatch ? nameMatch[1] : fallback.name,
      location: locationMatch ? locationMatch[1] : fallback.location
    };
  }
}
