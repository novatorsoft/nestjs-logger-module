import { ConsoleConfig } from './providers';
import { LoggerModule } from './logger.module';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';
import { Test } from '@nestjs/testing';

describe('LoggerModule', () => {
  describe('Logger Provider', () => {
    describe('register', () => {
      it('Logger Service should be defined', async () => {
        const loggerConfig = new ConsoleConfig();
        loggerConfig.provider = LoggerProvider.CONSOLE;

        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(loggerConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (global defined)', async () => {
        const loggerConfig = new ConsoleConfig();
        loggerConfig.provider = LoggerProvider.CONSOLE;
        loggerConfig.isGlobal = true;

        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(loggerConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });

    describe('registerAsync', () => {
      it('Logger Service should be defined', async () => {
        const loggerConfig = new ConsoleConfig();
        loggerConfig.provider = LoggerProvider.CONSOLE;

        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: loggerConfig.provider,
              isGlobal: false,
              useFactory: () => loggerConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with default global config)', async () => {
        const loggerConfig = new ConsoleConfig();
        loggerConfig.provider = LoggerProvider.CONSOLE;

        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: loggerConfig.provider,
              useFactory: () => loggerConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (global defined)', async () => {
        const loggerConfig = new ConsoleConfig();
        loggerConfig.provider = LoggerProvider.CONSOLE;

        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: loggerConfig.provider,
              isGlobal: true,
              useFactory: () => loggerConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
  });

  it('should throw an error when given an invalid provider', () => {
    expect(() => {
      LoggerModule.register({
        provider: 'invalid' as LoggerProvider,
      } as ConsoleConfig);
    }).toThrow('Invalid logger provider');
  });
});
