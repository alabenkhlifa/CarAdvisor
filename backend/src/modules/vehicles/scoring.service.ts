import { Injectable } from '@nestjs/common';
import { Vehicle } from '../../entities/vehicle.entity';

export interface RecommendPreferences {
  minPrice?: number;
  maxPrice?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
}

export interface ScoredVehicle extends Vehicle {
  score: number;
}

const WEIGHTS = {
  priceFit: 0.35,
  fuelMatch: 0.2,
  transmissionMatch: 0.15,
  bodyTypeMatch: 0.15,
  yearNewness: 0.15,
};

@Injectable()
export class ScoringService {
  scoreVehicles(
    vehicles: Vehicle[],
    preferences: RecommendPreferences,
  ): ScoredVehicle[] {
    const currentYear = new Date().getFullYear();

    const scored = vehicles.map((vehicle) => {
      const priceFitScore = this.scorePriceFit(vehicle, preferences);
      const fuelScore = this.scoreFuelMatch(vehicle, preferences);
      const transmissionScore = this.scoreTransmissionMatch(
        vehicle,
        preferences,
      );
      const bodyTypeScore = this.scoreBodyTypeMatch(vehicle, preferences);
      const yearScore = this.scoreYearNewness(vehicle, currentYear);

      const totalScore = Math.round(
        priceFitScore * WEIGHTS.priceFit +
          fuelScore * WEIGHTS.fuelMatch +
          transmissionScore * WEIGHTS.transmissionMatch +
          bodyTypeScore * WEIGHTS.bodyTypeMatch +
          yearScore * WEIGHTS.yearNewness,
      );

      return Object.assign({}, vehicle, { score: totalScore }) as ScoredVehicle;
    });

    return scored.sort((a, b) => b.score - a.score);
  }

  private scorePriceFit(
    vehicle: Vehicle,
    preferences: RecommendPreferences,
  ): number {
    const { minPrice, maxPrice } = preferences;

    if (minPrice === undefined && maxPrice === undefined) {
      return 80;
    }

    const min = minPrice ?? 0;
    const max = maxPrice ?? min * 3;
    const price = Number(vehicle.price);

    if (price < min || price > max) {
      return 0;
    }

    const midpoint = (min + max) / 2;
    const halfRange = (max - min) / 2;

    if (halfRange === 0) {
      return price === midpoint ? 100 : 0;
    }

    const distance = Math.abs(price - midpoint);
    const ratio = distance / halfRange;

    return Math.round(100 - ratio * 50);
  }

  private scoreFuelMatch(
    vehicle: Vehicle,
    preferences: RecommendPreferences,
  ): number {
    if (!preferences.fuelType) {
      return 80;
    }
    return vehicle.fuelType.toLowerCase() ===
      preferences.fuelType.toLowerCase()
      ? 100
      : 0;
  }

  private scoreTransmissionMatch(
    vehicle: Vehicle,
    preferences: RecommendPreferences,
  ): number {
    if (!preferences.transmission) {
      return 80;
    }
    return vehicle.transmission.toLowerCase() ===
      preferences.transmission.toLowerCase()
      ? 100
      : 0;
  }

  private scoreBodyTypeMatch(
    vehicle: Vehicle,
    preferences: RecommendPreferences,
  ): number {
    if (!preferences.bodyType) {
      return 80;
    }
    const vehicleBodyType = vehicle.model?.bodyType;
    if (!vehicleBodyType) {
      return 0;
    }
    return vehicleBodyType.toLowerCase() === preferences.bodyType.toLowerCase()
      ? 100
      : 0;
  }

  private scoreYearNewness(vehicle: Vehicle, currentYear: number): number {
    const yearsOld = currentYear - vehicle.year;
    const score = 100 - yearsOld * 5;
    return Math.max(score, 20);
  }
}
