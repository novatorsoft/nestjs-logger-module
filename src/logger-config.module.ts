import { DynamicModule, Module } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerAsyncConfig, LoggerConfigType } from './config';

@Module({})
export class LoggerConfigModule {
  static register(config: LoggerConfigType | LoggerAsyncConfig): DynamicModule {
    return {
      module: LoggerConfigModule,
      global: true,
      providers: [
        config && 'useFactory' in config
          ? {
              provide: LOGGER_CONFIG,
              useFactory: config.useFactory,
              inject: config.inject ?? [],
            }
          : {
              provide: LOGGER_CONFIG,
              useValue: config,
            },
      ],
      exports: [LOGGER_CONFIG],
    };
  }
}
