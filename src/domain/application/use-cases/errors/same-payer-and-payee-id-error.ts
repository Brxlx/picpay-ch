import { UseCaseError } from '@/core/errors/use-case-error';

export class SamePayerAndPayeeIdError extends Error implements UseCaseError {
  message = 'You cannot make transactions to yourself';
}
