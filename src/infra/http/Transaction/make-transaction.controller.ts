import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

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

    const { isAuthorized } = await this.makeTransactionService.execute({
      payer,
      payee,
      amount,
    });
    return { isAuthorized };
  }
}
