import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../entities/brand.entity';
import { Model } from '../../entities/model.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Market } from '../../entities/market.entity';

export interface ModelFilter {
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
}

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Market)
    private readonly marketRepo: Repository<Market>,
  ) {}

  async findByMarket(
    marketCode: string,
    filters: ModelFilter = {},
  ): Promise<Brand[]> {
    const market = await this.marketRepo.findOne({
      where: { code: marketCode },
    });
    if (!market) {
      throw new NotFoundException(`Market not found: ${marketCode}`);
    }

    const qb = this.brandRepo
      .createQueryBuilder('brand')
      .innerJoin('brand.models', 'model')
      .innerJoin(
        'vehicles',
        'v',
        'v."modelId" = model.id AND v."marketId" = :marketId AND v."isAvailable" = true',
        { marketId: market.id },
      );

    if (filters.condition) {
      qb.andWhere('v.condition = :condition', { condition: filters.condition });
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('v.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('v.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.bodyType) {
      qb.andWhere('model."bodyType" = :bodyType', { bodyType: filters.bodyType });
    }
    if (filters.fuelType) {
      qb.andWhere('v."fuelType" = :fuelType', { fuelType: filters.fuelType });
    }
    if (filters.transmission) {
      qb.andWhere('v.transmission = :transmission', {
        transmission: filters.transmission,
      });
    }

    return qb.groupBy('brand.id').orderBy('brand.name', 'ASC').getMany();
  }

  async findModels(
    brandId: number,
    marketCode?: string,
    filters: ModelFilter = {},
  ): Promise<Model[]> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`Brand not found: ${brandId}`);
    }

    if (!marketCode) {
      return this.modelRepo.find({
        where: { brandId },
        order: { name: 'ASC' },
      });
    }

    const market = await this.marketRepo.findOne({
      where: { code: marketCode },
    });
    if (!market) {
      throw new NotFoundException(`Market not found: ${marketCode}`);
    }

    const qb = this.modelRepo
      .createQueryBuilder('model')
      .innerJoin(
        'vehicles',
        'v',
        'v."modelId" = model.id AND v."marketId" = :marketId AND v."isAvailable" = true',
        { marketId: market.id },
      )
      .where('model.brandId = :brandId', { brandId });

    if (filters.condition) {
      qb.andWhere('v.condition = :condition', { condition: filters.condition });
    }
    if (filters.minPrice !== undefined) {
      qb.andWhere('v.price >= :minPrice', { minPrice: filters.minPrice });
    }
    if (filters.maxPrice !== undefined) {
      qb.andWhere('v.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }
    if (filters.bodyType) {
      qb.andWhere('model."bodyType" = :bodyType', { bodyType: filters.bodyType });
    }
    if (filters.fuelType) {
      qb.andWhere('v."fuelType" = :fuelType', { fuelType: filters.fuelType });
    }
    if (filters.transmission) {
      qb.andWhere('v.transmission = :transmission', {
        transmission: filters.transmission,
      });
    }

    return qb.groupBy('model.id').orderBy('model.name', 'ASC').getMany();
  }
}
