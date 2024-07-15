import { DatabaseModule } from '@/infra/database/database.module';
import { Module } from '@nestjs/common';
import { MakeTransactionController } from './make-transaction.controller';
import { MakeTransactionService } from './make-transaction.service';
import { TransactionRepository } from '@/domain/application/repositories/transaction.repository';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { EnvService } from '@/infra/env/env.service';
import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Notification } from '@/domain/application/gateways/notification/notification';
import { EnvModule } from '@/infra/env/env.module';
import { AuthorizerModule } from '@/infra/authorizer/authorizer.module';
import { NotificationModule } from '@/infra/notification/notification.module';

@Module({
  imports: [DatabaseModule, EnvModule, AuthorizerModule, NotificationModule],
  controllers: [MakeTransactionController],
  providers: [
    {
      provide: MakeTransactionService,
      useFactory: (
        transactionRepository: TransactionRepository,
        walletsRepository: WalletsRepository,
        envService: EnvService,
        authorizer: Authorizer,
        notification: Notification,
      ) => {
        return new MakeTransactionService(
          transactionRepository,
          walletsRepository,
          envService,
          authorizer,
          notification,
        );
      },
      inject: [
        TransactionRepository,
        WalletsRepository,
        EnvService,
        Authorizer,
        Notification,
      ],
    },
  ],
  exports: [MakeTransactionService],
})
export class TransactionModule {}
