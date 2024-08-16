import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { MakeTransactionController } from './make-transaction.controller';
import { MakeTransactionService } from './make-transaction.service';
import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { EnvModule } from '@/infra/env/env.module';
import { AuthorizerModule } from '@/infra/authorizer/authorizer.module';
import { NotificationModule } from '@/infra/notification/notification.module';
import { QueueModule } from '@/infra/queue/queue.module';
import { Queue } from '@/domain/application/gateways/queue/queue';
import { CoreEnv } from '@/core/env/env';
import { Env } from '@/infra/env/env-schema';

@Module({
  imports: [
    DatabaseModule,
    EnvModule,
    AuthorizerModule,
    QueueModule,
    NotificationModule,
  ],
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
      inject: [
        TransactionRepository,
        WalletsRepository,
        CoreEnv,
        Authorizer,
        Queue,
        Notification,
      ],
    },
  ],
  exports: [MakeTransactionService],
})
export class TransactionModule {}
