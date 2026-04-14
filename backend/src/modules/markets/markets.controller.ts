import { Controller, Get } from '@nestjs/common';
import { MarketsService } from './markets.service';

@Controller('api/markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Get()
  findAll() {
    return this.marketsService.findAll();
  }
}
