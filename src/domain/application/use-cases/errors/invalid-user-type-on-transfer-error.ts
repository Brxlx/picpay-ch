import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidUserTypeOnTranferError implements UseCaseError {
  message: string | Record<string, any> = 'Merchants can NOT transfer';
}
