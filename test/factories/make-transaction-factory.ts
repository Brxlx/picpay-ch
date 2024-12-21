import { faker } from '@faker-js/faker/locale/pt_BR';
import { Injectable } from '@nestjs/common';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Transaction, TransactionProps } from '@/domain/enterprise/entities/transaction';
import { PrismaTransactionMapper } from '@/infra/database/prisma/mappers/prisma-transaction.mapper';
import { PrismaService } from '@/infra/database/prisma/prisma.service';

export async function makeTransaction(
  override: Partial<TransactionProps> = {},
  id?: UniqueEntityID,
) {
  return Transaction.create(
    {
      sender: new UniqueEntityID(),
      receiver: new UniqueEntityID(),
      amount: faker.number.float({ fractionDigits: 2, min: 0, max: 3000 }),
      ...override,
    },
    id,
  );
}

@Injectable()
export class TransactionFactory {
  constructor(private readonly prisma: PrismaService) {}

  public async makePrismaTransaction(data: Partial<TransactionProps> = {}, id?: UniqueEntityID) {
    const transaction = await makeTransaction(data, id);

    console.log(PrismaTransactionMapper.toPrisma(transaction));

    await this.prisma.transaction.create({
      data: PrismaTransactionMapper.toPrisma(transaction),
    });

    return transaction;
  }
}
