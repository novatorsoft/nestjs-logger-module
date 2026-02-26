import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger.service';
import { LOGGER_CONFIG } from '../../config';
import { MongoConfig } from './mongo.config';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from './log.scheme';
import { Model } from 'mongoose';

@Injectable()
export class MongoService extends LoggerService {
  constructor(
    @Inject(LOGGER_CONFIG) private readonly mongoConfig: MongoConfig,
    @InjectModel(Log.name) private readonly logModel: Model<Log>,
  ) {
    super(mongoConfig);
  }

  doDebug(message: any, context?: string): void {
    void this.insertLog('DEBUG', message, context);
  }

  doLog(message: any, context?: string): void {
    void this.insertLog('LOG', message, context);
  }

  doError(message: any, stack?: string, context?: string): void {
    void this.insertLog('ERROR', message, context, stack);
  }

  doFatal(message: any, stack?: string, context?: string): void {
    void this.insertLog('FATAL', message, context, stack);
  }

  doVerbose(message: any, context?: string): void {
    void this.insertLog('VERBOSE', message, context);
  }

  doWarn(message: any, context?: string): void {
    void this.insertLog('WARN', message, context);
  }

  async handleOldLogCleanupAsync(cutoffDate: Date): Promise<void> {
    try {
      await this.logModel.deleteMany({
        timestamp: { $lt: cutoffDate },
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async insertLog(
    level: string,
    message: any,
    context?: string,
    stack?: string,
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        level,
        message: message as unknown,
        ...(this.mongoConfig.serviceName && {
          serviceName: this.mongoConfig.serviceName,
        }),
        ...(context && { context }),
        ...(stack && { stack }),
      };

      await this.logModel.insertOne(logEntry);
    } catch (error) {
      console.error(error);
    }
  }
}
