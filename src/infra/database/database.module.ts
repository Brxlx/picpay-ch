import { Module } from '@nestjs/common';

import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { WalletsTypeRepository } from '@/domain/application/repositories/wallets-type.repository';

import { EnvModule } from '../env/env.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaWalletsTypeRepository } from './prisma/repositories/prisma.wallets-type.repository';
import { PrismaTransactionRepository } from './prisma/repositories/prisma-transaction.repository';
import { PrismaWalletsRepository } from './prisma/repositories/prisma-wallets.repository';

@Module({
  imports: [EnvModule],
  providers: [
    PrismaService,
    { provide: WalletsRepository, useClass: PrismaWalletsRepository },
    { provide: WalletsTypeRepository, useClass: PrismaWalletsTypeRepository },
    { provide: TransactionRepository, useClass: PrismaTransactionRepository },
  ],
  exports: [
    PrismaService,
    WalletsRepository,
    WalletsTypeRepository,
    TransactionRepository,
  ],
})
export class DatabaseModule {}
