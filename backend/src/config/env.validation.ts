import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  API_PORT: Joi.number().default(3100),
  CORS_ORIGIN: Joi.string().optional(),

  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  OVH_AI_ENDPOINTS_API_KEY: Joi.string().required(),
  OVH_AI_ENDPOINTS_BASE_URL: Joi.string().uri().optional().allow(''),

  SENTRY_DSN: Joi.string().optional().allow(''),
  SENTRY_TRACES_SAMPLE_RATE: Joi.number().min(0).max(1).optional(),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace')
    .optional(),
  DB_POOL_MAX: Joi.number().optional(),
}).unknown(true);
