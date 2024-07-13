import { Authorize } from '@/domain/application/gateways/authorizer/authorize';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class Authorizer implements Authorize {
  async authorize(
    transaction: Transaction,
    url: string,
  ): Promise<{ isAuthorized: boolean }> {
    console.log(`amount of ${transaction.amount} to authorize`);
    return { isAuthorized: true };
  }
}
