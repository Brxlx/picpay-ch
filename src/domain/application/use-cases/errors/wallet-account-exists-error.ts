import { UseCaseError } from '@/core/errors/use-case-error';

export class WalletAccountExistsError extends Error implements UseCaseError {
  message = 'Wallet account already exists';
}
