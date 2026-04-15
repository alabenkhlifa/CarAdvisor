import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

export interface NormalizedCarRow {
  sourceId: string;
  brand: string;
  model: string;
  trimName: string | null;
  fullName: string | null;
  year: number | null;
  condition: 'new' | 'used';
  price: number;
  mileageKm: number | null;
  fuelType: string;
  transmission: string;
  engineSize: string | null;
  horsepower: number | null;
  cvFiscal: number | null;
  bodyType: string;
  color: string | null;
  features: string[];
  imageUrl: string | null;
  sourceUrl: string | null;
}

export type CsvFormat = 'de' | 'tn_used' | 'tn_new' | 'tn_9annas';

@Injectable()
export class CsvParserService {
  parseFile(filePath: string, format: CsvFormat): NormalizedCarRow[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const rows: Record<string, string>[] = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });

    switch (format) {
      case 'de':
        return rows.map((r) => this.normalizeDE(r)).filter((r): r is NormalizedCarRow => r !== null);
      case 'tn_used':
        return rows.map((r) => this.normalizeTnUsed(r)).filter((r): r is NormalizedCarRow => r !== null);
      case 'tn_new':
        return rows.map((r) => this.normalizeTnNew(r)).filter((r): r is NormalizedCarRow => r !== null);
      case 'tn_9annas':
        return rows.map((r) => this.normalizeTn9annas(r)).filter((r): r is NormalizedCarRow => r !== null);
    }
  }

  getMarketFiles(dataDir: string, marketCode: string): Array<{ path: string; format: CsvFormat }> {
    if (marketCode === 'de') {
      return [{ path: path.join(dataDir, 'de_cars.csv'), format: 'de' }];
    }
    if (marketCode === 'tn') {
      return [
        { path: path.join(dataDir, 'tn_used_cars.csv'), format: 'tn_used' },
        { path: path.join(dataDir, 'tn_new_cars.csv'), format: 'tn_new' },
        { path: path.join(dataDir, '9annas_tn_used_cars.csv'), format: 'tn_9annas' },
      ];
    }
    return [];
  }

  private normalizeDE(row: Record<string, string>): NormalizedCarRow | null {
    const price = parseFloat(row.price_eur);
    if (!price || !row.make) return null;

    return {
      sourceId: row.id || `de-${row.listing_url}`,
      brand: row.make,
      model: row.model || '',
      trimName: row.variant || null,
      fullName: row.full_name || null,
      year: row.year ? parseInt(row.year, 10) : null,
      condition: row.condition === 'new' ? 'new' : 'used',
      price,
      mileageKm: row.mileage_km ? parseInt(row.mileage_km, 10) : null,
      fuelType: this.normalizeFuelType(row.fuel_type),
      transmission: this.normalizeTransmission(row.transmission),
      engineSize: row.engine_cc ? `${row.engine_cc}cc` : null,
      horsepower: row.power_hp ? parseInt(row.power_hp, 10) : null,
      cvFiscal: null,
      bodyType: this.normalizeBodyType(row.body_type),
      color: row.color_exterior || null,
      features: this.mergeFeatureStrings(row.features, row.safety_features, row.comfort_features),
      imageUrl: row.image_url || null,
      sourceUrl: row.listing_url || null,
    };
  }

  private normalizeTnUsed(row: Record<string, string>): NormalizedCarRow | null {
    const price = parseFloat(row.price_tnd);
    if (!price || !row.brand) return null;

    // Clean the brand name (e.g., "GWM" stays, "Mercedes-Benz" stays)
    const brand = row.brand;
    // Model often repeats brand, clean it
    let model = row.model || '';
    if (model.startsWith(brand + ' ')) {
      model = model.substring(brand.length + 1);
    }

    return {
      sourceId: `tn-used-${row.id}`,
      brand,
      model,
      trimName: null,
      fullName: row.full_name || null,
      year: row.year ? parseInt(row.year, 10) : null,
      condition: 'used',
      price,
      mileageKm: row.mileage_km ? parseInt(row.mileage_km, 10) : null,
      fuelType: this.normalizeFuelType(row.fuel_type),
      transmission: this.normalizeTransmission(row.transmission),
      engineSize: null,
      horsepower: row.cv_din ? parseInt(row.cv_din, 10) : null,
      cvFiscal: row.cv_fiscal ? parseInt(row.cv_fiscal, 10) : null,
      bodyType: this.normalizeBodyType(row.body_type),
      color: row.color_exterior || null,
      features: this.mergeFeatureStrings(
        row.equipment_safety,
        row.equipment_interior,
        row.equipment_exterior,
        row.equipment_functional,
      ),
      imageUrl: row.image_url || null,
      sourceUrl: row.url || null,
    };
  }

  private normalizeTnNew(row: Record<string, string>): NormalizedCarRow | null {
    const price = parseFloat(row.price_tnd);
    if (!price || !row.brand) return null;

    return {
      sourceId: `tn-new-${row.id}`,
      brand: row.brand,
      model: row.model || '',
      trimName: row.trim || null,
      fullName: row.full_name || null,
      year: new Date().getFullYear(),
      condition: 'new',
      price,
      mileageKm: 0,
      fuelType: this.normalizeFuelType(row.fuel_type),
      transmission: this.normalizeTransmission(row.transmission),
      engineSize: row.engine_cc ? `${row.engine_cc}cc` : null,
      horsepower: row.cv_din ? parseInt(row.cv_din, 10) : null,
      cvFiscal: row.cv_fiscal ? parseInt(row.cv_fiscal, 10) : null,
      bodyType: this.normalizeBodyType(row.body_type),
      color: null,
      features: this.mergeFeatureStrings(
        row.equipment_safety,
        row.equipment_driving_aids,
        row.equipment_exterior,
        row.equipment_audio,
        row.equipment_interior,
        row.equipment_functional,
      ),
      imageUrl: row.thumbnail || row.image_url || null,
      sourceUrl: row.url || null,
    };
  }

  private normalizeTn9annas(row: Record<string, string>): NormalizedCarRow | null {
    const price = parseFloat(row.price_tnd);
    if (!price || !row.brand || !row.id) return null;

    return {
      sourceId: `tn-9annas-${row.id}`,
      brand: row.brand,
      model: row.model || '',
      trimName: null,
      fullName: row.full_name || null,
      year: row.year ? parseInt(row.year, 10) : null,
      condition: 'used',
      price,
      mileageKm: row.mileage_km ? parseInt(row.mileage_km, 10) : null,
      fuelType: this.normalizeFuelType(row.fuel_type),
      transmission: this.normalizeTransmission(row.transmission),
      engineSize: row.cylindree || null,
      // 9annas.tn only provides cv_fiscal (tax HP), NOT real horsepower.
      horsepower: null,
      cvFiscal: row.cv_fiscal ? parseInt(row.cv_fiscal, 10) : null,
      bodyType: this.normalizeBodyType(row.body_type),
      color: row.color_exterior || null,
      features: [],
      imageUrl: row.thumbnail || this.firstImage(row.images) || null,
      sourceUrl: this.build9annasUrl(row),
    };
  }

  private build9annasUrl(row: Record<string, string>): string | null {
    if (!row.id) return row.url || null;
    const locationSlug = this.slugify(row.governorate || row.location || '') || 'tunisie';
    const titleSlug =
      this.slugify(row.full_name || `${row.brand || ''} ${row.model || ''}`) || 'annonce';
    return `https://9annas.tn/details/${locationSlug}/auto-moto-1/${titleSlug}-${row.id}`;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private firstImage(raw: string | undefined): string | null {
    if (!raw) return null;
    const first = raw.split(';')[0]?.trim();
    return first || null;
  }

  private normalizeFuelType(raw: string | undefined): string {
    if (!raw) return 'petrol';
    const lower = raw.toLowerCase().trim();
    if (lower.includes('diesel') || lower === 'gazole') return 'diesel';
    if (lower.includes('electric') || lower.includes('électrique')) return 'electric';
    if (lower.includes('hybrid') || lower.includes('hybride')) return 'hybrid';
    if (lower.includes('lpg') || lower.includes('gpl')) return 'lpg';
    return 'petrol';
  }

  private normalizeTransmission(raw: string | undefined): string {
    if (!raw) return 'manual';
    const lower = raw.toLowerCase().trim();
    if (lower.includes('auto') || lower === 'automatique') return 'automatic';
    return 'manual';
  }

  private normalizeBodyType(raw: string | undefined): string {
    if (!raw) return 'sedan';
    const lower = raw.toLowerCase().trim();
    if (lower.includes('suv') || lower.includes('crossover')) return 'suv';
    if (lower.includes('hatch') || lower.includes('citadine') || lower.includes('compacte')) return 'hatchback';
    if (lower.includes('break') || lower.includes('wagon') || lower.includes('kombi')) return 'wagon';
    if (lower.includes('minivan') || lower.includes('van') || lower.includes('monospace') || lower.includes('ludospace')) return 'minivan';
    if (lower.includes('coupe') || lower.includes('coupé')) return 'coupe';
    if (lower.includes('cabrio') || lower.includes('convert') || lower.includes('roadster') || lower.includes('cabriolet')) return 'convertible';
    if (lower.includes('pickup') || lower.includes('pick-up')) return 'pickup';
    if (lower.includes('limousine') || lower.includes('berline') || lower.includes('sedan')) return 'sedan';
    return 'sedan';
  }

  private mergeFeatureStrings(...fields: (string | undefined)[]): string[] {
    const features: string[] = [];
    for (const field of fields) {
      if (!field) continue;
      // Split by semicolons (TN format) or commas
      const items = field.includes(';') ? field.split(';') : field.split(',');
      for (const item of items) {
        const trimmed = item.trim();
        if (trimmed) features.push(trimmed);
      }
    }
    return features;
  }
}
