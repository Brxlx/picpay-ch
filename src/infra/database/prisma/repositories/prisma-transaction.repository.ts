import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { PrismaService } from '../prisma.service';
import { PrismaTransactionMapper } from '../mappers/prisma-transaction.mapper';
import { Injectable } from '@nestjs/common';
import { Wallet } from '@/domain/enterprise/entities/wallet';

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

    const [doneTransaction] = await this.prisma.$transaction([
      newTransaction,
      updatePayerBalance,
      updatePayeeBalance,
    ]);

    if (!doneTransaction)
      return PrismaTransactionMapper.toDomain(doneTransaction);
  }
}
