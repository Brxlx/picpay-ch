import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

import { EmailAlreadyExistsError } from '@/domain/application/use-cases/errors/email-already-exists-error';
import { InsuficientBalanceError } from '@/domain/application/use-cases/errors/insuficient-balance-error';
import { InvalidIdentifierError } from '@/domain/application/use-cases/errors/invalid-identifier-error';
import { InvalidUserTypeOnTranferError } from '@/domain/application/use-cases/errors/invalid-user-type-on-transfer-error';
import { SamePayerAndPayeeIdError } from '@/domain/application/use-cases/errors/same-payer-and-payee-id-error';
import { TransactionNotAuthorizedError } from '@/domain/application/use-cases/errors/transaction-not-authorized-error';
import { UserOnTransactionNotFoundError } from '@/domain/application/use-cases/errors/user-on-transacton-not-found-error';
import { WalletAccountExistsError } from '@/domain/application/use-cases/errors/wallet-account-exists-error';
import { ProduceMessageError } from '@/infra/queue/errors/produce-message-error';

// Interface para representar a estrutura da resposta de erro HTTP
interface HttpErrorResponse {
  statusCode: number;
  message: string | string[];
  errors?: Record<string, string[]>;
  timestamp: string;
}

// Interface para representar a estrutura da resposta do NestJS para exceções HTTP
interface NestHttpExceptionResponse {
  message: string | string[];
  errors?: Record<string, string[]>;
}

@Catch(Error)
export class UseCaseErrorFilter implements ExceptionFilter {
  // Map errors names to status codes
  private errorToStatusCode = new Map<string, HttpStatus>([
    [SamePayerAndPayeeIdError.name, HttpStatus.BAD_REQUEST],
    [InsuficientBalanceError.name, HttpStatus.BAD_REQUEST],
    [TransactionNotAuthorizedError.name, HttpStatus.BAD_REQUEST],
    [UserOnTransactionNotFoundError.name, HttpStatus.BAD_REQUEST],
    [InvalidUserTypeOnTranferError.name, HttpStatus.BAD_REQUEST],
    [ProduceMessageError.name, HttpStatus.PRECONDITION_FAILED],
    [WalletAccountExistsError.name, HttpStatus.BAD_REQUEST],
    [EmailAlreadyExistsError.name, HttpStatus.BAD_GATEWAY],
    [InvalidIdentifierError.name, HttpStatus.BAD_REQUEST],
  ]);

  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (error instanceof HttpException) {
      const errorResponse = error.getResponse() as NestHttpExceptionResponse;

      const httpErrorResponse: HttpErrorResponse = {
        statusCode: error.getStatus(),
        message: errorResponse.message || error.message || 'Something went wrong on Server',
        errors: errorResponse.errors,
        timestamp: new Date().toISOString(),
      };

      response.status(error.getStatus()).json(httpErrorResponse);
      return;
    }

    const status =
      this.errorToStatusCode.get(error.constructor.name) || HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
