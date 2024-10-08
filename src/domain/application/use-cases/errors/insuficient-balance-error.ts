import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class InsuficientBalanceError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.INSUFICIENT_BALANCE_ERROR);
  }
}
