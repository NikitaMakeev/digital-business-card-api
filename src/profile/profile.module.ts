import { Module } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';
import { ProfileService } from './profile.service';
import { ProfileLoader } from './profile.loader';
import { ProfileResolver } from './profile.resolver';

@Module({
  providers: [
    ProfileRepository,
    ProfileService,
    ProfileLoader,
    ProfileResolver,
  ],
})
export class ProfileModule {}
