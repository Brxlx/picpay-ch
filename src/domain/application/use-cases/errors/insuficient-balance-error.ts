import { UseCaseError } from '@/core/errors/use-case-error';

export class InsuficientBalanceError implements UseCaseError {
  message: string | Record<string, any> =
    'Insuficient balance to make transaction';
}
