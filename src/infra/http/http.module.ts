import { Module } from '@nestjs/common';
import { WalletModule } from './Wallet/wallet.module';

@Module({
  imports: [WalletModule],
})
export class HttpModule {}
