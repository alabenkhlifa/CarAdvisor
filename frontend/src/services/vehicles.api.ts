import api from './api';
import type { Vehicle, VehicleFilter, PaginatedResponse } from '@shared/types';

export async function searchVehicles(
  filters: VehicleFilter,
): Promise<PaginatedResponse<Vehicle>> {
  const { data } = await api.get<PaginatedResponse<Vehicle>>('/vehicles', {
    params: {
      market: filters.market,
      condition: filters.condition,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      bodyType: filters.bodyType,
      fuelType: filters.fuelType,
      transmission: filters.transmission,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    },
  });
  return data;
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const { data } = await api.get<Vehicle>(`/vehicles/${id}`);
  return data;
}

export async function compareVehicles(ids: number[]): Promise<Vehicle[]> {
  const { data } = await api.post<Vehicle[]>('/vehicles/compare', { ids });
  return data;
}

export interface RecommendRequest {
  market: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function recommendVehicles(
  prefs: RecommendRequest,
): Promise<PaginatedResponse<Vehicle>> {
  const { data } = await api.post<PaginatedResponse<Vehicle>>(
    '/vehicles/recommend',
    prefs,
  );
  return data;
}
