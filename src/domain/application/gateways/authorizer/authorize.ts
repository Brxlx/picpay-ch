import { Transaction } from '@/domain/enterprise/entities/transaction';

export abstract class Authorizer {
  abstract authorize(
    transaction: Transaction,
    url: string,
  ): Promise<{ isAuthorized: boolean }>;
}
