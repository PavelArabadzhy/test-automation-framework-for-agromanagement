import { APIRequestContext } from "@playwright/test";
import { BaseApiController } from "./BaseApiController";
import { Field } from "../types/contracts";

export class FieldController extends BaseApiController {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createField(payload: Field): Promise<Field> {
    const response = await this.request.post("/api/fields", { data: payload });
    await this.expectStatus(response, 201);
    return this.toField(await response.json(), payload);
  }

  async listFields(): Promise<Field[]> {
    const response = await this.request.get("/api/fields");
    await this.expectStatus(response, 200);
    const body = await response.json();
    if (!Array.isArray(body)) return [];
    return body.map((item) => this.toField(item, { name: "", area: 0, farm: { id: 0 } }));
  }

  async getFieldById(id: number): Promise<{ status: number; body?: Field }> {
    const response = await this.request.get(`/api/fields/${id}`);
    if (response.status() !== 200) {
      return { status: response.status() };
    }
    return { status: 200, body: this.toField(await response.json(), { id, name: "", area: 0, farm: { id: 0 } }) };
  }

  async updateField(id: number, payload: Field): Promise<Field> {
    const response = await this.request.put(`/api/fields/${id}`, { data: payload });
    await this.expectStatus(response, 200);
    return this.toField(await response.json(), { ...payload, id });
  }

  async deleteField(id: number): Promise<void> {
    const response = await this.request.delete(`/api/fields/${id}`);
    await this.expectStatus(response, 204);
  }

  private toField(raw: unknown, fallback: Field): Field {
    const data = (raw ?? {}) as Record<string, unknown>;
    const farm = (data.farm ?? {}) as Record<string, unknown>;
    return {
      id: typeof data.id === "number" ? data.id : fallback.id,
      name: typeof data.name === "string" ? data.name : fallback.name,
      area: typeof data.area === "number" ? data.area : fallback.area,
      farm: {
        id: typeof farm.id === "number" ? farm.id : fallback.farm.id
      }
    };
  }
}
