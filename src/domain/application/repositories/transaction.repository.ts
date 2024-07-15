import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

export abstract class TransactionRepository {
  abstract tranfer(
    transaction: Transaction,
    payer: Wallet,
    payee: Wallet,
  ): Promise<Transaction | undefined>;
}
