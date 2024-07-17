import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Logger } from '@nestjs/common';

export class PicPayAuthorizer implements Authorizer {
  private logger: Logger = new Logger(PicPayAuthorizer.name);
  async authorize(
    transaction: Transaction,
    url: string,
  ): Promise<{ isAuthorized: boolean }> {
    try {
      const isAuthorized = (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer: transaction.sender,
          payee: transaction.receiver,
          amount: transaction.amount,
        }),
      }).then((response) => response.json().then((json) => json))) as {
        authorized: boolean;
      };
      isAuthorized.authorized = true;
      if (!isAuthorized.authorized)
        this.logger.error('transaction not authorized');
      return { isAuthorized: isAuthorized.authorized };
    } catch {
      this.logger.error('Error authorizing transaction');
      return { isAuthorized: false };
    }
  }
}
