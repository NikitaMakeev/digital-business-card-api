import { Module } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { ProjectsService } from './projects.service';
import { ProjectsLoader } from './projects.loader';
import { ProjectsResolver } from './projects.resolver';

@Module({
  providers: [
    ProjectsRepository,
    ProjectsService,
    ProjectsLoader,
    ProjectsResolver,
  ],
})
export class ProjectsModule {}
