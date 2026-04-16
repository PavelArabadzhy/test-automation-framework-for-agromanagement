import { FarmClient } from "../clients/FarmClient";
import { Farm } from "../types/domain";

export class FarmService {
  constructor(private readonly farmClient: FarmClient) {}

  async createFarm(name: string, location: string): Promise<Farm> {
    return this.farmClient.createFarm({ name, location });
  }

  async cleanupFarmIfExists(farmId?: number): Promise<void> {
    if (!farmId) return;
    const existing = await this.farmClient.getFarmById(farmId);
    if (existing.status === 200) {
      await this.farmClient.deleteFarm(farmId);
    }
  }
}
