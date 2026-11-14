import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { validateEnvironment } from './config/environment';
import { ExperienceModule } from './experience/experience.module';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { ProjectsModule } from './projects/projects.module';
import { SkillsModule } from './skills/skills.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: true,
      sortSchema: true,
      graphiql: false,
      introspection: true,
      csrfPrevention: true,
      includeStacktraceInErrorResponses: false,
      plugins: [
        ApolloServerPluginLandingPageLocalDefault({
          embed: { runTelemetry: false },
          document:
            'query { profile { name description skills { name } experience { company position } projects { name } } }',
        }),
      ],
    }),
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    ProjectsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
