import { UseCaseError } from '@/core/errors/use-case-error';

export class EmailAlreadyExistsError extends Error implements UseCaseError {
  message = 'Email already exists';
  constructor() {
    super();
    this.message = this.message;
  }
}
