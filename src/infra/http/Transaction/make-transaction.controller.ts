import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { InsuficientBalanceError } from '@/domain/application/use-cases/errors/insuficient-balance-error';
import { InvalidUserTypeOnTranferError } from '@/domain/application/use-cases/errors/invalid-user-type-on-transfer-error';
import { SamePayerAndPayeeIdError } from '@/domain/application/use-cases/errors/same-payer-and-payee-id-error';
import { TransactionNotAuthorizedError } from '@/domain/application/use-cases/errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '@/domain/application/use-cases/errors/user-on-transacton-not-found-error';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { MakeTransactionService } from './make-transaction.service';
import {
  MakeTransactionDTO,
  MakeTransactionResponse,
  MakeTransactionSchema,
  makeTransactionSchema,
} from './types/transaction-schemas';

@Controller('/tranfer')
export class MakeTransactionController {
  constructor(private readonly makeTransactionService: MakeTransactionService) {}
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
      this.handleControllerError(err);
    }
  }

  private handleControllerError(err: { constructor: any; message: string | Record<string, any> }) {
    switch (err.constructor) {
      case SamePayerAndPayeeIdError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case InsuficientBalanceError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case TransactionNotAuthorizedError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case UserOnTransactionNotFoundError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case InvalidUserTypeOnTranferError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      default:
        throw new InternalServerErrorException(err.message ?? 'Something went wrong on Server');
    }
  }
}
