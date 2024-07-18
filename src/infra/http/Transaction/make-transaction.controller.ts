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
  ApiTags,
} from '@nestjs/swagger';
import { TransactionNotAuthorizedError } from '@/domain/application/use-cases/errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '@/domain/application/use-cases/errors/user-on-transacton-not-found';
import { InvalidUserTypeOnTranferError } from '@/domain/application/use-cases/errors/invalid-user-type-on-transfer-error';
import {
  MakeTransactionDTO,
  MakeTransactionResponse,
  MakeTransactionSchema,
  makeTransactionSchema,
} from './types/transaction-schemas';

@Controller('/tranfer')
export class MakeTransactionController {
  constructor(
    private readonly makeTransactionService: MakeTransactionService,
  ) {}
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiTags('Transaction')
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
