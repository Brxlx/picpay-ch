import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';
import { z } from 'zod';

export const makeTransactionSchema = extendApi(
  z.object({
    payer: z.string().uuid(),
    payee: z.string().uuid(),
    amount: z
      .number()
      .positive() // Garante que o número seja positivo
      .transform((val) => {
        const decimalPart = val - Math.trunc(val);
        // Se tiver uma casa decimal, adiciona um zero
        return decimalPart.toFixed(1) === decimalPart.toString() ? val.toFixed(2) : val.toFixed(2);
      })
      .transform((val) => parseFloat(val)),
  }),
);

const makeTransactionResponse = extendApi(
  z.object({
    isAuthorized: z.boolean(),
  }),
);

export type MakeTransactionSchema = z.infer<typeof makeTransactionSchema>;
export class MakeTransactionDTO extends createZodDto(makeTransactionSchema) {}
export class MakeTransactionResponse extends createZodDto(makeTransactionResponse) {}
