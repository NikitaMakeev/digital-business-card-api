import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileModel } from '../profile/profile.model';
import { ExperienceLoader } from './experience.loader';
import { ExperienceModel } from './experience.model';

@Resolver(() => ProfileModel)
export class ExperienceResolver {
  constructor(private readonly loader: ExperienceLoader) {}

  @ResolveField(() => [ExperienceModel])
  experience(@Parent() profile: ProfileModel) {
    return this.loader.byProfileId.load(profile.id);
  }
}
