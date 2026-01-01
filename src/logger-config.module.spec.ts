import { LOGGER_CONFIG, LoggerConfig, LoggerConfigType } from './config';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggerConfigFixture } from '../test/fixtures';
import { LoggerConfigModule } from './logger-config.module';
import { MockFactory } from 'mockingbird';

describe('LoggerConfigModule', () => {
  it('should return a DynamicModule with useValue provider', () => {
    const loggerConfig = MockFactory(LoggerConfigFixture).one();
    const dynamicModule = LoggerConfigModule.register(
      loggerConfig as LoggerConfigType,
    );

    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(LoggerConfigModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toBeDefined();
    expect(dynamicModule.providers?.length).toBe(1);
    expect(dynamicModule.providers?.[0]).toEqual({
      provide: LOGGER_CONFIG,
      useValue: loggerConfig,
    });
    expect(dynamicModule.exports).toContain(LOGGER_CONFIG);
  });

  it('should be usable in a testing module', async () => {
    const loggerConfig = MockFactory(LoggerConfigFixture).one();
    const dynamicModule = LoggerConfigModule.register(
      loggerConfig as LoggerConfigType,
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [dynamicModule],
    }).compile();

    const config = module.get<LoggerConfig>(LOGGER_CONFIG);
    expect(config).toBeDefined();
    expect(config).toEqual(loggerConfig);
  });

  it('should return a DynamicModule with useFactory provider', () => {
    const loggerConfig = MockFactory(LoggerConfigFixture).one();
    const asyncConfig = {
      provider: loggerConfig.provider,
      useFactory: () => loggerConfig,
      inject: [],
    };

    const dynamicModule = LoggerConfigModule.register(asyncConfig);

    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(LoggerConfigModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toBeDefined();
    expect(dynamicModule.providers?.length).toBe(1);
    expect(dynamicModule.providers?.[0]).toEqual({
      provide: LOGGER_CONFIG,
      useFactory: asyncConfig.useFactory,
      inject: [],
    });
    expect(dynamicModule.exports).toContain(LOGGER_CONFIG);
  });

  it('should be usable in a testing module with useFactory provider(inject is not provided)', () => {
    const loggerConfig = MockFactory(LoggerConfigFixture).one();
    const asyncConfig = {
      provider: loggerConfig.provider,
      useFactory: () => loggerConfig,
    };

    const dynamicModule = LoggerConfigModule.register(asyncConfig);

    expect(dynamicModule).toBeDefined();
    expect(dynamicModule.module).toBe(LoggerConfigModule);
    expect(dynamicModule.global).toBe(true);
    expect(dynamicModule.providers).toBeDefined();
    expect(dynamicModule.providers?.length).toBe(1);
    expect(dynamicModule.providers?.[0]).toEqual({
      provide: LOGGER_CONFIG,
      useFactory: asyncConfig.useFactory,
      inject: [],
    });
    expect(dynamicModule.exports).toContain(LOGGER_CONFIG);
  });
});
