import { UseCaseError } from '@/core/errors/use-case-error';

export class UserOnTransactionNotFoundError
  extends Error
  implements UseCaseError
{
  message: string;
  constructor(message: string | Record<string, any>) {
    super();
    this.message = message as string;
  }
}
