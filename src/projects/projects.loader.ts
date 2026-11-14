import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ProjectModel } from './project.model';
import { ProjectsService } from './projects.service';

@Injectable({ scope: Scope.REQUEST })
export class ProjectsLoader {
  readonly byProfileId: DataLoader<string, ProjectModel[]>;
  constructor(service: ProjectsService) {
    this.byProfileId = new DataLoader((ids) => service.findByProfileIds(ids));
  }
}
