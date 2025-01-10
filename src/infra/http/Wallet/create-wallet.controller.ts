import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { CreateWalletService } from './create-wallet.service';
import { CreateWalletDTO, CreateWalletSchema, createWalletSchema } from './types/wallet-schemas';

@Controller('/wallets')
export class CreateWalletController {
  constructor(private readonly createWalletService: CreateWalletService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Wallet')
  @ApiOperation({
    summary: 'Create a new wallet account',
  })
  @ApiBody({ type: CreateWalletDTO })
  @ApiCreatedResponse({ description: 'Resource created' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  async handle(
    @Body(new ZodValidationPipe(createWalletSchema))
    body: CreateWalletSchema,
  ) {
    const { fullName, email, password, cpf, cnpj, balance } = body;

    await this.createWalletService.execute({
      fullName,
      email,
      password,
      cpf,
      cnpj,
      balance,
    });
  }
}
