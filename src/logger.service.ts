import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerConfig } from './config';

@Injectable()
export abstract class LoggerService {
  private readonly enabledLogger: boolean;
  constructor(
    @Inject(LOGGER_CONFIG) private readonly loggerConfig: LoggerConfig,
  ) {
    this.enabledLogger =
      this.loggerConfig.enabled === undefined || this.loggerConfig.enabled;
  }

  debug(message: any, context?: string): void {
    if (this.enabledLogger) this.doDebug(message, context);
  }

  log(message: any, context?: string): void {
    if (this.enabledLogger) this.doLog(message, context);
  }

  error(message: any, stack?: string, context?: string): void {
    if (this.enabledLogger) this.doError(message, stack, context);
  }

  fatal(message: any, stack?: string, context?: string): void {
    if (this.enabledLogger) this.doFatal(message, stack, context);
  }

  verbose(message: any, context?: string): void {
    if (this.enabledLogger) this.doVerbose(message, context);
  }

  warn(message: any, context?: string): void {
    if (this.enabledLogger) this.doWarn(message, context);
  }

  protected abstract doDebug(message: any, context?: string): void;
  protected abstract doLog(message: any, context?: string): void;
  protected abstract doError(message: any, context?: string): void;
  protected abstract doError(
    message: any,
    stack?: string,
    context?: string,
  ): void;
  protected abstract doFatal(message: any, context?: string): void;
  protected abstract doFatal(
    message: any,
    stack?: string,
    context?: string,
  ): void;
  protected abstract doVerbose(message: any, context?: string): void;
  protected abstract doWarn(message: any, context?: string): void;
}
