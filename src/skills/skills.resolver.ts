import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileModel } from '../profile/profile.model';
import { SkillGroupModel, SkillModel } from './skill.model';
import { SkillsLoader } from './skills.loader';
import { SkillsService } from './skills.service';

@Resolver(() => ProfileModel)
export class SkillsResolver {
  constructor(
    private readonly loader: SkillsLoader,
    private readonly service: SkillsService,
  ) {}

  @ResolveField(() => [SkillModel])
  skills(@Parent() profile: ProfileModel) {
    return this.loader.byProfileId.load(profile.id);
  }

  @ResolveField(() => [SkillGroupModel])
  async skillGroups(@Parent() profile: ProfileModel) {
    return this.service.group(await this.loader.byProfileId.load(profile.id));
  }
}
