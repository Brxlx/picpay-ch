import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { PrismaWalletsRepository } from './prisma/repositories/prisma-wallets.repository';
import { PrismaWalletsTypeRepository } from './prisma/repositories/prisma.wallets-type.repository';
import { WalletsTypeRepository } from '@/domain/application/repositories/wallets-type.repository';

@Module({
  providers: [
    PrismaService,
    { provide: WalletsRepository, useClass: PrismaWalletsRepository },
    { provide: WalletsTypeRepository, useClass: PrismaWalletsTypeRepository },
    // { provide: TransactionRepository, useClass: PrismaTransactionRepository },
  ],
  exports: [PrismaService, WalletsRepository, WalletsTypeRepository],
})
export class DatabaseModule {}
