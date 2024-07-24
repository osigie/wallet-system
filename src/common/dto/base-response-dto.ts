import { HttpStatus } from '@nestjs/common';

export class BaseResponseDto<T> {
  message: string;
  statusCode: number;
  data?: T;

  constructor(
    message: string = 'Success',
    statusCode: number = HttpStatus.OK,
    data?: T,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    if (data) {
      this.data = data;
    }
  }
}
