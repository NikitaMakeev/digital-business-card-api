import { Injectable } from '@nestjs/common';
import { batchByProfile } from '../common/batch-by-profile';
import { ExperienceModel } from './experience.model';
import { ExperienceRepository } from './experience.repository';

@Injectable()
export class ExperienceService {
  constructor(private readonly repository: ExperienceRepository) {}

  async findByProfileIds(ids: readonly string[]): Promise<ExperienceModel[][]> {
    return batchByProfile(ids, await this.repository.findByProfileIds(ids)).map(
      (rows) =>
        rows.map(
          ({
            id,
            company,
            position,
            startDate,
            endDate,
            location,
            achievements,
            sortOrder,
          }) => ({
            id,
            company,
            position,
            startDate,
            endDate,
            location,
            achievements,
            sortOrder,
          }),
        ),
    );
  }
}
