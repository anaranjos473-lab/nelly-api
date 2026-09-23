import { jest } from '@jest/globals';
import { validateEnv } from '../src/utils/envLoader.js';

const requiredValues = {
  FIREBASE_DATABASE_URL: 'https://secret-db.example.test',
  REDIS_URL: 'redis://secret-redis.example.test',
  JWT_SECRET: 'secret-jwt-value',
  GOOGLE_MAPS_API_KEY: 'secret-maps-key',
  RENDER_API_KEY: 'secret-render-key',
  FIREBASE_SERVICE_ACCOUNT: '{}'
};

describe('Environment logging', () => {
  const originalValues = Object.fromEntries(Object.keys(requiredValues).map((key) => [key, process.env[key]]));

  beforeEach(() => Object.assign(process.env, requiredValues));

  afterAll(() => {
    for (const [key, value] of Object.entries(originalValues)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it('reports configuration without printing a secret value', () => {
    const logger = jest.spyOn(console, 'log').mockImplementation(() => {});
    validateEnv();
    const output = logger.mock.calls.flat().join(' ');
    logger.mockRestore();

    expect(output).toContain('configured');
    for (const secret of Object.values(requiredValues)) {
      expect(output).not.toContain(secret);
    }
  });
});
