import { Logger } from '@nestjs/common';

import { Authorizer } from '@/domain/application/gateways/authorizer/authorize';
import { Transaction } from '@/domain/enterprise/entities/transaction';

export class PicPayAuthorizer implements Authorizer {
  private logger: Logger = new Logger(PicPayAuthorizer.name);
  async authorize(transaction: Transaction, url: string): Promise<{ isAuthorized: boolean }> {
    try {
      const { authorized } = (await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer: transaction.sender,
          payee: transaction.receiver,
          amount: transaction.amount,
        }),
      }).then((response) => response.json().then((jsonSerialized) => jsonSerialized))) as {
        authorized: boolean;
      };
      // isAuthorized.authorized = false;
      if (!authorized) {
        this.logger.error('transaction not authorized');
        return { isAuthorized: false };
      }
      return { isAuthorized: authorized };
    } catch {
      this.logger.error(`Error authorizing transaction id: ${transaction.id.toString()}`);
      return { isAuthorized: false };
    }
  }
}
