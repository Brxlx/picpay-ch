import { Module } from '@nestjs/common';
import { CreateWalletController } from './Wallet/create-wallet.controller';
import { CreateWalletService } from './Wallet/create-wallet.service';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { DatabaseModule } from '../database/database.module';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';

@Module({
  imports: [DatabaseModule],
  controllers: [CreateWalletController],
  providers: [
    {
      provide: CreateWalletService,
      useFactory: (
        walletsRepository: WalletsRepository,
        hashGenerator: HashGenerator,
      ) => {
        return new CreateWalletService(walletsRepository, hashGenerator);
      },
    },
  ],
  exports: [],
})
export class HttpModule {}
