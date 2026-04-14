import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Brand } from '../entities/brand.entity';
import { Model } from '../entities/model.entity';
import { Market } from '../entities/market.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { ImportLog } from '../entities/import-log.entity';

export function getDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: configService.get<string>('POSTGRES_HOST', 'localhost'),
    port: configService.get<number>('POSTGRES_PORT', 5432),
    username: configService.get<string>('POSTGRES_USER', 'caradvisor'),
    password: configService.get<string>('POSTGRES_PASSWORD', 'caradvisor_dev'),
    database: configService.get<string>('POSTGRES_DB', 'caradvisor'),
    entities: [Brand, Model, Market, Vehicle, ChatSession, ImportLog],
    autoLoadEntities: true,
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
  };
}
