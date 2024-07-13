import { WalletsTypeRepository } from '@/domain/application/repositories/wallets-type.repository';
import { WalletType } from '@/domain/enterprise/entities/wallet-type';
import { PrismaService } from '../prisma.service';
import { WALLET_TYPE } from '@prisma/client';
import { PrismaWalletsTypeMapper } from '../mappers/prisma-wallets-type.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaWalletsTypeRepository implements WalletsTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByDescription(
    description: WALLET_TYPE,
  ): Promise<WalletType | null> {
    const walletType = await this.prisma.walletType.findFirst({
      where: { description: { equals: description } },
    });

    if (!walletType) return null;

    return PrismaWalletsTypeMapper.toDomain(walletType);
  }
}
