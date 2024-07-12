import { Body, Controller, Post } from '@nestjs/common';
import { CreateWalletService } from './create-wallet.service';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Identifiers } from '@/infra/helpers/Identifiers';

const createWalletSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  cpf: z.string().refine((cpf: string) => {
    return Identifiers.validateCPF(cpf);
  }, 'Digite um cpf válido.'),
  cnpj: z.string().length(18).optional(),
  password: z.string().min(8),
  // walletType: z.nativeEnum(WALLET_TYPE).optional().default(WALLET_TYPE.USER),
});

type CreateWalletSchema = z.infer<typeof createWalletSchema>;

@Controller()
export class CreateWalletController {
  constructor(private readonly createWalletService: CreateWalletService) {}
  @Post('/wallets')
  async handle(
    @Body(new ZodValidationPipe(createWalletSchema)) body: CreateWalletSchema,
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
