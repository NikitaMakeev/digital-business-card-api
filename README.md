# Digital Business Card API

A small, read-only GraphQL backend for **Nikita Makeev**, built to be understandable and extendable during a live interview. NestJS, strict TypeScript, Apollo Server, Prisma, PostgreSQL, and Docker. No CMS, authentication, mutations, or speculative framework layers.

- Repository: https://github.com/NikitaMakeev/digital-business-card-api
- Live Sandbox: https://digital-business-card-api-dxsk.onrender.com/graphql

## Quick start

### Docker (no `.env` required)

Install Docker Engine/Desktop with Compose v2, then:

```sh
docker compose up --build
```

Open http://localhost:3000/graphql (Apollo Sandbox). Health: http://localhost:3000/health.
Postgres must be healthy before the API starts. Container startup runs **`prisma migrate deploy` → idempotent seed → server** and stops on any failure. Local database credentials in Compose are intentionally disposable, not production credentials. The database port is bound to loopback only.

```sh
docker compose restart api   # safe: seeding preserves rows and IDs
docker compose down         # keeps data
# DESTRUCTIVE, only for this project's disposable local database:
docker compose down -v
docker compose up --build
```

### Local Node.js

Use **Node.js 26.13.1 (current LTS)** from `.nvmrc`, npm, and PostgreSQL 17. Exact direct dependency versions and the transitive lockfile are committed. Prisma CLI/client/adapter are all **7.10.1** (stable; not the registry's Prisma 8 release candidate). TypeScript 5.9.3 and GraphQL 16.15.0 meet Nest's peer ranges.

```sh
cp .env.example .env  # do not overwrite an existing .env containing credentials
docker compose up -d postgres
npm ci
npm run build
npm run db:prepare
npm start
```

Without Docker, set `DATABASE_URL` in `.env` to your existing PostgreSQL database. `npm run start:dev` builds once and watches the compiled server; after a TypeScript edit, run `npm run build` in a second terminal. No global Nest or Prisma CLI needed. `npx prisma db seed` also invokes the compiled seed after building.

Configuration is validated at startup via `@nestjs/config` and Joi. Invalid keys are reported without echoing secret values. See `.env.example`: `DATABASE_URL` is required; port defaults to 3000; `DEFAULT_PROFILE_SLUG` defaults to `nikita-makeev`; SQL logging is off by default. Production secrets belong in host environment settings, never Git or Docker build arguments. Do not copy the Render management key into the running API.

## GraphQL schema overview

`Query.profile: Profile!` selects one profile by configured unique slug. A missing default profile is an explicit error, not an arbitrary first row. The database supports any number of profiles.

| Type        | Fields                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------- |
| Profile     | id, name, description, location, languages, links, skills, skillGroups, experience, projects |
| ProfileLink | type (GITHUB / LINKEDIN / TELEGRAM / WEBSITE / EMAIL), url, sortOrder                        |
| Skill       | id, name, category, sortOrder                                                                |
| SkillGroup  | category, sortOrder, skills                                                                  |
| Experience  | id, company, position, startDate, endDate, location, achievements, sortOrder                 |
| Project     | id, name, url, description, contribution, tags, sortOrder                                    |

All list fields are non-null lists of non-null items, in seed order. Experience dates are nullable ISO date-time scalars backed by SQL `DATE`; `endDate: null` means current, `startDate: null` means unknown. `contribution` can be null. Tags are ordered lists, empty where none were supplied.

The exact assignment query:

```graphql
query {
  profile {
    name
    description
    skills {
      name
    }
    experience {
      company
      position
    }
    projects {
      name
    }
  }
}
```

More detail (flat skills and groups share one database fetch):

```graphql
query {
  profile {
    name
    location
    languages
    links {
      type
      url
    }
    skills {
      name
      category
    }
    skillGroups {
      category
      skills {
        name
      }
    }
    experience {
      company
      position
      startDate
      endDate
      achievements
    }
    projects {
      name
      url
      description
      contribution
      tags
    }
  }
}
```

```sh
curl --fail-with-body http://localhost:3000/graphql \
  -H 'Content-Type: application/json' \
  --data '{"query":"query { profile { name description skills { name } experience { company position } projects { name } } }"}'
curl --fail-with-body -H 'Accept: text/html' http://localhost:3000/graphql
```

Sandbox landing plugin **and introspection are explicitly enabled in production**. This is intentional for a public portfolio API, not advice for a private API. CSRF prevention stays enabled, stack traces are excluded from GraphQL responses, and public CORS uses no credentials. Sandbox loads external Apollo CDN resources and needs browser internet access.

## Structure

```text
prisma/
  schema.prisma, migrations/   # database contract and versioned SQL
  seed-data.ts                # single source of supplied business-card facts
  seed.ts                     # transactional upserts
src/
  app.module.ts, main.ts       # configuration, GraphQL, lifecycle
  config/                     # fail-fast environment validation
  prisma/                     # shared singleton client + bounded pg pool
  common/batch-by-profile.ts  # key-aligned grouping, not a base repository
  profile/                    # default profile + typed links
  skills/                     # flat skills + category grouping
  experience/                 # employment history
  projects/                   # project contributions
test/                         # real-Postgres HTTP e2e tests
scripts/                      # container startup and verification
.github/workflows/ci.yml     # quality gates + clean Docker stack + restart
```

Each domain has a module, GraphQL model, resolver, service, repository, and request-scoped loader. Generated Prisma code lives in ignored `src/generated/prisma` and is regenerated before compilation. The build compiles the seed too; the runtime does not need ts-node/tsx or TypeScript.

## Architecture decisions

1. **Code-first GraphQL.** Decorated API classes keep the schema near TypeScript resolvers. This reduces editing context during an interview. Prisma-generated database types are not GraphQL DTOs: services explicitly map allowed API fields. Database changes cannot silently expose columns. No schema-first duplicate source or generic CRUD layer.
2. **Resolver → Service → Repository.** Resolvers contain GraphQL wiring only; loaders bridge relation resolution to services. Services implement default-profile selection, mapping, batching alignment, and category grouping. Repositories alone issue domain Prisma reads. The shared health controller's infrastructure probe is deliberately direct. Repositories are concrete and thin, not interface-per-class or abstract base classes.
3. **Request-scoped DataLoader.** Every nested relation uses `@ResolveField` with a loader keyed by `profileId`. One `WHERE profileId IN (...)` per relation batch; results align to input keys, missing keys return `[]`, and repeated keys share a promise. Nest request scope follows the GraphQL request context. No cross-request cache or stale personal data. Flat and grouped skills reuse the same loader. Leaf scalar arrays do not need loaders.
4. **Multiple profiles, one public default.** A unique slug configured via the environment avoids a fragile hard-coded database ID or a boolean default with unenforced uniqueness. Child foreign keys cascade on profile deletion, compound indexes start with `profileId`, and explicit `sortOrder` columns stabilize list order (ID breaks ties). A skill is unique by profile/category/name, preserving Claude Code in both supplied categories.
5. **Ordered PostgreSQL arrays.** Achievements, languages, and project tags are atomic ordered scalar values with no independent identity, metadata, or filtering requirement. Arrays preserve their order and avoid extra tables/joins. Use an achievement child table if achievements later need individual editing or attribution. Category order is a skill column; no category management subsystem is needed here.
6. **Idempotent seed.** `prisma/seed-data.ts` is the only source of personal facts. One transaction upserts by natural compound unique keys and preserves IDs. A retry never inserts duplicates. The seed updates supplied records but intentionally does not delete unspecified rows; it is bootstrap data, not a destructive CMS synchronizer. Startup overwrites edits to seeded facts: edit the seed until a real write interface exists.
7. **Prisma 7 conventions.** CLI URL and seed command live in `prisma.config.ts`; the schema uses the `prisma-client` generator with an explicit output and CommonJS format. Runtime uses `@prisma/adapter-pg` and a pool capped at five connections with connection/idle timeouts. The client connects at startup and disconnects on Nest shutdown. Migration CLI remains a production dependency because the required startup sequence runs migrations. Only production dependencies reach the slim, non-root runtime stage.
8. **Render Docker hosting + managed Postgres.** A long-lived process suits Nest lifecycle and connection reuse; Vercel is deliberately not used. Managed database and API are colocated in Frankfurt and use Render's internal URL at runtime. Only free plans are selected. Free web instances sleep after inactivity and cold requests may take about a minute. The initially provisioned free database **expires December 14, 2026**; migrate/upgrade before expiry. No paid upgrade is performed automatically.
9. **Tests use real PostgreSQL.** A dedicated `TEST_DATABASE_URL` is mandatory and cannot equal `DATABASE_URL`. CI supplies an ephemeral Postgres service; local Compose offers `test-postgres` with a separate port and tmpfs. This avoids mock-database differences and makes tests usable without a Docker daemon if a separate remote database exists. Testcontainers would add a second provisioning path without improving this small suite. Tests never reset a database or drop tables, but they seed the test database, so use a disposable one.

### Measured SQL queries: **4**

Measured with actual Prisma query events during the exact assignment query over HTTP against real PostgreSQL (`test/profile.e2e-spec.ts`). The test clears the event list after bootstrap/seed, then asserts all four statements are SELECTs:

| Read                                        | SQL statements |
| ------------------------------------------- | -------------: |
| Default Profile by unique slug              |              1 |
| Skills by profileId IN (...) — all 38 rows  |              1 |
| Experience by profileId IN (...)            |              1 |
| Projects by profileId IN (...) — all 5 rows |              1 |
| **Total**                                   |          **4** |

Actual test output: `Measured assignment query SQL count: 4`. No `links` query is executed when that field is absent. The detailed query including links, flat skills, and skill groups is **5** total; `{ profile { name } }` is **1**. Health probes, migrations, and seeds are outside the measurement window. A separate test proves multi-key loader batching/cache isolation. Enable `PRISMA_QUERY_LOG=true` to see SQL text (not parameters) in development/test; leave it off on public deployments. The count assertion prevents N+1 regressions.

## Verification

```sh
npm run build
npm run lint
npm test
docker compose --profile test up -d --wait test-postgres
# Set TEST_DATABASE_URL in .env; .env.example contains the Compose test URL.
npm run test:e2e
```

Unit tests cover mapping, key order, grouping, and configuration failures. E2e tests check the exact query and data, SQL counts, all fields, startup-seed idempotence (IDs and content), DataLoader batching/cache isolation, Sandbox HTML, introspection, and database health. Jest needs `--experimental-vm-modules` for Nest 12's ESM dependencies; the scripts include it. The application itself uses Node's native synchronous ESM interoperability, with no experimental runtime flag.

GitHub Actions additionally builds the Dockerfile, starts from an empty Compose volume, queries using curl, verifies Sandbox/health/data counts, restarts the API, and compares IDs/content before and after. All Compose cleanup is scoped to this project.

Local execution: 8 unit tests and 5 e2e tests passed against a separately created managed PostgreSQL test database. Docker CLI is unavailable on the author's execution machine; clean container verification is delegated to CI, not claimed as locally executed. Deployment and CI results are recorded below after verification.

### Deployment verification

- [Clean-stack CI run](https://github.com/NikitaMakeev/digital-business-card-api/actions/runs/43607912285): all gates passed, including empty-volume Docker build/start, the exact curl query, and API restart with unchanged row IDs/content.
- Production exact query: HTTP 200, no GraphQL errors, supplied profile, 38 ordered skills, one employment record, five projects.
- Production `/graphql` with `Accept: text/html`: HTTP 200 and embedded Sandbox; opened in Chromium and confirmed the Apollo Sandbox iframe and controls load. Production `/health`: HTTP 200, `{"status":"ok"}`.
- Dependencies: `npm audit --omit=dev` reports **zero vulnerabilities** after an explicit `@graphql-tools/utils` 12.1.0 override for [GHSA-c4qx-w738-7hr3](https://github.com/advisories/GHSA-c4qx-w738-7hr3). Apollo's upstream range still admits the vulnerable version; the override deliberately supersedes that range, is shared with Nest's version, and is covered by the full test suite. Remove it when upstream accepts a patched version.
- Full `npm audit` also checks build/test-only dependencies and reports upstream tooling advisories. These packages do not ship in the production image; track upstream fixes rather than forcing breaking Jest downgrades to suppress the report.

Render auto-deploy is intentionally off: deployment was triggered explicitly from the tested Git commit. To redeploy, open the service in Render → Manual Deploy → Deploy latest commit after CI passes. The host receives only runtime variables, not its own management API key. Keep external DB access restricted to trusted client IPs when testing remotely; the deployed API uses the internal database network.

## How to extend: Education

1. Add an `Education` Prisma model with `id`, `profileId`, `institution`, `qualification`, nullable dates, and `sortOrder`. Add `Profile.education`, a cascading foreign key, and an index on `[profileId, sortOrder]`.
2. Run `npx prisma migrate dev --name add_education` against a local development database; commit the generated migration. Regenerate/build the client.
3. Create `src/education/education.model.ts` with an independent `@ObjectType('Education')` and explicit `@Field` decorators; choose nullability intentionally.
4. Add a concrete repository with `findByProfileIds(ids)` using one `findMany` with `IN` and deterministic ordering. Add a service that aligns rows with `batchByProfile` and explicitly maps the API DTO.
5. Add a `Scope.REQUEST` DataLoader calling the service. In `@Resolver(() => ProfileModel)`, expose `education` with `@ResolveField(() => [EducationModel])` and `@Parent()`; call the loader, not Prisma.
6. Register these providers in `EducationModule`, import it in `AppModule`, and add supplied education facts to the upsert seed only when known. No education facts were supplied in this task.
7. Add service tests, a real-DB nested query test, and a query-count assertion. A query requesting education should add exactly one SQL SELECT per batch, not per profile. Update schema docs and run all gates.

## Assumptions and limitations

- **No freelance start year was supplied** (`[FILL: start year]`). `startDate` is nullable instead of inventing a year or a January 1 date. Supply the actual date in `seed-data.ts` when known.
- **No project tags were supplied:** all tags are `[]`. The last two projects have no separately supplied contribution, so it is `null`; descriptions are retained verbatim. No inferred technology claims, phone number, or additional personal facts are added.
- Only one Experience record is created. The four explicitly supplied freelance achievements are preserved, including aggregate project/rating mentions. Individual project histories/contributions live only in Projects; no synthetic Experience per project. This resolves the assignment's potentially conflicting duplication wording without discarding supplied text.
- This is intentionally a read-only public portfolio API. No pagination, write authentication, rate limiter, complexity limits, or CMS is built speculatively. Before broad public traffic: add per-IP throttling and query depth/complexity/alias limits; add pagination if lists grow; add observability, backups, and a non-expiring database plan.
- The test runner rejects identical URL strings, but cannot prove two different URLs do not refer to the same database. Provision genuinely separate databases.
- Startup migrations/seed fit one small instance. For horizontal rollout, move them to a one-off release job, leaving only server startup in each replica.
- Health checks report DB reachability, not full downstream diagnostics. Runtime logs are operational data; avoid adding credentials/parameters to them.

## Current API references consulted

- [Nest GraphQL quick start (Apollo 5, code-first, Sandbox)](https://docs.nestjs.com/graphql/quick-start)
- [Nest configuration](https://docs.nestjs.com/techniques/configuration) and installed `@nestjs/config` type definitions (v12 uses Standard Schema; Joi is integrated through `validate`)
- [Prisma configuration reference (v7)](https://www.prisma.io/docs/orm/reference/prisma-config-reference)
- [Prisma client generation](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/generating-prisma-client)
- [Apollo landing-page plugin options](https://www.apollographql.com/docs/apollo-server/api/plugin/landing-pages)
- [Node release index](https://nodejs.org/dist/index.json), [Render API](https://render.com/docs/api)
