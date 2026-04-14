import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Brand } from '../../entities/brand.entity';
import { Model } from '../../entities/model.entity';
import { Market } from '../../entities/market.entity';
import { ImportLog } from '../../entities/import-log.entity';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';
import { ImportCron } from './import.cron';
import { CsvParserService } from './csv-parser.service';
import { BrandMatcherService } from './brand-matcher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, Brand, Model, Market, ImportLog]),
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportCron, CsvParserService, BrandMatcherService],
  exports: [ImportService],
})
export class ImportModule {}
