import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { Vehicle, VehicleCondition } from '../../entities/vehicle.entity';
import { ImportLog } from '../../entities/import-log.entity';
import { Market } from '../../entities/market.entity';
import { CsvParserService, NormalizedCarRow } from './csv-parser.service';
import { BrandMatcherService } from './brand-matcher.service';

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(ImportLog)
    private readonly importLogRepo: Repository<ImportLog>,
    @InjectRepository(Market)
    private readonly marketRepo: Repository<Market>,
    private readonly csvParser: CsvParserService,
    private readonly brandMatcher: BrandMatcherService,
  ) {}

  async importMarket(marketCode: string): Promise<ImportLog> {
    const market = await this.marketRepo.findOne({
      where: { code: marketCode },
    });
    if (!market) {
      throw new Error(`Market not found: ${marketCode}`);
    }

    const dataDir = path.resolve(process.cwd(), '..', 'data');
    const files = this.csvParser.getMarketFiles(dataDir, marketCode);

    const log = this.importLogRepo.create({
      marketCode,
      filename: files.map((f) => path.basename(f.path)).join(', '),
      rowsProcessed: 0,
      rowsInserted: 0,
      rowsUpdated: 0,
      errors: [],
      startedAt: new Date(),
    });

    this.logger.log(`Starting import for market: ${marketCode} (${files.length} file(s))`);

    const allRows: NormalizedCarRow[] = [];
    const errors: Array<Record<string, unknown>> = [];

    for (const file of files) {
      try {
        const rows = this.csvParser.parseFile(file.path, file.format);
        allRows.push(...rows);
        this.logger.log(`Parsed ${rows.length} rows from ${path.basename(file.path)}`);
      } catch (err) {
        errors.push({ file: path.basename(file.path), error: (err as Error).message });
      }
    }

    if (allRows.length === 0 && errors.length > 0) {
      log.errors = errors;
      log.completedAt = new Date();
      return this.importLogRepo.save(log);
    }

    log.rowsProcessed = allRows.length;
    const importedSourceIds: string[] = [];

    for (let i = 0; i < allRows.length; i++) {
      try {
        const row = allRows[i];
        if (!row.brand || !row.price) continue;

        const brand = await this.brandMatcher.findOrCreateBrand(row.brand);
        const model = await this.brandMatcher.findOrCreateModel(
          brand,
          row.model || row.brand,
          row.bodyType,
          row.fuelType,
        );

        const existing = await this.vehicleRepo.findOne({
          where: { marketId: market.id, sourceId: row.sourceId },
        });

        // Validate year: must be between 1970 and next year
        const currentYear = new Date().getFullYear();
        const validYear =
          row.year && row.year >= 1970 && row.year <= currentYear + 1
            ? row.year
            : null;

        const vehicleData = {
          modelId: model.id,
          marketId: market.id,
          trimName: row.trimName,
          year: validYear,
          condition: row.condition === 'new' ? VehicleCondition.NEW : VehicleCondition.USED,
          price: row.price,
          mileageKm: row.mileageKm,
          fuelType: row.fuelType,
          transmission: row.transmission,
          engineSize: row.engineSize,
          horsepower: row.horsepower,
          color: row.color,
          features: row.features.length > 0
            ? Object.fromEntries(row.features.map((f) => [f, true]))
            : null,
          imageUrl: row.imageUrl,
          sourceUrl: row.sourceUrl,
          sourceId: row.sourceId,
          isAvailable: true,
        };

        if (existing) {
          await this.vehicleRepo.update(existing.id, vehicleData);
          log.rowsUpdated++;
        } else {
          await this.vehicleRepo.save(this.vehicleRepo.create(vehicleData));
          log.rowsInserted++;
        }

        importedSourceIds.push(row.sourceId);
      } catch (err) {
        errors.push({ row: i + 1, error: (err as Error).message });
      }
    }

    // Mark vehicles not in this import as unavailable
    if (importedSourceIds.length > 0) {
      await this.vehicleRepo
        .createQueryBuilder()
        .update(Vehicle)
        .set({ isAvailable: false })
        .where('marketId = :marketId', { marketId: market.id })
        .andWhere('sourceId NOT IN (:...sourceIds)', {
          sourceIds: importedSourceIds,
        })
        .andWhere('isAvailable = true')
        .execute();
    }

    log.errors = errors;
    log.completedAt = new Date();

    const saved = await this.importLogRepo.save(log);
    this.logger.log(
      `Import complete for ${marketCode}: ${log.rowsInserted} inserted, ${log.rowsUpdated} updated, ${errors.length} errors`,
    );

    return saved;
  }
}
