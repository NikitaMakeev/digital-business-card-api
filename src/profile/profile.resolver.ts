import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ProfileLinkModel, ProfileModel } from './profile.model';
import { ProfileLoader } from './profile.loader';
import { ProfileService } from './profile.service';

@Resolver(() => ProfileModel)
export class ProfileResolver {
  constructor(
    private readonly service: ProfileService,
    private readonly loader: ProfileLoader,
  ) {}

  @Query(() => ProfileModel, {
    description: 'The profile selected by DEFAULT_PROFILE_SLUG.',
  })
  profile() {
    return this.service.getDefault();
  }

  @ResolveField(() => [ProfileLinkModel])
  links(@Parent() profile: ProfileModel) {
    return this.loader.linksByProfileId.load(profile.id);
  }
}
