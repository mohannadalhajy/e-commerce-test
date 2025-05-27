/* eslint-disable prettier/prettier */
import { HttpException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class MyError {
  @ApiProperty({ type: Number })
  server_code: number;

  constructor(server_code: number) {
    this.server_code = server_code;
  }
}

export class ServerError extends HttpException {
  @ApiProperty({ type: Number })
  statusCode: number;
  @ApiProperty({ type: String })
  message: string;
  @ApiProperty({ type: MyError })
  error: MyError;
  @ApiProperty({ type: Object })
  validation_errors?: any;
  constructor(
    status_code: number,
    message: any,
    server_code = 0,
    validation_errors: any = {},
  ) {
    super(
      {
        statusCode: status_code,
        message,
        error: new MyError(server_code),
        validation_errors,
      },
      status_code,
    );
  }
}

export class ServerResponse {
  @ApiProperty({ type: Number })
  statusCode: number;

  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ type: Object })
  data: any;

  constructor(status_code: number, message: string, data: any) {
    this.statusCode = status_code;
    this.message = message;
    this.data = data;
  }
}

export class GlobalBooleanResultResponse {
  @ApiProperty({ type: Boolean })
  result: boolean;

  constructor(result: boolean) {
    this.result = result;
  }
}
