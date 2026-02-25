import * as fs from 'node:fs';
import * as path from 'node:path';

import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger.service';
import { LOGGER_CONFIG } from '../../config';
import { FileConfig } from './file.config';

@Injectable()
export class FileService extends LoggerService {
  private readonly logsDir = path.join(process.cwd(), 'logs');

  constructor(@Inject(LOGGER_CONFIG) private readonly fileConfig: FileConfig) {
    super(fileConfig);
    this.ensureLogsDirectory();
  }

  doDebug(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('DEBUG', message, context);
    this.writeToFile(logMessage);
  }

  doLog(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('LOG', message, context);
    this.writeToFile(logMessage);
  }

  doError(message: any, stack?: string, context?: string): void {
    const logMessage = this.formatLogMessage('ERROR', message, context, stack);
    this.writeToFile(logMessage);
  }

  doFatal(message: any, stack?: string, context?: string): void {
    const logMessage = this.formatLogMessage('FATAL', message, context, stack);
    this.writeToFile(logMessage);
  }

  doVerbose(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('VERBOSE', message, context);
    this.writeToFile(logMessage);
  }

  doWarn(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('WARN', message, context);
    this.writeToFile(logMessage);
  }

  protected doHandleOldLogCleanupAsync(): Promise<void> {
    try {
      const cutoffDate = this.getCutoffDate();
      const files = fs.readdirSync(this.logsDir);
      const logFilePattern = /^log-(\d{4})-(\d{2})-(\d{2})\.log$/;

      for (const file of files) {
        const match = logFilePattern.exec(file);
        if (!match) continue;

        const fileDate = new Date(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
        );

        if (fileDate < cutoffDate) fs.unlinkSync(path.join(this.logsDir, file));
      }
    } catch (error) {
      console.error(error);
    }
    return Promise.resolve();
  }

  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFileName(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `log-${year}-${month}-${day}.log`;
  }

  private getLogFilePath(): string {
    return path.join(this.logsDir, this.getLogFileName());
  }

  private formatLogMessage(
    level: string,
    message: any,
    context?: string,
    stack?: string,
  ): string {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message: message as unknown,
      ...(this.fileConfig.serviceName && {
        serviceName: this.fileConfig.serviceName,
      }),
      ...(context && { context }),
      ...(stack && { stack }),
    };

    return JSON.stringify(logEntry) + '\n';
  }

  private writeToFile(content: string): void {
    const filePath = this.getLogFilePath();
    fs.appendFileSync(filePath, content, 'utf8');
  }
}
