import * as z from 'zod';

export const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  ORIGINS: z.string().transform((origin) => origin.split(',')),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  DATABASE_NAME: z.string(),
  JWT_SECRET: z.string().optional(),
  ZULU_URL: z.string().url().optional(),
  ZULU_LOGIN: z.string().email().optional(),
  ZULU_PASSWORD: z.string().optional(),
  ZULU_DB: z.string().optional(),
  HOST_URL: z.string().optional(),
  AUTOMATE_PATH: z.string().optional(),
  SEND_EMAIL_URL: z.string().optional(),
});

export type ConfigSchemaType = z.infer<typeof configSchema>;
