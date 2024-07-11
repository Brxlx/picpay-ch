import { Body, Controller, Post } from '@nestjs/common';
import { CreateWalletService } from './create-wallet.service';
import { z } from 'zod';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

const createWalletSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  cpf: z.string().refine((cpf: string) => {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
    const cpfDigits = cpf.split('').map((el) => +el);
    const rest = (count: number): number => {
      return (
        ((cpfDigits
          .slice(0, count - 12)
          .reduce((soma, el, index) => soma + el * (count - index), 0) *
          10) %
          11) %
        10
      );
    };
    return rest(10) === cpfDigits[9] && rest(11) === cpfDigits[10];
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
