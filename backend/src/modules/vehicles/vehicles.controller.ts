import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { ScoringService } from './scoring.service';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { CompareVehiclesDto } from './dto/compare-vehicles.dto';
import { RecommendDto } from './dto/recommend.dto';

@Controller('api/vehicles')
export class VehiclesController {
  constructor(
    private readonly vehiclesService: VehiclesService,
    private readonly scoringService: ScoringService,
  ) {}

  @Get()
  search(@Query() query: SearchVehiclesDto) {
    return this.vehiclesService.search(query);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.vehiclesService.findById(id);
  }

  @Post('compare')
  compare(@Body() body: CompareVehiclesDto) {
    return this.vehiclesService.compare(body.ids);
  }

  @Post('recommend')
  async recommend(@Body() body: RecommendDto) {
    const searchQuery = {
      market: body.market,
      condition: body.condition === 'both' ? undefined : body.condition,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      bodyType: body.bodyType,
      fuelType: body.fuelType,
      transmission: body.transmission,
      sort: body.sort,
      page: 1,
      limit: 500,
    };

    const result = await this.vehiclesService.search(searchQuery);

    const scored = this.scoringService.scoreVehicles(result.data, {
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      fuelType: body.fuelType,
      transmission: body.transmission,
      bodyType: body.bodyType,
    });

    // Paginate the scored results
    const total = scored.length;
    const start = (body.page - 1) * body.limit;
    const paged = scored.slice(start, start + body.limit);

    return {
      data: paged,
      total,
      page: body.page,
      limit: body.limit,
      totalPages: Math.ceil(total / body.limit),
    };
  }
}
