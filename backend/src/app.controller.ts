import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('api')
@SkipThrottle()
export class AppController {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  @Get('health/ready')
  async ready() {
    const checks = { database: false };
    try {
      await this.dataSource.query('SELECT 1');
      checks.database = true;
    } catch {
      // keep false
    }
    const ok = Object.values(checks).every(Boolean);
    return { status: ok ? 'ok' : 'degraded', checks };
  }
}
