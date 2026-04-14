import { Controller, Post, Query } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportCron } from './import.cron';

@Controller('api/import')
export class ImportController {
  constructor(
    private readonly importService: ImportService,
    private readonly importCron: ImportCron,
  ) {}

  @Post('trigger')
  async trigger(@Query('market') market: string) {
    if (!market) {
      return { error: 'market query parameter is required' };
    }
    return this.importService.importMarket(market);
  }

  @Post('refresh')
  async refresh() {
    await this.importCron.handleWeeklyImport();
    return { status: 'ok', message: 'CSVs downloaded and imported' };
  }
}
