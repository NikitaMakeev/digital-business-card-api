import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { LinkType, PrismaClient } from '../src/generated/prisma/client';
import { seedData } from './seed-data';

export async function seed(prisma: PrismaClient): Promise<void> {
  // One transaction and stable unique keys: retries never create duplicates.
  await prisma.$transaction(
    async (tx) => {
      const { slug, name, description, location, languages } = seedData;
      const data = { name, description, location, languages: [...languages] };
      const profile = await tx.profile.upsert({
        where: { slug },
        create: { slug, ...data },
        update: data,
      });
      const profileId = profile.id;
      for (const [sortOrder, link] of seedData.links.entries()) {
        const type = LinkType[link.type];
        const data = { profileId, type, url: link.url, sortOrder };
        await tx.profileLink.upsert({
          where: { profileId_type: { profileId, type } },
          create: data,
          update: data,
        });
      }
      for (const [categorySortOrder, group] of seedData.skillGroups.entries()) {
        for (const [sortOrder, name] of group.names.entries()) {
          const data = {
            profileId,
            category: group.category,
            categorySortOrder,
            name,
            sortOrder,
          };
          await tx.skill.upsert({
            where: {
              profileId_category_name: {
                profileId,
                category: group.category,
                name,
              },
            },
            create: data,
            update: data,
          });
        }
      }
      for (const [sortOrder, item] of seedData.experience.entries()) {
        const data = {
          ...item,
          profileId,
          sortOrder,
          achievements: [...item.achievements],
        };
        await tx.experience.upsert({
          where: {
            profileId_company_position: {
              profileId,
              company: item.company,
              position: item.position,
            },
          },
          create: data,
          update: data,
        });
      }
      for (const [sortOrder, item] of seedData.projects.entries()) {
        const data = { ...item, profileId, sortOrder, tags: [...item.tags] };
        await tx.project.upsert({
          where: { profileId_name: { profileId, name: item.name } },
          create: data,
          update: data,
        });
      }
    },
    { timeout: 30000 },
  );
}

if (require.main === module) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error('DATABASE_URL is required for seeding');
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString, max: 1 }),
  });
  seed(prisma)
    .then(() => console.info('Seed completed.'))
    .catch(() => {
      console.error(
        'Seed failed. Check database availability and applied migrations.',
      );
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}
