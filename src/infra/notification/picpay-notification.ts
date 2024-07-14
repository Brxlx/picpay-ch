import { Notification } from '@/domain/application/gateways/notification/notification';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class PicPayNotification implements Notification {
  async notificate(transaction: Transaction): Promise<void> {
    console.log(`notification for ${transaction.receiver} sent`);
  }
}
