import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Market } from '../../entities/market.entity';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Market)
    private readonly marketRepo: Repository<Market>,
  ) {}

  findAll(): Promise<Market[]> {
    return this.marketRepo.find({ where: { isActive: true } });
  }

  findByCode(code: string): Promise<Market | null> {
    return this.marketRepo.findOne({ where: { code } });
  }
}
