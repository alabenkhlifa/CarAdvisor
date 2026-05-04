import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from '../../entities/chat-session.entity';
import { Vehicle } from '../../entities/vehicle.entity';
import { Market } from '../../entities/market.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { ChatService } from './chat.service';
import { AiService } from './ai.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, Vehicle, Market]),
    VehiclesModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, AiService],
  exports: [ChatService],
})
export class ChatModule {}
