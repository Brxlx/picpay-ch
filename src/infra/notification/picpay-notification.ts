import { Notification } from '@/domain/application/gateways/notification/notification';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';

export class PicPayNotification implements Notification {
  async notificate(transaction: Transaction, payee: Wallet): Promise<string> {
    return `notification: ${payee.fullName}, you just received R$${transaction.amount.toFixed(2)}!`;
  }
}
