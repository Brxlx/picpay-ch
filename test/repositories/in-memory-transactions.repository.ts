import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionRepository {
  public items: Transaction[] = [];

  async tranfer(transaction: Transaction): Promise<Transaction | undefined> {
    if (transaction.amount < 0) {
      return undefined;
    }

    this.items.push(transaction);
    return transaction;
  }
}
