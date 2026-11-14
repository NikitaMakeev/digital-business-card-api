const { spawnSync } = require('node:child_process');
const path = require('node:path');
require('dotenv').config({ quiet: true });

// Never fall back to DATABASE_URL: an e2e test must not modify production data.
if (!process.env.TEST_DATABASE_URL) {
  console.error(
    'TEST_DATABASE_URL is required. Use a separate test database. See README.',
  );
  process.exit(1);
}
if (process.env.TEST_DATABASE_URL === process.env.DATABASE_URL) {
  console.error('TEST_DATABASE_URL must differ from DATABASE_URL.');
  process.exit(1);
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.NODE_ENV = 'test';
process.env.PRISMA_QUERY_LOG = 'true';
process.env.DEFAULT_PROFILE_SLUG = 'nikita-makeev';

for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy'],
  ['node_modules/prisma/build/index.js', 'generate'],
  [
    'node_modules/jest/bin/jest.js',
    '--config',
    'test/jest-e2e.config.cjs',
    '--runInBand',
  ],
]) {
  const result = spawnSync(
    process.execPath,
    [
      '--experimental-vm-modules',
      ...args.map((arg, index) => (index === 0 ? path.resolve(arg) : arg)),
    ],
    {
      stdio: 'inherit',
      env: process.env,
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
