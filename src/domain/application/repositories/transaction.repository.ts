import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class TransactionRepository {
  abstract tranfer(
    transaction: Transaction,
  ): Promise<{ isAuthorized: boolean }>;
}
