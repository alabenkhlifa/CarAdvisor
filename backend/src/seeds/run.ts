import AppDataSource from '../data-source';
import { seedMarkets } from './market.seed';

async function run() {
  const dataSource = await AppDataSource.initialize();
  console.log('Database connected.');

  await seedMarkets(dataSource);

  await dataSource.destroy();
  console.log('Seeding complete.');
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
