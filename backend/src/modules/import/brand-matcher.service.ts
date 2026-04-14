import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from '../../entities/brand.entity';
import { Model, BodyType } from '../../entities/model.entity';

@Injectable()
export class BrandMatcherService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepo: Repository<Brand>,
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>,
  ) {}

  async findOrCreateBrand(name: string): Promise<Brand> {
    let brand = await this.brandRepo.findOne({ where: { name } });
    if (!brand) {
      brand = this.brandRepo.create({ name });
      brand = await this.brandRepo.save(brand);
    }
    return brand;
  }

  async findOrCreateModel(
    brand: Brand,
    modelName: string,
    bodyType: string,
    fuelType: string,
  ): Promise<Model> {
    let model = await this.modelRepo.findOne({
      where: { brandId: brand.id, name: modelName },
    });

    const normalizedBodyType = this.normalizeBodyType(bodyType);

    if (!model) {
      model = this.modelRepo.create({
        brandId: brand.id,
        name: modelName,
        bodyType: normalizedBodyType,
        fuelTypes: [fuelType],
      });
      model = await this.modelRepo.save(model);
    } else {
      // Add fuel type if not already present
      if (!model.fuelTypes.includes(fuelType)) {
        model.fuelTypes = [...model.fuelTypes, fuelType];
        model = await this.modelRepo.save(model);
      }
    }

    return model;
  }

  private normalizeBodyType(raw: string): BodyType {
    const lower = raw.toLowerCase().trim();
    const mapping: Record<string, BodyType> = {
      sedan: BodyType.SEDAN,
      suv: BodyType.SUV,
      hatchback: BodyType.HATCHBACK,
      minivan: BodyType.MINIVAN,
      coupe: BodyType.COUPE,
      convertible: BodyType.CONVERTIBLE,
      wagon: BodyType.WAGON,
      pickup: BodyType.PICKUP,
    };
    return mapping[lower] || BodyType.SEDAN;
  }
}
