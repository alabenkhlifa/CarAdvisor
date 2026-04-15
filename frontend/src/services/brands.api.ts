import api from './api';
import type { Brand, Model } from '@shared/types';

export interface ModelFilters {
  market?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
}

export async function getBrands(
  market: string,
  filters: ModelFilters = {},
): Promise<Brand[]> {
  const params: Record<string, string | number> = { market };
  if (filters.condition) params.condition = filters.condition;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.bodyType) params.bodyType = filters.bodyType;
  if (filters.fuelType) params.fuelType = filters.fuelType;
  if (filters.transmission) params.transmission = filters.transmission;
  const { data } = await api.get<Brand[]>('/brands', { params });
  return data;
}

export async function getModels(
  brandId: number,
  filters: ModelFilters = {},
): Promise<Model[]> {
  const params: Record<string, string | number> = {};
  if (filters.market) params.market = filters.market;
  if (filters.condition) params.condition = filters.condition;
  if (filters.minPrice !== undefined) params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice;
  if (filters.bodyType) params.bodyType = filters.bodyType;
  if (filters.fuelType) params.fuelType = filters.fuelType;
  if (filters.transmission) params.transmission = filters.transmission;
  const { data } = await api.get<Model[]>(`/brands/${brandId}/models`, { params });
  return data;
}
