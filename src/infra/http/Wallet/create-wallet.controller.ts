import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateWalletService } from './create-wallet.service';
import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { extendApi } from '@anatine/zod-openapi';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Identifiers } from '@/infra/helpers/Identifiers';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

export const createWalletSchema = extendApi(
  z.object({
    fullName: z.string(),
    email: z.string().email(),
    cpf: z
      .string()
      .length(14)
      .refine((cpf: string) => {
        return Identifiers.validateCPF(cpf);
      }, 'Digite um cpf válido.'),
    cnpj: z
      .string()
      .length(18)
      .refine((cnpj: string) => {
        return Identifiers.validateCNPJ(cnpj);
      })
      .optional(),
    password: z.string().min(8),
  }),
);

type CreateWalletSchema = z.infer<typeof createWalletSchema>;
class CreateWalletDTO extends createZodDto(createWalletSchema) {}

@Controller('/wallets')
export class CreateWalletController {
  constructor(private readonly createWalletService: CreateWalletService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Wallet')
  @ApiOperation({ summary: 'AA' })
  @ApiBody({ type: CreateWalletDTO })
  async handle(
    @Body(new ZodValidationPipe(createWalletSchema))
    body: CreateWalletSchema,
  ) {
    const { fullName, email, password, cpf, cnpj } = body;

    await this.createWalletService.execute({
      fullName,
      email,
      password,
      cpf,
      cnpj,
    });
  }
}
