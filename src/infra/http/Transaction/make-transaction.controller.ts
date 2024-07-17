import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { MakeTransactionService } from './make-transaction.service';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { ApiTags } from '@nestjs/swagger';
import { TransactionNotAuthorizedError } from '@/domain/application/use-cases/errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '@/domain/application/use-cases/errors/user-on-transacton-not-found';
import { InvalidUserTypeOnTranferError } from '@/domain/application/use-cases/errors/invalid-user-type-on-transfer-error';

const makeTransactionSchema = z.object({
  payer: z.string().uuid(),
  payee: z.string().uuid(),
  amount: z.number().positive(),
});

type MakeTransactionSchema = z.infer<typeof makeTransactionSchema>;

@Controller('/tranfer')
export class MakeTransactionController {
  constructor(
    private readonly makeTransactionService: MakeTransactionService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiTags('Transaction')
  async handle(
    @Body(new ZodValidationPipe(makeTransactionSchema))
    body: MakeTransactionSchema,
  ) {
    const { payer, payee, amount } = body;
    try {
      await this.makeTransactionService.execute({
        payer,
        payee,
        amount,
      });
    } catch (err: any) {
      switch (err.constructor) {
        case TransactionNotAuthorizedError:
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        case UserOnTransactionNotFoundError:
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        case InvalidUserTypeOnTranferError:
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
        default:
          throw new BadRequestException(err.message);
      }
    }
  }
}
