import { Notification } from '@/domain/application/gateways/notification/notification';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class FakeNotification implements Notification {
  async notificate(transaction: Transaction): Promise<void> {
    console.log(`notification sent to ${transaction.receiver}`);
  }
}
