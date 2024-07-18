import { Identifiers } from '@/infra/helpers/Identifiers';
import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi, extendZodWithOpenApi } from '@anatine/zod-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const createWalletSchema = extendApi(
  z.object({
    fullName: z.string(),
    email: z.string().email(),
    cpf: z
      .string()
      .length(14)
      .refine((cpf: string) => {
        return Identifiers.validateCPF(cpf);
      }, 'Digite um cpf válido.')
      .openapi({ example: '000.000.000-00' }),
    cnpj: z
      .string()
      .length(18)
      .refine((cnpj: string) => {
        return Identifiers.validateCNPJ(cnpj);
      })
      .optional()
      .openapi({ example: '00.000.000/0000-00' }),
    password: z.string().min(8).openapi({ example: '12345678' }),
    balance: z
      .number()
      .refine((bal) => bal.toFixed(2))
      .default(0),
  }),
);

export type CreateWalletSchema = z.infer<typeof createWalletSchema>;
export class CreateWalletDTO extends createZodDto(createWalletSchema) {}