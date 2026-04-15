import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BrandsService, ModelFilter } from './brands.service';

@Controller('api/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findByMarket(
    @Query('market') market: string,
    @Query('condition') condition?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('bodyType') bodyType?: string,
    @Query('fuelType') fuelType?: string,
    @Query('transmission') transmission?: string,
  ) {
    const filters: ModelFilter = {
      condition: condition && condition !== 'both' ? condition : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bodyType,
      fuelType,
      transmission,
    };
    return this.brandsService.findByMarket(market, filters);
  }

  @Get(':id/models')
  findModels(
    @Param('id', ParseIntPipe) id: number,
    @Query('market') market?: string,
    @Query('condition') condition?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('bodyType') bodyType?: string,
    @Query('fuelType') fuelType?: string,
    @Query('transmission') transmission?: string,
  ) {
    const filters: ModelFilter = {
      condition: condition && condition !== 'both' ? condition : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      bodyType,
      fuelType,
      transmission,
    };
    return this.brandsService.findModels(id, market, filters);
  }
}
