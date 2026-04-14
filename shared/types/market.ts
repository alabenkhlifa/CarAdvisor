export type MarketCode = 'tn' | 'de';

export interface Market {
  id: number;
  code: MarketCode;
  name: string;
  currency: string;
  locale: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
