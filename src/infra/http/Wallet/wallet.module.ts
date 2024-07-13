import { Module } from '@nestjs/common';
import { CreateWalletController } from './create-wallet.controller';
import { CreateWalletService } from './create-wallet.service';
import { WalletsRepository } from '@/domain/application/repositories/wallets-repository';
import { HashGenerator } from '@/domain/application/gateways/crypto/hash-generator';
import { DatabaseModule } from '@/infra/database/database.module';
import { CryptoModule } from '@/infra/crypto/crypto.module';
import { WalletsTypeRepository } from '@/domain/application/repositories/wallets-type.repository';

@Module({
  imports: [DatabaseModule, CryptoModule],
  controllers: [CreateWalletController],
  providers: [
    {
      provide: CreateWalletService,
      useFactory: (
        walletsRepository: WalletsRepository,
        walletsTypeRepository: WalletsTypeRepository,
        hashGenerator: HashGenerator,
      ) => {
        return new CreateWalletService(
          walletsRepository,
          walletsTypeRepository,
          hashGenerator,
        );
      },
      inject: [WalletsRepository, WalletsTypeRepository, HashGenerator],
    },
  ],
  exports: [CreateWalletService],
})
export class WalletModule {}
