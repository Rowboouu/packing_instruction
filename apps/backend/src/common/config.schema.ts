import * as z from 'zod';

export const configSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  ORIGINS: z.string().transform((origin) => origin.split(',')),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  DATABASE_NAME: z.string(),
  JWT_SECRET: z.string(),
  ZULU_URL: z.string().url(),
  ZULU_LOGIN: z.string().email(),
  ZULU_PASSWORD: z.string(),
  ZULU_DB: z.string(),
  HOST_URL: z.string(),
  AUTOMATE_PATH: z.string(),
  SEND_EMAIL_URL: z.string(),
});

export type ConfigSchemaType = z.infer<typeof configSchema>;
