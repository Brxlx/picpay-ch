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
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionNotAuthorizedError } from '@/domain/application/use-cases/errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '@/domain/application/use-cases/errors/user-on-transacton-not-found-error';
import { InvalidUserTypeOnTranferError } from '@/domain/application/use-cases/errors/invalid-user-type-on-transfer-error';
import {
  MakeTransactionDTO,
  MakeTransactionResponse,
  MakeTransactionSchema,
  makeTransactionSchema,
} from './types/transaction-schemas';
import { InsuficientBalanceError } from '@/domain/application/use-cases/errors/insuficient-balance-error';

@Controller('/tranfer')
export class MakeTransactionController {
  constructor(
    private readonly makeTransactionService: MakeTransactionService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiTags('Transaction')
  @ApiOperation({
    summary: 'Tranfer the given amount between users or user to merchants',
  })
  @ApiBody({ type: MakeTransactionDTO })
  @ApiOkResponse({ type: MakeTransactionResponse })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async handle(
    @Body(new ZodValidationPipe(makeTransactionSchema))
    body: MakeTransactionSchema,
  ) {
    const { payer, payee, amount } = body;
    try {
      const { isAuthorized } = await this.makeTransactionService.execute({
        payer,
        payee,
        amount,
      });
      return { isAuthorized };
    } catch (err: any) {
      console.log(typeof err.constructor, new err.constructor(err.message));
      switch (err.constructor) {
        case InsuficientBalanceError:
          throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
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
