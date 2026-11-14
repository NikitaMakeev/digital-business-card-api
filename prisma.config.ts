import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'node dist/prisma/seed.js' },
  // Generation needs no database; commands that connect reject a missing URL.
  datasource: { url: process.env.DATABASE_URL ?? '' },
});
