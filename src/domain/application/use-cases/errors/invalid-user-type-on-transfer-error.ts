import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidUserTypeOnTranferError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.INVALID_USER_TYPE_ON_TRANSFER_ERROR);
  }
}
