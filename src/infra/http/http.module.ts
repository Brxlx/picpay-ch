import { Module } from '@nestjs/common';
import { WalletModule } from './Wallet/wallet.module';
import { TransactionModule } from './Transaction/transaction.module';

@Module({
  imports: [WalletModule, TransactionModule],
})
export class HttpModule {}
