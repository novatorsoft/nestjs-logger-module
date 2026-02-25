import { Inject, Injectable } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerConfig } from './config';
import { Cron, CronExpression } from '@nestjs/schedule';

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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  protected async handleOldLogCleanupAsync(): Promise<void> {
    if (
      this.enabledLogger &&
      this.loggerConfig?.retentionDays !== undefined &&
      this.loggerConfig?.retentionDays > 0
    )
      await this.doHandleOldLogCleanupAsync();
  }

  protected getCutoffDate(): Date {
    if (
      !this.loggerConfig.retentionDays ||
      this.loggerConfig.retentionDays <= 0
    )
      throw new Error('Retention days must be greater than 0');

    return new Date(
      Date.now() - this.loggerConfig.retentionDays * 24 * 60 * 60 * 1000,
    );
  }

  protected abstract doHandleOldLogCleanupAsync(): Promise<void>;
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
