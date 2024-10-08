import { Prisma, Transaction as PrismaTransaction } from '@prisma/client';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class PrismaTransactionMapper {
  static toDomain(raw: PrismaTransaction): Transaction {
    return Transaction.create(
      {
        sender: new UniqueEntityID(raw.senderId),
        receiver: new UniqueEntityID(raw.receiverId),
        amount: Number(raw.amount),
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(transaction: Transaction): Prisma.TransactionUncheckedCreateInput {
    return {
      id: transaction.id.toString(),
      senderId: transaction.sender.toString(),
      receiverId: transaction.receiver.toString(),
      amount: transaction.amount,
      createdAt: transaction.createdAt,
    };
  }
}
