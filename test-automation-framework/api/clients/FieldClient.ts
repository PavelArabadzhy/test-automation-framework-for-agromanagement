import { APIRequestContext } from "@playwright/test";
import { BaseApiClient } from "./BaseApiClient";
import { Field } from "../types/domain";

export class FieldClient extends BaseApiClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createField(payload: Field): Promise<Field> {
    const response = await this.request.post("/api/fields", { data: payload });
    await this.expectStatus(response, 201);
    const raw = await response.text();
    const idMatch = raw.match(/"id":\s*(\d+)/);
    return {
      id: idMatch ? Number(idMatch[1]) : undefined,
      name: payload.name,
      area: payload.area,
      farm: payload.farm
    };
  }

  async listFields(): Promise<Field[]> {
    const response = await this.request.get("/api/fields");
    await this.expectStatus(response, 200);
    const raw = await response.text();
    const matches = [...raw.matchAll(/"id":(\d+),"name":"([^"]*)","area":([0-9.]+)/g)];
    return matches.map((match) => ({
      id: Number(match[1]),
      name: match[2],
      area: Number(match[3]),
      farm: { id: 0 }
    }));
  }

  async getFieldById(id: number): Promise<{ status: number; body?: Field }> {
    const response = await this.request.get(`/api/fields/${id}`);
    if (response.status() !== 200) {
      return { status: response.status() };
    }
    const raw = await response.text();
    const areaMatch = raw.match(/"area":([0-9.]+)/);
    const nameMatch = raw.match(/"name":"([^"]*)"/);
    return {
      status: 200,
      body: {
        id,
        name: nameMatch ? nameMatch[1] : "",
        area: areaMatch ? Number(areaMatch[1]) : 0,
        farm: { id: 0 }
      }
    };
  }

  async updateField(id: number, payload: Field): Promise<Field> {
    const response = await this.request.put(`/api/fields/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return {
      id,
      name: payload.name,
      area: payload.area,
      farm: payload.farm
    };
  }

  async deleteField(id: number): Promise<void> {
    const response = await this.request.delete(`/api/fields/${id}`);
    await this.expectStatus(response, 204);
  }
}
