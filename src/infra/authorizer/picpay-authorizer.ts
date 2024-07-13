import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Authorizer } from 'test/http/fake-authorizer';

export class PicPayAuthorizer implements Authorizer {
  async authorize(
    transaction: Transaction,
    url: string,
  ): Promise<{ isAuthorized: boolean }> {
    const isAuthorized = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payer: transaction.sender,
        payee: transaction.receiver,
        amount: transaction.amount,
      }),
    }).then((response) => response.json().then((json) => json));

    console.log(isAuthorized);

    return { isAuthorized: isAuthorized as boolean };
  }
}
