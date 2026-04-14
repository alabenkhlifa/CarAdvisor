import api from './api';
import type { Market } from '@shared/types';

export async function getMarkets(): Promise<Market[]> {
  const { data } = await api.get<Market[]>('/markets');
  return data;
}
