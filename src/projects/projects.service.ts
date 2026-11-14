import { Injectable } from '@nestjs/common';
import { batchByProfile } from '../common/batch-by-profile';
import { ProjectModel } from './project.model';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly repository: ProjectsRepository) {}

  async findByProfileIds(ids: readonly string[]): Promise<ProjectModel[][]> {
    return batchByProfile(ids, await this.repository.findByProfileIds(ids)).map(
      (rows) =>
        rows.map(
          ({ id, name, url, description, contribution, tags, sortOrder }) => ({
            id,
            name,
            url,
            description,
            contribution,
            tags,
            sortOrder,
          }),
        ),
    );
  }
}
