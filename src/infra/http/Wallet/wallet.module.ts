import { Module } from '@nestjs/common';
import { CreateWalletController } from './create-wallet.controller';
import { CreateWalletService } from './create-wallet.service';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';
import { DatabaseModule } from '@/infra/database/database.module';

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
  exports: [CreateWalletService],
})
export class WalletModule {}
