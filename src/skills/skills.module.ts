import { Module } from '@nestjs/common';
import { SkillsLoader } from './skills.loader';
import { SkillsRepository } from './skills.repository';
import { SkillsResolver } from './skills.resolver';
import { SkillsService } from './skills.service';

@Module({
  providers: [SkillsRepository, SkillsService, SkillsLoader, SkillsResolver],
})
export class SkillsModule {}
