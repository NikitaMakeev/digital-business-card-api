import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { SkillModel } from './skill.model';
import { SkillsService } from './skills.service';

@Injectable({ scope: Scope.REQUEST })
export class SkillsLoader {
  readonly byProfileId: DataLoader<string, SkillModel[]>;

  constructor(service: SkillsService) {
    this.byProfileId = new DataLoader((ids) => service.findByProfileIds(ids));
  }
}
