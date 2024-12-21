import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'homol', 'prod'] as const).default('dev'),
  APP_PORT: z.coerce.number().optional().default(3000),
  DATABASE_URL: z.string().url(),
  TRANSFER_AUTHORIZER_URL_MOCK: z.string().url(),
  NOTIFICATION_SENDER_URL_MOCK: z.string().url(),
  RABBITMQ_URL: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
