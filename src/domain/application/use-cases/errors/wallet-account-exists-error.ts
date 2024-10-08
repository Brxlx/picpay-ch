import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class WalletAccountExistsError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.WALLET_ACCOUNT_EXISTS_ERROR);
  }
}
