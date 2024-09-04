import { Injectable } from '@nestjs/common';

import { CreateWalletUseCase } from '@/domain/application/use-cases/Wallet/create-wallet-use-case';

@Injectable()
export class CreateWalletService extends CreateWalletUseCase {}
