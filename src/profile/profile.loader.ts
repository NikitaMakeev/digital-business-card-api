import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ProfileLinkModel } from './profile.model';
import { ProfileService } from './profile.service';

@Injectable({ scope: Scope.REQUEST })
export class ProfileLoader {
  readonly linksByProfileId: DataLoader<string, ProfileLinkModel[]>;
  constructor(service: ProfileService) {
    this.linksByProfileId = new DataLoader((ids) =>
      service.linksByProfileIds(ids),
    );
  }
}
