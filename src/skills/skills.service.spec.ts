import { SkillsRepository } from './skills.repository';
import { SkillsService } from './skills.service';

describe('SkillsService', () => {
  const findByProfileIds = jest.fn();
  const service = new SkillsService({
    findByProfileIds,
  } as unknown as SkillsRepository);

  beforeEach(() => jest.resetAllMocks());

  it('maps batched rows in key order, preserves sort order, and returns empty missing groups', async () => {
    findByProfileIds.mockResolvedValue([
      {
        id: 's1',
        profileId: 'b',
        name: 'TypeScript',
        category: 'Frontend',
        categorySortOrder: 0,
        sortOrder: 0,
      },
      {
        id: 's2',
        profileId: 'a',
        name: 'Go',
        category: 'Backend & Data',
        categorySortOrder: 1,
        sortOrder: 0,
      },
    ]);
    const result = await service.findByProfileIds(['a', 'missing', 'b']);
    expect(findByProfileIds).toHaveBeenCalledTimes(1);
    expect(findByProfileIds).toHaveBeenCalledWith(['a', 'missing', 'b']);
    expect(result).toEqual([
      [{ id: 's2', name: 'Go', category: 'Backend & Data', sortOrder: 0 }],
      [],
      [{ id: 's1', name: 'TypeScript', category: 'Frontend', sortOrder: 0 }],
    ]);
  });

  it('groups without merging duplicate names from different categories', () => {
    const skills = [
      { id: 'a', name: 'Claude Code', category: 'Tools', sortOrder: 0 },
      { id: 'b', name: 'Claude Code', category: 'AI & Agents', sortOrder: 0 },
    ];
    expect(service.group(skills)).toEqual([
      { category: 'Tools', sortOrder: 0, skills: [skills[0]] },
      { category: 'AI & Agents', sortOrder: 1, skills: [skills[1]] },
    ]);
    expect(service.group([])).toEqual([]);
  });
});
