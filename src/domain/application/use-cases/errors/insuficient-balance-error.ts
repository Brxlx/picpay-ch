import { UseCaseError } from '@/core/errors/use-case-error';

export class InsuficientBalanceError extends Error implements UseCaseError {
  message = 'Insuficient balance to make transaction';

  constructor() {
    super();
    this.message = this.message;
  }
}
