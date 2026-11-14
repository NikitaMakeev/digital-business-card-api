import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { seed } from '../prisma/seed';
import { seedData } from '../prisma/seed-data';
import { SkillsRepository } from '../src/skills/skills.repository';
import { SkillsService } from '../src/skills/skills.service';
import { SkillsLoader } from '../src/skills/skills.loader';

const query =
  'query { profile { name description skills { name } experience { company position } projects { name } } }';

describe('Business card API (real PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queries: string[] = [];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    prisma.$on('query', (event) => queries.push(event.query));
    await seed(prisma);
  });

  afterAll(async () => {
    await app?.close();
  });
  beforeEach(() => {
    queries = [];
  });

  it('runs the exact assignment query with four SQL SELECTs', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toEqual({
      profile: {
        name: seedData.name,
        description: seedData.description,
        skills: seedData.skillGroups.flatMap((group) =>
          group.names.map((name) => ({ name })),
        ),
        experience: seedData.experience.map(({ company, position }) => ({
          company,
          position,
        })),
        projects: seedData.projects.map(({ name }) => ({ name })),
      },
    });
    expect(queries).toHaveLength(4);
    expect(queries.every((sql) => sql.startsWith('SELECT'))).toBe(true);
    console.info(`Measured assignment query SQL count: ${queries.length}`);
  });

  it('resolves every field, shares skills cache across flat/grouped fields, and avoids eager relations', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `{
      profile { id name description location languages
        links { type url sortOrder }
        skills { id name category sortOrder }
        skillGroups { category sortOrder skills { name } }
        experience { id company position startDate endDate location achievements sortOrder }
        projects { id name url description contribution tags sortOrder }
      }
    }`,
      })
      .expect(200);
    expect(response.body.errors).toBeUndefined();
    const profile = response.body.data.profile;
    expect(
      profile.links.map(({ type, url }: { type: string; url: string }) => ({
        type,
        url,
      })),
    ).toEqual(seedData.links);
    expect(
      profile.skillGroups.map((group: { category: string }) => group.category),
    ).toEqual(seedData.skillGroups.map((group) => group.category));
    expect(profile.experience[0].achievements).toEqual(
      seedData.experience[0].achievements,
    );
    expect(profile.experience[0].startDate).toBeNull();
    expect(profile.experience[0].endDate).toBeNull();
    expect(
      profile.projects.map((project: { name: string }) => project.name),
    ).toEqual(seedData.projects.map((project) => project.name));
    expect(queries).toHaveLength(5);
    queries = [];
    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ profile { name } }' })
      .expect(200);
    expect(queries).toHaveLength(1);
  });

  it('creates no duplicate rows or new IDs when seeding twice', async () => {
    const snapshot = async () => ({
      profiles: await prisma.profile.findMany({ orderBy: { id: 'asc' } }),
      links: await prisma.profileLink.findMany({ orderBy: { id: 'asc' } }),
      skills: await prisma.skill.findMany({ orderBy: { id: 'asc' } }),
      experience: await prisma.experience.findMany({ orderBy: { id: 'asc' } }),
      projects: await prisma.project.findMany({ orderBy: { id: 'asc' } }),
    });
    const before = await snapshot();
    await seed(prisma);
    await seed(prisma);
    expect(await snapshot()).toEqual(before);
  });

  it('batches multiple profile IDs, preserves key order, and uses a fresh request cache', async () => {
    const profile = await prisma.profile.findUniqueOrThrow({
      where: { slug: seedData.slug },
    });
    const service = new SkillsService(new SkillsRepository(prisma));
    const firstRequest = new SkillsLoader(service);
    queries = [];
    const [missing, skills, same] = await Promise.all([
      firstRequest.byProfileId.load('missing'),
      firstRequest.byProfileId.load(profile.id),
      firstRequest.byProfileId.load(profile.id),
    ]);
    expect(missing).toEqual([]);
    expect(skills).toHaveLength(
      seedData.skillGroups.flatMap((group) => group.names).length,
    );
    expect(same).toBe(skills);
    expect(queries).toHaveLength(1);
    await new SkillsLoader(service).byProfileId.load(profile.id);
    expect(queries).toHaveLength(2);
  });

  it('serves Sandbox HTML, introspection, and a DB-backed health check', async () => {
    const html = await request(app.getHttpServer())
      .get('/graphql')
      .set('Accept', 'text/html')
      .expect(200);
    expect(html.text).toContain('embeddable-sandbox');
    const introspection = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query: '{ __schema { queryType { name } } }' })
      .expect(200);
    expect(introspection.body.data.__schema.queryType.name).toBe('Query');
    const health = await request(app.getHttpServer())
      .get('/health')
      .expect(200);
    expect(health.body).toEqual({ status: 'ok' });
  });
});
