import { validateEnvironment } from './environment';

describe('environment validation', () => {
  it('validates and coerces configuration', () => {
    expect(
      validateEnvironment({
        DATABASE_URL: 'postgresql://localhost/card',
        PRISMA_QUERY_LOG: 'false',
        PORT: '3000',
      }),
    ).toMatchObject({
      PORT: 3000,
      PRISMA_QUERY_LOG: false,
      DEFAULT_PROFILE_SLUG: 'nikita-makeev',
    });
  });

  it.each([
    {},
    { DATABASE_URL: 'not-a-url' },
    { DATABASE_URL: 'postgresql://localhost/card', NODE_ENV: 'typo' },
    { DATABASE_URL: 'postgresql://localhost/card', PORT: 'no' },
    { DATABASE_URL: 'postgresql://localhost/card', PRISMA_QUERY_LOG: 'typo' },
  ])('rejects invalid configuration without leaking values', (config) => {
    expect(() => validateEnvironment(config)).toThrow('Invalid environment:');
  });
});
