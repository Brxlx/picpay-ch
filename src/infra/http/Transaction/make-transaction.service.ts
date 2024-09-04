import { Injectable } from '@nestjs/common';

import { MakeTransactionUseCase } from '@/domain/application/use-cases/Transaction/make-transaction-use-case';

@Injectable()
export class MakeTransactionService extends MakeTransactionUseCase {}
