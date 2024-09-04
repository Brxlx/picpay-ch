import { Module } from '@nestjs/common';

import { TransactionModule } from './Transaction/transaction.module';
import { WalletModule } from './Wallet/wallet.module';

@Module({
  imports: [WalletModule, TransactionModule],
})
export class HttpModule {}
