import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class Notification {
  abstract notificate(transaction: Transaction): Promise<void>;
}
