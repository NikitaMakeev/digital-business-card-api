import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ExperienceModel } from './experience.model';
import { ExperienceService } from './experience.service';

@Injectable({ scope: Scope.REQUEST })
export class ExperienceLoader {
  readonly byProfileId: DataLoader<string, ExperienceModel[]>;
  constructor(service: ExperienceService) {
    this.byProfileId = new DataLoader((ids) => service.findByProfileIds(ids));
  }
}
