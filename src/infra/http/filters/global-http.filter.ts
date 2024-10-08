import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    let errMessage = exception.response;
    let errors = undefined;

    if (
      typeof exception.response === 'object' &&
      exception.response.message === 'Error validating input fields'
    ) {
      errMessage = exception.response.message;
      errors = exception.response.errors;
    }
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    response.status(status).json({
      statusCode: status,
      message: errMessage || 'An unexpected error occurred.',
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
