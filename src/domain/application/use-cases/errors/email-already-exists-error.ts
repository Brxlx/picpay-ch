import { UseCaseErrorMessages } from '@/core/consts/use-case-error-messages';
import { UseCaseError } from '@/core/errors/use-case-error';

export class EmailAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super(UseCaseErrorMessages.EMAIL_ALREADY_EXISTS_ERROR);
  }
}
