import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class SamePayerAndPayeeIdError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.SAME_PAYER_AND_PAYEE_ID_ERROR);
  }
}
