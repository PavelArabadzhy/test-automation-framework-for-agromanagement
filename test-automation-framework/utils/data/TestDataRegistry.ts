export class TestDataRegistry {
  private farmIds: number[] = [];
  private fieldIds: number[] = [];
  private cropIds: number[] = [];
  private plantingIds: number[] = [];
  private harvestIds: number[] = [];

  registerFarmId(id?: number): void {
    if (id) this.farmIds.push(id);
  }

  registerFieldId(id?: number): void {
    if (id) this.fieldIds.push(id);
  }

  registerCropId(id?: number): void {
    if (id) this.cropIds.push(id);
  }

  registerPlantingId(id?: number): void {
    if (id) this.plantingIds.push(id);
  }

  registerHarvestId(id?: number): void {
    if (id) this.harvestIds.push(id);
  }

  consumeFarmIds(): number[] {
    return [...this.farmIds].reverse();
  }

  consumeFieldIds(): number[] {
    return [...this.fieldIds].reverse();
  }

  consumeCropIds(): number[] {
    return [...this.cropIds].reverse();
  }

  consumePlantingIds(): number[] {
    return [...this.plantingIds].reverse();
  }

  consumeHarvestIds(): number[] {
    return [...this.harvestIds].reverse();
  }
}
