import { Injectable, Logger } from '@nestjs/common';

import { LoggerService } from '../../logger.service';

@Injectable()
export class ConsoleService extends LoggerService {
  debug(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.debug(message);
  }

  log(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.log(message);
  }

  error(message: any, stack?: string, context?: string): void {
    const logger = this.getLogger(!context && stack ? stack : context);
    logger.error(message, stack, context);
  }

  fatal(message: any, stack?: string, context?: string): void {
    const logger = this.getLogger(!context && stack ? stack : context);
    logger.fatal(message, stack, context);
  }

  verbose(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.verbose(message);
  }

  warn(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.warn(message);
  }

  private getLogger(context?: string): Logger {
    return new Logger(context ?? 'LoggerService');
  }
}
