import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  // Read-only public API; no cookie/session credentials are accepted.
  app.enableCors({ origin: '*', credentials: false });
  await app.listen(
    app.get(ConfigService).getOrThrow<number>('PORT'),
    '0.0.0.0',
  );
}

void bootstrap().catch(() => {
  console.error(
    'Application startup failed. Check configuration and database availability.',
  );
  process.exitCode = 1;
});
