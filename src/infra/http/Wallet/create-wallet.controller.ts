import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { CreateWalletService } from './create-wallet.service';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateWalletDTO,
  CreateWalletSchema,
  createWalletSchema,
} from './types/wallet-schemas';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { InvalidIdentifierError } from '@/domain/application/use-cases/errors/invalid-identifier-error';
import { WalletAccountExistsError } from '@/domain/application/use-cases/errors/wallet-account-exists-error';
import { EmailAlreadyExistsError } from '@/domain/application/use-cases/errors/email-already-exists-error';

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

    try {
      await this.createWalletService.execute({
        fullName,
        email,
        password,
        cpf,
        cnpj,
        balance,
      });
    } catch (err: any) {
      this.handleControllerError(err);
    }
  }

  private handleControllerError(err: {
    constructor: any;
    message: string | Record<string, any>;
  }) {
    switch (err.constructor) {
      case InvalidIdentifierError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case WalletAccountExistsError:
        throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
      case EmailAlreadyExistsError:
        throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
      default:
        throw new InternalServerErrorException(
          err.message ?? 'Something went wrong on Server',
        );
    }
  }
}
