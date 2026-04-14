export interface Brand {
  id: number;
  name: string;
  logoUrl: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BodyType =
  | 'sedan'
  | 'suv'
  | 'hatchback'
  | 'minivan'
  | 'coupe'
  | 'convertible'
  | 'wagon'
  | 'pickup';

export interface Model {
  id: number;
  brandId: number;
  brand?: Brand;
  name: string;
  bodyType: BodyType;
  fuelTypes: string[];
  yearStart: number | null;
  yearEnd: number | null;
  createdAt: string;
  updatedAt: string;
}
