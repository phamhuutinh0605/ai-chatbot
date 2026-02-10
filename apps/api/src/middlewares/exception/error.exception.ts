import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../enums/error-code.enum';

export class ErrorException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly message: string;
  public readonly details?: any;
  public readonly httpStatusCode: number;

  constructor(
    errorCode: ErrorCode,
    message: string,
    details?: any,
    httpStatusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    super(message, httpStatusCode);
    this.errorCode = errorCode;
    this.message = message;
    this.details = details;
    this.httpStatusCode = httpStatusCode;
  }

  getErrors() {
    return {
      errorCode: this.errorCode,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}
