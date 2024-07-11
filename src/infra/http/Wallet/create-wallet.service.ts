import { CreateWalletUseCase } from '@/domain/application/use-cases/Wallet/create-wallet-use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CreateWalletService extends CreateWalletUseCase {}
