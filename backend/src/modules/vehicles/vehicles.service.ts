import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Market } from '../../entities/market.entity';
import {
  SearchVehiclesDto,
  VehicleSortOption,
} from './dto/search-vehicles.dto';
import {
  PaginatedResponse,
  paginate,
} from '../../common/dto/pagination.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Market)
    private readonly marketRepo: Repository<Market>,
  ) {}

  async search(query: SearchVehiclesDto): Promise<PaginatedResponse<Vehicle>> {
    const market = await this.marketRepo.findOne({
      where: { code: query.market },
    });
    if (!market) {
      throw new NotFoundException(`Market not found: ${query.market}`);
    }

    const qb = this.vehicleRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.model', 'model')
      .leftJoinAndSelect('model.brand', 'brand')
      .leftJoinAndSelect('v.market', 'market')
      .where('v.marketId = :marketId', { marketId: market.id })
      .andWhere('v.isAvailable = true');

    if (query.condition) {
      qb.andWhere('v.condition = :condition', { condition: query.condition });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('v.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('v.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.bodyType) {
      qb.andWhere('model.bodyType = :bodyType', { bodyType: query.bodyType });
    }

    if (query.fuelType) {
      qb.andWhere('v.fuelType = :fuelType', { fuelType: query.fuelType });
    }

    if (query.transmission) {
      qb.andWhere('v.transmission = :transmission', {
        transmission: query.transmission,
      });
    }

    if (query.brandId) {
      qb.andWhere('model.brandId = :brandId', { brandId: query.brandId });
    }

    if (query.modelId) {
      qb.andWhere('v.modelId = :modelId', { modelId: query.modelId });
    }

    switch (query.sort) {
      case VehicleSortOption.PRICE_ASC:
        qb.orderBy('v.price', 'ASC');
        break;
      case VehicleSortOption.PRICE_DESC:
        qb.orderBy('v.price', 'DESC');
        break;
      case VehicleSortOption.YEAR_ASC:
        qb.orderBy('v.year', 'ASC');
        break;
      case VehicleSortOption.YEAR_DESC:
        qb.orderBy('v.year', 'DESC');
        break;
      default:
        qb.orderBy('v.price', 'ASC');
    }

    const skip = (query.page - 1) * query.limit;
    qb.skip(skip).take(query.limit);

    const [data, total] = await qb.getManyAndCount();
    return paginate(data, total, query.page, query.limit);
  }

  async findById(id: number): Promise<Vehicle> {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id },
      relations: ['model', 'model.brand', 'market'],
    });
    if (!vehicle) {
      throw new NotFoundException(`Vehicle not found: ${id}`);
    }
    return vehicle;
  }

  async compare(ids: number[]): Promise<Vehicle[]> {
    const vehicles = await this.vehicleRepo.find({
      where: { id: In(ids) },
      relations: ['model', 'model.brand', 'market'],
    });
    if (vehicles.length === 0) {
      throw new NotFoundException('No vehicles found for the given IDs');
    }
    return vehicles;
  }
}
