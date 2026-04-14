import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../../entities/vehicle.entity';
import { Market } from '../../entities/market.entity';
import { VehiclesService } from './vehicles.service';
import { ScoringService } from './scoring.service';
import { VehiclesController } from './vehicles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Market])],
  controllers: [VehiclesController],
  providers: [VehiclesService, ScoringService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
