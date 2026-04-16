import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CsvParserService } from './csv-parser.service';

describe('CsvParserService', () => {
  const service = new CsvParserService();

  const parsePrivate = <T extends string>(method: string, raw: string) =>
    (service as unknown as Record<string, (v: string | undefined) => T>)[method](raw);

  describe('normalizeFuelType', () => {
    it.each([
      ['Diesel', 'diesel'],
      ['gazole', 'diesel'],
      ['Electric', 'electric'],
      ['Électrique', 'electric'],
      ['Hybride', 'hybrid'],
      ['GPL', 'lpg'],
      ['Essence', 'petrol'],
      ['', 'petrol'],
    ])('%s -> %s', (input, expected) => {
      expect(parsePrivate('normalizeFuelType', input)).toBe(expected);
    });
  });

  describe('normalizeTransmission', () => {
    it.each([
      ['Automatique', 'automatic'],
      ['Automatic', 'automatic'],
      ['Manual', 'manual'],
      ['', 'manual'],
    ])('%s -> %s', (input, expected) => {
      expect(parsePrivate('normalizeTransmission', input)).toBe(expected);
    });
  });

  describe('normalizeBodyType', () => {
    it.each([
      ['SUV', 'suv'],
      ['crossover', 'suv'],
      ['Citadine', 'hatchback'],
      ['Break', 'wagon'],
      ['Monospace', 'minivan'],
      ['Coupé', 'coupe'],
      ['Cabriolet', 'convertible'],
      ['Berline', 'sedan'],
      ['unknown thing', 'sedan'],
    ])('%s -> %s', (input, expected) => {
      expect(parsePrivate('normalizeBodyType', input)).toBe(expected);
    });
  });

  describe('parseFile tn_new', () => {
    let tmpDir: string;
    let csvPath: string;

    beforeAll(() => {
      tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'csv-parser-'));
      csvPath = path.join(tmpDir, 'tn_new.csv');
      fs.writeFileSync(
        csvPath,
        [
          'id,brand,model,trim,price_tnd,engine_cc,cv_din,cv_fiscal,fuel_type,transmission,body_type',
          '1,Peugeot,208,Active,68500,1199,82,6,Essence,Manuelle,Citadine',
          ',Peugeot,208,,0,,,,,,', // missing price/brand → dropped
        ].join('\n'),
      );
    });

    afterAll(() => fs.rmSync(tmpDir, { recursive: true, force: true }));

    it('normalizes tn_new rows and drops invalid ones', () => {
      const rows = service.parseFile(csvPath, 'tn_new');
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        sourceId: 'tn-new-1',
        brand: 'Peugeot',
        model: '208',
        trimName: 'Active',
        condition: 'new',
        price: 68500,
        mileageKm: 0,
        fuelType: 'petrol',
        transmission: 'manual',
        horsepower: 82,
        cvFiscal: 6,
        bodyType: 'hatchback',
      });
    });
  });

  describe('getMarketFiles', () => {
    it('returns DE file for de market', () => {
      const files = service.getMarketFiles('/data', 'de');
      expect(files).toEqual([{ path: '/data/de_cars.csv', format: 'de' }]);
    });

    it('returns TN files for tn market', () => {
      const files = service.getMarketFiles('/data', 'tn');
      expect(files.map((f) => f.format)).toEqual(['tn_used', 'tn_new', 'tn_9annas']);
    });

    it('returns empty for unknown market', () => {
      expect(service.getMarketFiles('/data', 'us')).toEqual([]);
    });
  });
});
