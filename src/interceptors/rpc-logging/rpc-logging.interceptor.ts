import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';

import { LoggerService } from '../../logger.service';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'rpc') return next.handle();

    const rpcData = context
      .switchToRpc()
      .getData<{ pattern: string; data: unknown }>();
    const controllerContext = context.getClass().name;
    const message = {
      pattern: rpcData.pattern,
      requestData: rpcData?.data ?? null,
      requestType: 'rpc-request',
    };

    return next.handle().pipe(
      tap((responseData: unknown) => {
        this.logger.log(
          {
            ...message,
            responseData: responseData ?? {},
          },
          controllerContext,
        );
      }),
      catchError((error: HttpException | Error) => {
        this.logger.error(
          {
            ...message,
            error: error.message,
            responseData: null,
          },
          error?.stack ?? '',
          controllerContext,
        );
        throw error;
      }),
    );
  }
}
