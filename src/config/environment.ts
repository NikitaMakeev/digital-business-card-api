import Joi from 'joi';

export const environmentSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  DATABASE_URL: Joi.string()
    .uri({ scheme: ['postgresql', 'postgres'] })
    .required(),
  PORT: Joi.number().port().default(3000),
  DEFAULT_PROFILE_SLUG: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .default('nikita-makeev'),
  PRISMA_QUERY_LOG: Joi.boolean().default(false),
});

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const result = environmentSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (result.error) {
    // Report keys only: a validation error must never echo a secret URL's value.
    throw new Error(
      `Invalid environment: ${result.error.details.map((detail) => detail.path.join('.')).join(', ')}`,
    );
  }
  return result.value as Record<string, unknown>;
}
