import { Model } from './brand';
import { Market } from './market';

export type VehicleCondition = 'new' | 'used';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'lpg';
export type Transmission = 'manual' | 'automatic';
export type VehicleSort = 'price_asc' | 'price_desc' | 'year_desc' | 'year_asc' | 'relevance';

export interface Vehicle {
  id: number;
  modelId: number;
  model?: Model;
  marketId: number;
  market?: Market;
  trimName: string | null;
  year: number;
  condition: VehicleCondition;
  price: number;
  mileageKm: number | null;
  fuelType: string;
  transmission: string;
  engineSize: string | null;
  horsepower: number | null;
  color: string | null;
  features: Record<string, boolean> | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  sourceId: string;
  isAvailable: boolean;
  listedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilter {
  market: string;
  condition?: VehicleCondition;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  brandId?: number;
  modelId?: number;
  sort?: VehicleSort;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
