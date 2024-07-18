import { UseCaseError } from '@/core/errors/use-case-error';

export class WalletAccountExistsError implements UseCaseError {
  message: string | Record<string, any> = 'Wallet account already exists';
}
