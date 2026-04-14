import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { execSync } from 'child_process';
import * as path from 'path';
import { ImportService } from './import.service';

const CSV_FILES = [
  {
    url: 'https://raw.githubusercontent.com/alabenkhlifa/automobile-tn-scrapper/refs/heads/main/autoscout24_de.csv',
    filename: 'de_cars.csv',
  },
  {
    url: 'https://raw.githubusercontent.com/alabenkhlifa/automobile-tn-scrapper/refs/heads/main/automobile_tn_used_cars.csv',
    filename: 'tn_used_cars.csv',
  },
  {
    url: 'https://raw.githubusercontent.com/alabenkhlifa/automobile-tn-scrapper/refs/heads/main/automobile_tn_new_cars.csv',
    filename: 'tn_new_cars.csv',
  },
  {
    url: 'https://raw.githubusercontent.com/alabenkhlifa/automobile-tn-scrapper/refs/heads/main/9annas_tn_used_cars.csv',
    filename: '9annas_tn_used_cars.csv',
  },
];

@Injectable()
export class ImportCron {
  private readonly logger = new Logger(ImportCron.name);

  constructor(private readonly importService: ImportService) {}

  // Run every Sunday at 3:00 AM
  @Cron('0 3 * * 0')
  async handleWeeklyImport() {
    this.logger.log('Starting weekly CSV update and import...');

    await this.downloadCsvFiles();

    for (const market of ['tn', 'de']) {
      try {
        await this.importService.importMarket(market);
      } catch (err) {
        this.logger.error(
          `Import failed for ${market}: ${(err as Error).message}`,
        );
      }
    }

    this.logger.log('Weekly import complete.');
  }

  private async downloadCsvFiles(): Promise<void> {
    const dataDir = path.resolve(process.cwd(), '..', 'data');

    for (const file of CSV_FILES) {
      const dest = path.join(dataDir, file.filename);
      try {
        execSync(`wget -q -O "${dest}" "${file.url}"`, { timeout: 60000 });
        this.logger.log(`Downloaded ${file.filename}`);
      } catch {
        try {
          execSync(`curl -sL -o "${dest}" "${file.url}"`, { timeout: 60000 });
          this.logger.log(`Downloaded ${file.filename} (via curl)`);
        } catch (err) {
          this.logger.error(`Failed to download ${file.filename}: ${(err as Error).message}`);
        }
      }
    }
  }
}
