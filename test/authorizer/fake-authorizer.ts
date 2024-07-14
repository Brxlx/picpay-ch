import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class FakeAuthorizer implements Authorizer {
  async authorize(
    transaction: Transaction,
  ): Promise<{ isAuthorized: boolean }> {
    const isAuthorized = true;
    console.log(`Amount of ${transaction.amount} to authorize.`);

    // Simulate fetch call
    await new Promise((res) => setTimeout(res, 500));

    if (!isAuthorized) {
      console.log('Transaction NOT AUTHORIZED');
    } else {
      console.log('Transaction AUTHORIZED');
    }
    return { isAuthorized };
  }
}
