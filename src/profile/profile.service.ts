import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { batchByProfile } from '../common/batch-by-profile';
import { LinkType, ProfileLinkModel, ProfileModel } from './profile.model';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly repository: ProfileRepository,
    private readonly config: ConfigService,
  ) {}

  async getDefault(): Promise<ProfileModel> {
    const profile = await this.repository.findBySlug(
      this.config.getOrThrow<string>('DEFAULT_PROFILE_SLUG'),
    );
    if (!profile)
      throw new NotFoundException('Default profile not found. Run the seed.');
    const { id, name, description, location, languages } = profile;
    return { id, name, description, location, languages };
  }

  async linksByProfileIds(
    ids: readonly string[],
  ): Promise<ProfileLinkModel[][]> {
    return batchByProfile(
      ids,
      await this.repository.findLinksByProfileIds(ids),
    ).map((rows) =>
      rows.map(({ type, url, sortOrder }) => ({
        type: LinkType[type],
        url,
        sortOrder,
      })),
    );
  }
}
