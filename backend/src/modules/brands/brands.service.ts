import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../entities/brand.entity';
import { Model } from '../../entities/model.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Market } from '../../entities/market.entity';

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

  async findByMarket(marketCode: string): Promise<Brand[]> {
    const market = await this.marketRepo.findOne({
      where: { code: marketCode },
    });
    if (!market) {
      throw new NotFoundException(`Market not found: ${marketCode}`);
    }

    // Get brands that have at least one available vehicle in this market
    const brands = await this.brandRepo
      .createQueryBuilder('brand')
      .innerJoin('brand.models', 'model')
      .innerJoin(
        'vehicles',
        'v',
        'v."modelId" = model.id AND v."marketId" = :marketId AND v."isAvailable" = true',
        { marketId: market.id },
      )
      .groupBy('brand.id')
      .orderBy('brand.name', 'ASC')
      .getMany();

    return brands;
  }

  async findModels(brandId: number): Promise<Model[]> {
    const brand = await this.brandRepo.findOne({ where: { id: brandId } });
    if (!brand) {
      throw new NotFoundException(`Brand not found: ${brandId}`);
    }

    return this.modelRepo.find({
      where: { brandId },
      order: { name: 'ASC' },
    });
  }
}
