import { Injectable } from '@nestjs/common';
import { batchByProfile } from '../common/batch-by-profile';
import { SkillGroupModel, SkillModel } from './skill.model';
import { SkillsRepository } from './skills.repository';

@Injectable()
export class SkillsService {
  constructor(private readonly repository: SkillsRepository) {}

  async findByProfileIds(ids: readonly string[]): Promise<SkillModel[][]> {
    const rows = await this.repository.findByProfileIds(ids);
    return batchByProfile(ids, rows).map((skills) =>
      skills.map(({ id, name, category, sortOrder }) => ({
        id,
        name,
        category,
        sortOrder,
      })),
    );
  }

  group(skills: readonly SkillModel[]): SkillGroupModel[] {
    const groups = new Map<string, SkillGroupModel>();
    for (const skill of skills) {
      let group = groups.get(skill.category);
      if (!group) {
        group = {
          category: skill.category,
          sortOrder: groups.size,
          skills: [],
        };
        groups.set(skill.category, group);
      }
      group.skills.push(skill);
    }
    return [...groups.values()];
  }
}
