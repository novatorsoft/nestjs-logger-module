import { DynamicModule, Module } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerAsyncConfig, LoggerConfigType } from './config';

import { ConsoleService } from './providers';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';

@Module({})
export class LoggerModule {
  static register(config: LoggerConfigType): DynamicModule {
    const loggerModuleConfig = LoggerModule.getLoggerProviderModuleConfig(
      config?.provider,
    );
    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      providers: [
        loggerModuleConfig.service,
        {
          provide: LOGGER_CONFIG,
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
    );
    return {
      module: LoggerModule,
      global: config?.isGlobal ?? false,
      imports: config.imports,
      providers: [
        loggerModuleConfig.service,
        {
          provide: LOGGER_CONFIG,
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

  private static getLoggerProviderModuleConfig(provider: LoggerProvider) {
    const loggerModuleConfigs = {
      [LoggerProvider.CONSOLE]: {
        service: ConsoleService,
      },
    };

    const loggerModuleConfig = loggerModuleConfigs[provider];
    if (!loggerModuleConfig) throw new Error('Invalid logger provider');

    return loggerModuleConfig;
  }
}
