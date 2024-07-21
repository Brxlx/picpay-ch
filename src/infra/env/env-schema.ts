import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'homol', 'prod'] as const).default('dev'),
  APP_PORT: z.coerce.number().optional().default(3000),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_DB: z.string(),
  DATABASE_URL: z.string().url(),
  TRANSFER_AUTHORIZER_URL_MOCK: z.string().url(),
  NOTIFICATION_SENDER_URL_MOCK: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
