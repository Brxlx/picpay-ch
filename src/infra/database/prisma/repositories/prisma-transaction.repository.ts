import { Injectable } from '@nestjs/common';

import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

import { PrismaTransactionMapper } from '../mappers/prisma-transaction.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly prisma: PrismaService) {}
  async tranfer(
    transaction: Transaction,
    payer: Wallet,
    payee: Wallet,
  ): Promise<Transaction | undefined> {
    const newTransaction = this.prisma.transaction.create({
      data: PrismaTransactionMapper.toPrisma(transaction),
    });

    const updatePayerBalance = this.prisma.wallet.update({
      where: { id: payer.id.toString() },
      data: { balance: payer.balance },
    });

    const updatePayeeBalance = this.prisma.wallet.update({
      where: { id: payee.id.toString() },
      data: { balance: payee.balance },
    });

    try {
      const [doneTransaction] = await this.prisma.$transaction([
        newTransaction,
        updatePayerBalance,
        updatePayeeBalance,
      ]);

      return PrismaTransactionMapper.toDomain(doneTransaction);
    } catch {
      throw new Error('Error on making transaction, reverting...');
    }
  }
}
