import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';

import { LoggerService } from '../../logger.service';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context
      .switchToHttp()
      .getResponse<Response & { statusCode: number }>();
    const controllerContext = context.getClass().name;
    const message = {
      method: request.method,
      url: request.url,
      requestBody: request?.body ?? {},
      requestHeaders: request?.headers ?? {},
    };

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        this.logger.log(
          {
            ...message,
            statusCode: response?.statusCode ?? HttpStatus.OK,
            responseBody: responseBody ?? {},
          },
          controllerContext,
        );
      }),
      catchError((error: HttpException | Error) => {
        const httpException = error instanceof HttpException ? error : null;
        this.logger.error(
          {
            ...message,
            statusCode:
              httpException?.getStatus() ?? HttpStatus.INTERNAL_SERVER_ERROR,
            responseBody: httpException?.getResponse() ?? {},
          },
          error?.stack ?? '',
          controllerContext,
        );
        throw error;
      }),
    );
  }
}
