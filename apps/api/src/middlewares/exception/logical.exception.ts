import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../../enums/error-code.enum';
import { ErrorException } from './error.exception';

export class LogicalException extends ErrorException {
  constructor(
    errorCode: ErrorCode,
    message: string,
    details?: any,
    httpStatusCode: number = HttpStatus.BAD_REQUEST,
  ) {
    super(errorCode, message, details, httpStatusCode);
  }
}
