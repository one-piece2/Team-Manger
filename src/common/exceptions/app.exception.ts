//自定义异常

import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeType } from '../constants/error-code.constant';

export class AppException extends HttpException {
  
  //公开出去的
  public errorCode?: ErrorCodeType;

  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeType,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode,
      },
      statusCode,
    );
    this.errorCode = errorCode;
  }
}

export class BadRequestException extends AppException {
  constructor(message = 'Bad Request', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.BAD_REQUEST, errorCode || 'VALIDATION_ERROR');
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Unauthorized Access', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.UNAUTHORIZED, errorCode || 'ACCESS_UNAUTHORIZED');
  }
}

export class ForbiddenException extends AppException {
  constructor(message = 'Forbidden', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.FORBIDDEN, errorCode || 'ACCESS_UNAUTHORIZED');
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Resource not found', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.NOT_FOUND, errorCode || 'RESOURCE_NOT_FOUND');
  }
}

export class ConflictException extends AppException {
  constructor(message = 'Conflict', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.CONFLICT, errorCode);
  }
}

export class InternalServerException extends AppException {
  constructor(message = 'Internal Server Error', errorCode?: ErrorCodeType) {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR, errorCode || 'INTERNAL_SERVER_ERROR');
  }
}
