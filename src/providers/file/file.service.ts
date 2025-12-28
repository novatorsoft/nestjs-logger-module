import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger.service';

@Injectable()
export class FileService extends LoggerService {
  private readonly logsDir = path.join(process.cwd(), 'logs');

  constructor() {
    super();
    this.ensureLogsDirectory();
  }

  debug(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('DEBUG', message, context);
    this.writeToFile(logMessage);
  }

  log(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('LOG', message, context);
    this.writeToFile(logMessage);
  }

  error(message: any, stack?: string, context?: string): void {
    const logMessage = this.formatLogMessage('ERROR', message, context, stack);
    this.writeToFile(logMessage);
  }

  fatal(message: any, stack?: string, context?: string): void {
    const logMessage = this.formatLogMessage('FATAL', message, context, stack);
    this.writeToFile(logMessage);
  }

  verbose(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('VERBOSE', message, context);
    this.writeToFile(logMessage);
  }

  warn(message: any, context?: string): void {
    const logMessage = this.formatLogMessage('WARN', message, context);
    this.writeToFile(logMessage);
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
