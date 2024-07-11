import { Body, Controller, Post } from '@nestjs/common';
import { CreateWalletService } from './create-wallet.service';
import { z } from 'zod';
import { WALLET_TYPE } from '@/core/types/wallet-type';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

const createWalletSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  cpfCnpj: z.string(),
  password: z.string().min(8),
  walletType: z.nativeEnum(WALLET_TYPE).optional().default(WALLET_TYPE.USER),
});

type CreateWalletSchema = z.infer<typeof createWalletSchema>;

@Controller()
export class CreateWalletController {
  constructor(private readonly createWalletService: CreateWalletService) {}
  @Post('/wallets')
  async handle(
    @Body(new ZodValidationPipe(createWalletSchema)) body: CreateWalletSchema,
  ) {
    const { fullName, email, password, cpfCnpj, walletType } = body;

    await this.createWalletService.execute({
      fullName,
      email,
      password,
      cpfCnpj,
      walletType,
    });
  }
}
