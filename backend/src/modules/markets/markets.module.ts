import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Market } from '../../entities/market.entity';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Market])],
  controllers: [MarketsController],
  providers: [MarketsService],
  exports: [MarketsService],
})
export class MarketsModule {}
