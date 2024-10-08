import { faker } from '@faker-js/faker/locale/pt_BR';

import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { Transaction, TransactionProps } from '@/domain/enterprise/entities/transaction';

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
