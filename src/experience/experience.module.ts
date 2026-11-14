import { Module } from '@nestjs/common';
import { ExperienceRepository } from './experience.repository';
import { ExperienceService } from './experience.service';
import { ExperienceLoader } from './experience.loader';
import { ExperienceResolver } from './experience.resolver';

@Module({
  providers: [
    ExperienceRepository,
    ExperienceService,
    ExperienceLoader,
    ExperienceResolver,
  ],
})
export class ExperienceModule {}
