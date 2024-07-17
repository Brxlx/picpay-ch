import { UseCaseError } from '@/core/errors/use-case-error';

export class TransactionNotAuthorizedError implements UseCaseError {
  message: string | Record<string, any>;
  constructor(message: string | Record<string, any>) {
    this.message = message;
  }
}
