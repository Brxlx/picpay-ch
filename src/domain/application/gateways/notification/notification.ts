import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

export abstract class Notification {
  abstract notificate(transaction: Transaction, payee: Wallet): Promise<void>;
}
