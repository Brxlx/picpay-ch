import { Notification } from '@/domain/application/gateways/notification/notification';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Wallet } from '@/domain/enterprise/entities/wallet';
import { Logger } from '@nestjs/common';

export class PicPayNotification implements Notification {
  async notificate(transaction: Transaction, payee: Wallet): Promise<void> {
    const logger = new Logger(PicPayNotification.name);

    logger.log(
      `notification: ${payee.fullName}, you just received R$${transaction.amount.toFixed(2)}!`,
    );
  }
}
