import { Module } from '@nestjs/common';

import { Queue } from '@/domain/application/gateways/queue/queue';

import { EnvModule } from '../env/env.module';
import { NotificationModule } from '../notification/notification.module';
import { AmqpQueue } from './amqp-queue';

@Module({
  imports: [EnvModule, NotificationModule],
  providers: [{ provide: Queue, useClass: AmqpQueue }],
  exports: [Queue],
})
export class QueueModule {}
