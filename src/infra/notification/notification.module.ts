import { Module } from '@nestjs/common';

import { Notification } from '@/domain/application/gateways/notification/notification';

import { PicPayNotification } from './picpay-notification';

@Module({
  providers: [{ provide: Notification, useClass: PicPayNotification }],
  exports: [Notification],
})
export class NotificationModule {}
