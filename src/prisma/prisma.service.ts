import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<{
    adapter: PrismaPg;
    log: [{ emit: 'event'; level: 'query' }];
  }>
  implements OnModuleInit, OnModuleDestroy
{
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({
        connectionString: config.getOrThrow<string>('DATABASE_URL'),
        max: 5,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      }),
      log: [{ emit: 'event', level: 'query' }],
    });
    if (config.get<boolean>('PRISMA_QUERY_LOG')) {
      const logger = new Logger('SQL');
      // Never log parameters, credentials, or connection URLs.
      this.$on('query', (event) => logger.debug(event.query));
    }
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
