import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno.';
    let error = 'Internal Server Error';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as
        | string
        | {
            message?: string | string[];
            error?: string;
            details?: unknown[];
          };

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = exceptionResponse.message ?? message;
        error = exceptionResponse.error ?? error;
        details = exceptionResponse.details ?? [];
      }
    }

    this.logger.error(`HTTP ${status} on ${request.method} ${request.url}`);

    response.status(status).json({
      statusCode: status,
      message,
      error,
      details,
    });
  }
}
