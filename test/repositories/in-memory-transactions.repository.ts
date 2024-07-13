import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionRepository {
  public items: Transaction[] = [];

  async tranfer(transaction: Transaction): Promise<{ isAuthorized: boolean }> {
    if (transaction.amount < 0) {
      return { isAuthorized: false };
    }

    this.items.push(transaction);
    return { isAuthorized: true };
  }
}
