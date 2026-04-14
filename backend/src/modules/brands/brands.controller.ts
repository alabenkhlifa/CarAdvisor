import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BrandsService } from './brands.service';

@Controller('api/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  findByMarket(@Query('market') market: string) {
    return this.brandsService.findByMarket(market);
  }

  @Get(':id/models')
  findModels(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findModels(id);
  }
}
