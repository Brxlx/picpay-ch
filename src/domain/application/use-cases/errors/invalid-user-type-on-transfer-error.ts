import { UseCaseError } from '@/core/errors/use-case-error';

export class InvalidUserTypeOnTranferError
  extends Error
  implements UseCaseError
{
  message: string = 'Merchants can NOT transfer';
}
