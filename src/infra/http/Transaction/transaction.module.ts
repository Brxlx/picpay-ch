import { Transaction } from '@/domain/enterprise/entities/transaction';
import { Module } from '@nestjs/common';

@Module({
  providers: [],
  exports: [Transaction],
})
export class TransactionModule {}
