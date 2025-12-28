import { ConsoleService, FileService, MockService } from './providers';
import { DynamicModule, Module } from '@nestjs/common';
import { LoggerAsyncConfig, LoggerConfigType } from './config';

import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';

@Module({})
export class LoggerModule {
  static register(config: LoggerConfigType): DynamicModule {
    const loggerModuleConfig = LoggerModule.getLoggerProviderModuleConfig(
      config?.provider,
      config?.enabled,
    );
    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      providers: [
        loggerModuleConfig.service,
        {
          provide: 'LOGGER_CONFIG',
          useValue: config,
        },
        {
          provide: LoggerService,
          useClass: loggerModuleConfig.service,
        },
      ],
      exports: [LoggerService],
    };
  }

  static registerAsync(config: LoggerAsyncConfig): DynamicModule {
    const loggerModuleConfig = LoggerModule.getLoggerProviderModuleConfig(
      config?.provider,
      config?.enabled,
    );
    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      imports: config.imports,
      providers: [
        loggerModuleConfig.service,
        {
          provide: 'LOGGER_CONFIG',
          useFactory: config.useFactory,
          inject: config.inject,
        },
        {
          provide: LoggerService,
          useClass: loggerModuleConfig.service,
        },
      ],
      exports: [LoggerService],
    };
  }

  private static getLoggerProviderModuleConfig(
    provider: LoggerProvider,
    enabled?: boolean,
  ) {
    const loggerModuleConfigs = {
      [LoggerProvider.CONSOLE]: {
        service: ConsoleService,
      },
      [LoggerProvider.FILE]: {
        service: FileService,
      },
    };

    const loggerModuleConfig = loggerModuleConfigs[provider];
    if (!loggerModuleConfig) throw new Error('Invalid logger provider');

    if (!enabled)
      return {
        service: MockService,
      };

    return loggerModuleConfig;
  }
}
