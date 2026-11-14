import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileModel } from '../profile/profile.model';
import { ProjectsLoader } from './projects.loader';
import { ProjectModel } from './project.model';

@Resolver(() => ProfileModel)
export class ProjectsResolver {
  constructor(private readonly loader: ProjectsLoader) {}

  @ResolveField(() => [ProjectModel])
  projects(@Parent() profile: ProfileModel) {
    return this.loader.byProfileId.load(profile.id);
  }
}
