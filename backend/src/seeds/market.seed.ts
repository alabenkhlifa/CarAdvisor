import { DataSource } from 'typeorm';
import { Market } from '../entities/market.entity';

export async function seedMarkets(dataSource: DataSource): Promise<void> {
  const marketRepo = dataSource.getRepository(Market);

  const markets = [
    {
      code: 'tn',
      name: 'Tunisia',
      currency: 'TND',
      locale: 'fr-TN',
      isActive: true,
    },
    {
      code: 'de',
      name: 'Germany',
      currency: 'EUR',
      locale: 'de-DE',
      isActive: true,
    },
  ];

  for (const market of markets) {
    const existing = await marketRepo.findOne({ where: { code: market.code } });
    if (!existing) {
      await marketRepo.save(marketRepo.create(market));
      console.log(`Seeded market: ${market.name} (${market.code})`);
    } else {
      console.log(`Market already exists: ${market.name} (${market.code})`);
    }
  }
}
