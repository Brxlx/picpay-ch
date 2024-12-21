import { Module } from '@nestjs/common';

import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { EnvModule } from '@/infra/env/env.module';

import { TestDatabase } from './test-database';

@Module({
  imports: [EnvModule],
  providers: [TestDatabase, PrismaService],
  exports: [TestDatabase],
})
export class TestDatabaseModule {}
