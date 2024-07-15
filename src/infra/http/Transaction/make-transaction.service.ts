import { MakeTransactionUseCase } from '@/domain/application/use-cases/Transaction/make-transaction-use-case';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MakeTransactionService extends MakeTransactionUseCase {}
