import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class InMemoryTransactionsRepository implements TransactionRepository {
  public items: Transaction[] = [];

  async tranfer(
    transaction: Transaction,
    // Omited because not used
    // payer: Wallet,
    // payee: Wallet,
  ): Promise<Transaction | undefined> {
    this.items.push(transaction);
    return transaction;
  }
}
