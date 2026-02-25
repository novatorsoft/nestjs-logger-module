import { Injectable, Logger } from '@nestjs/common';

import { LoggerService } from '../../logger.service';

@Injectable()
export class ConsoleService extends LoggerService {
  doDebug(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.debug(message);
  }

  doLog(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.log(message);
  }

  doError(message: any, stack?: string, context?: string): void {
    const logger = this.getLogger(!context && stack ? stack : context);
    logger.error(message, stack, context);
  }

  doFatal(message: any, stack?: string, context?: string): void {
    const logger = this.getLogger(!context && stack ? stack : context);
    logger.fatal(message, stack, context);
  }

  doVerbose(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.verbose(message);
  }

  doWarn(message: any, context?: string): void {
    const logger = this.getLogger(context);
    logger.warn(message);
  }

  protected doHandleOldLogCleanupAsync(): Promise<void> {
    return Promise.resolve();
  }

  private getLogger(context?: string): Logger {
    return new Logger(context ?? 'LoggerService');
  }
}
