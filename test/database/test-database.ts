import { Injectable } from '@nestjs/common';

import { PrismaTransactionMapper } from '@/infra/database/prisma/mappers/prisma-transaction.mapper';
import { PrismaWalletMapper } from '@/infra/database/prisma/mappers/prisma-wallet.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

@Injectable()
export class TestDatabase {
  constructor(private readonly prisma: PrismaService) {}

  public async reset() {
    await this.prisma.$transaction([
      this.prisma.transaction.deleteMany({}),
      this.prisma.wallet.deleteMany({}),
    ]);
  }

  public async getWalletState(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) return null;

    return PrismaWalletMapper.toDomain(wallet);
  }

  public async getTransactionRecord(senderId: string, receiverId: string, amount: number) {
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        senderId,
        receiverId,
        amount,
      },
    });
    if (!transaction) return null;

    return PrismaTransactionMapper.toDomain(transaction);
  }

  public async getAllWalletTransactions(walletId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        OR: [{ senderId: walletId }, { receiverId: walletId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return transactions.map(PrismaTransactionMapper.toDomain);
  }
}
