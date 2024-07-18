import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const makeTransactionSchema = extendApi(
  z.object({
    payer: z.string().uuid(),
    payee: z.string().uuid(),
    amount: z.number().positive(),
  }),
);

const makeTransactionResponse = extendApi(
  z.object({
    isAuthorized: z.boolean(),
  }),
);

export type MakeTransactionSchema = z.infer<typeof makeTransactionSchema>;
export class MakeTransactionDTO extends createZodDto(makeTransactionSchema) {}
export class MakeTransactionResponse extends createZodDto(
  makeTransactionResponse,
) {}
