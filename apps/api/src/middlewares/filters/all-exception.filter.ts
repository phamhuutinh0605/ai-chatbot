import { Request, Response } from 'express';
import { ErrorCode } from '../../enums/error-code.enum';

import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';

import { ErrorException } from '../exception/error.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  private printErrorLog(exception: any, request: Request) {
    this.logger.error('==================ERROR:===============');
    this.logger.error(exception);
    this.logger.error(`------------------IP------------------`);
    this.logger.error(request.ip);
    this.logger.error(`------------------BODY------------------: `);
    this.logger.error(request.body || 'EMPTY');
    this.logger.error(`------------------PARAMS------------------: `);
    this.logger.error(request.params || 'EMPTY');
    this.logger.error(`------------------URL------------------: `);
    this.logger.error(`${request.method} ${request.url}`);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    this.printErrorLog(exception, request);

    let errorException: ErrorException;
    let httpStatusCode: number;

    if (exception instanceof ErrorException) {
      errorException = exception;
      httpStatusCode = exception.httpStatusCode;
    } else {
      if (exception.response?.statusCode === 400) {
        const errorMessage = Array.isArray(exception.response.message)
          ? exception.response.message.join(', ')
          : exception.message ||
            exception.response.message ||
            'Validation error';

        errorException = new ErrorException(
          ErrorCode.VALIDATION_ERROR,
          errorMessage,
          'Validation failed',
        );
        httpStatusCode = 400;
      } else {
        errorException = new ErrorException(
          ErrorCode.UNDEFINED_ERROR,
          exception.message ??
            exception.response?.message ??
            exception.response?.error ??
            'Undefined Error',
          exception.message,
        );
        httpStatusCode = exception.status ?? errorException.httpStatusCode;
      }
    }

    response.status(httpStatusCode).json(errorException.getErrors());
  }
}
