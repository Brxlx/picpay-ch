import { Module } from '@nestjs/common';

import { CoreEnv } from '@/core/env/env';
import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { Queue } from '@/domain/application/gateways/queue/queue';
import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { AuthorizerModule } from '@/infra/authorizer/authorizer.module';
import { DatabaseModule } from '@/infra/database/database.module';
import { EnvModule } from '@/infra/env/env.module';
import { Env } from '@/infra/env/env-schema';
import { NotificationModule } from '@/infra/notification/notification.module';
import { QueueModule } from '@/infra/queue/queue.module';

import { MakeTransactionController } from './make-transaction.controller';
import { MakeTransactionService } from './make-transaction.service';

@Module({
  imports: [DatabaseModule, EnvModule, AuthorizerModule, QueueModule, NotificationModule],
  controllers: [MakeTransactionController],
  providers: [
    {
      provide: MakeTransactionService,
      useFactory: (
        transactionRepository: TransactionRepository,
        walletsRepository: WalletsRepository,
        envService: CoreEnv<Env>,
        authorizer: Authorizer,
        queue: Queue,
      ) => {
        return new MakeTransactionService(
          transactionRepository,
          walletsRepository,
          envService,
          authorizer,
          queue,
        );
      },
      inject: [TransactionRepository, WalletsRepository, CoreEnv, Authorizer, Queue, Notification],
    },
  ],
  exports: [MakeTransactionService],
})
export class TransactionModule {}
