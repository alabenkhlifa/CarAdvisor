import api from './api';
import type { Brand, Model } from '@shared/types';

export async function getBrands(market: string): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>('/brands', {
    params: { market },
  });
  return data;
}

export async function getModels(brandId: number): Promise<Model[]> {
  const { data } = await api.get<Model[]>(`/brands/${brandId}/models`);
  return data;
}
