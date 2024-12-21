import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

import { envSchema } from '@/infra/env/env-schema';

config({ path: '.env', override: true });
config({ path: '.env.test.local', override: true });

const env = envSchema.parse(process.env);

const prisma = new PrismaClient();

/**
 *
 * @param schemaId string
 * @returns string - the new URL with generate random schema id
 *
 * `IMPORTANT: THIS IS A SPECIFIC POSTGRESQL DATABASE SCHEMA GENERATION!`
 */
function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error('Provide a database url environment value for test e2e.');
  }

  // Define your database credentials directly from env variables
  const url = new URL(env.DATABASE_URL);
  url.searchParams.set('schema', schemaId);

  return url.toString();
}

const schemaId = randomUUID();
beforeAll(async () => {
  const databaseURL = generateUniqueDatabaseURL(schemaId);

  console.log(`DATABASE_URL: ${databaseURL}`);

  process.env.DATABASE_URL = databaseURL;

  execSync('pnpm prisma migrate deploy', {
    stdio: 'inherit',
  });
});

afterAll(async () => {
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
