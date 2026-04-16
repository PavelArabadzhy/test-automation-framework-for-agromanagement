export interface ApiResponseMessage {
  success: boolean;
  message: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Farm {
  id?: number;
  name: string;
  location: string;
}

export interface Field {
  id?: number;
  name: string;
  area: number;
  farm: { id: number };
}

export interface Crop {
  id?: number;
  name: string;
  expectedYield: number;
}

export interface Planting {
  id?: number;
  plantingDate: string;
  expectedHarvestDate: string;
  field: { id: number };
  crop: { id: number };
}

export interface Harvest {
  id?: number;
  planting: { id: number };
  harvestDate: string;
  yieldAmount: number;
}
