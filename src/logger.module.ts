import {
  ConsoleService,
  FileService,
  MongoConfig,
  MongoService,
} from './providers';
import { DynamicModule, Module } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerAsyncConfig, LoggerConfigType } from './config';
import { Log, LogSchema } from './providers/mongo/log.scheme';

import { LoggerConfigModule } from './logger-config.module';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class LoggerModule {
  static register(config: LoggerConfigType): DynamicModule {
    const loggerModuleConfig = LoggerModule.getLoggerProviderModuleConfig(
      config?.provider,
      config,
    );

    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      imports: [
        ...loggerModuleConfig.imports,
        LoggerConfigModule.register(config),
      ],
      providers: loggerModuleConfig.provider,
      exports: [LoggerService],
    };
  }

  static registerAsync(config: LoggerAsyncConfig): DynamicModule {
    const loggerModuleConfig = LoggerModule.getLoggerProviderModuleConfig(
      config?.provider,
      config,
    );

    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      imports: [
        ...(config.imports ?? []),
        ...loggerModuleConfig.imports,
        LoggerConfigModule.register(config),
      ],
      providers: loggerModuleConfig.provider,
      exports: [LoggerService],
    };
  }

  private static getLoggerProviderModuleConfig(
    provider: LoggerProvider,
    config: LoggerConfigType | LoggerAsyncConfig,
  ) {
    const loggerModuleConfigs = {
      [LoggerProvider.CONSOLE]: () =>
        LoggerModule.getConsoleProviderModuleConfig(),
      [LoggerProvider.FILE]: () => LoggerModule.getFileProviderModuleConfig(),
      [LoggerProvider.MONGODB]: () =>
        LoggerModule.getMongodbProviderModuleConfig(config),
    };

    const loggerModuleConfig = loggerModuleConfigs[provider];
    if (!loggerModuleConfig) throw new Error('Invalid logger provider');

    return loggerModuleConfig();
  }

  private static getMongodbProviderModuleConfig(
    config: LoggerConfigType | LoggerAsyncConfig,
  ) {
    const loggerConfigModule = LoggerConfigModule.register(config);
    return {
      provider: [
        {
          provide: LoggerService,
          useClass: MongoService,
        },
      ],
      imports: [
        loggerConfigModule,
        MongooseModule.forRootAsync({
          imports: [loggerConfigModule],
          useFactory: (loggerConfig: MongoConfig) => {
            return {
              uri: loggerConfig.uri,
            };
          },
          inject: [LOGGER_CONFIG],
        }),
        MongooseModule.forFeature([{ name: Log.name, schema: LogSchema }]),
      ],
    };
  }

  private static getFileProviderModuleConfig() {
    return {
      imports: [],
      provider: [
        {
          provide: LoggerService,
          useClass: FileService,
        },
      ],
    };
  }

  private static getConsoleProviderModuleConfig() {
    return {
      imports: [],
      provider: [
        {
          provide: LoggerService,
          useClass: ConsoleService,
        },
      ],
    };
  }
}
