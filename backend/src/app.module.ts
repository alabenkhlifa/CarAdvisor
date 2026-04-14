import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { MarketsModule } from './modules/markets/markets.module';
import { ImportModule } from './modules/import/import.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { BrandsModule } from './modules/brands/brands.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),
    ScheduleModule.forRoot(),
    MarketsModule,
    ImportModule,
    VehiclesModule,
    BrandsModule,
    ChatModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
