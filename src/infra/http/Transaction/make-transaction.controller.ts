import { Body, Controller, Post } from '@nestjs/common';
import { MakeTransactionService } from './make-transaction.service';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

const makeTransactionSchema = z.object({
  payer: z.string().uuid(),
  payee: z.string().uuid(),
  amount: z.number(),
});

type MakeTransactionSchema = z.infer<typeof makeTransactionSchema>;

@Controller('/tranfer')
export class MakeTransactionController {
  constructor(
    private readonly makeTransactionService: MakeTransactionService,
  ) {}
  @Post()
  async handle(
    @Body(new ZodValidationPipe(makeTransactionSchema))
    body: MakeTransactionSchema,
  ) {
    const { payer, payee, amount } = body;

    await this.makeTransactionService.execute({
      payer,
      payee,
      amount,
    });
  }
}
