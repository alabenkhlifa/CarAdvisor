import { AppController } from './app.controller';
import { DataSource } from 'typeorm';

describe('AppController', () => {
  const makeController = (query: () => Promise<unknown>) =>
    new AppController({ query } as unknown as DataSource);

  it('health returns ok', () => {
    const controller = makeController(async () => 1);
    expect(controller.health()).toEqual({ status: 'ok' });
  });

  it('ready returns ok when DB responds', async () => {
    const controller = makeController(async () => [{ '?column?': 1 }]);
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      checks: { database: true },
    });
  });

  it('ready returns degraded when DB throws', async () => {
    const controller = makeController(async () => {
      throw new Error('boom');
    });
    await expect(controller.ready()).resolves.toEqual({
      status: 'degraded',
      checks: { database: false },
    });
  });
});
