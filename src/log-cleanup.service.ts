import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { LOGGER_CONFIG, LoggerConfig } from './config';
import { LoggerService } from './logger.service';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class LogCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly enabledLogger: boolean;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject(LOGGER_CONFIG) private readonly loggerConfig: LoggerConfig,
    private readonly loggerService: LoggerService,
  ) {
    this.enabledLogger =
      this.loggerConfig.enabled === undefined || this.loggerConfig.enabled;
  }

  onModuleInit(): void {
    if (!this.shouldRunCleanup()) return;

    void this.handleOldLogCleanup();
    this.intervalId = setInterval(
      () => void this.handleOldLogCleanup(),
      ONE_DAY_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async handleOldLogCleanup(): Promise<void> {
    if (!this.shouldRunCleanup()) return;

    const cutoffDate = new Date(
      Date.now() - this.loggerConfig.retentionDays! * ONE_DAY_MS,
    );
    await this.loggerService.handleOldLogCleanupAsync(cutoffDate);
  }

  private shouldRunCleanup(): boolean {
    return (
      this.enabledLogger &&
      this.loggerConfig?.retentionDays !== undefined &&
      this.loggerConfig?.retentionDays > 0
    );
  }
}
