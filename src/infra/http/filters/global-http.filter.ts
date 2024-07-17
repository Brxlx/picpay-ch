import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const errMessage = exception.response;

    response.status(status).json({
      statusCode: status,
      message: errMessage || 'An unexpected error occurred.',
      timestamp: new Date().toISOString(),
    });
  }
}
