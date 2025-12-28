import { ConsoleConfig, MockService } from './providers';

import { LoggerModule } from './logger.module';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';
import { Test } from '@nestjs/testing';

describe('LoggerModule', () => {
  describe('Logger Provider', () => {
    describe('register', () => {
      it('Logger Service should be defined', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.register({
              provider: LoggerProvider.CONSOLE,
              enabled: true,
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (global defined)', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.register({
              provider: LoggerProvider.CONSOLE,
              isGlobal: true,
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('should use MockService when enabled is false', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.register({
              provider: LoggerProvider.CONSOLE,
              enabled: false,
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(MockService);
      });
    });

    describe('registerAsync', () => {
      it('Logger Service should be defined', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: LoggerProvider.CONSOLE,
              isGlobal: false,
              useFactory: () => ({}),
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with default global config)', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: LoggerProvider.CONSOLE,
              useFactory: () => ({}),
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (global defined)', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: LoggerProvider.CONSOLE,
              isGlobal: true,
              useFactory: () => ({}),
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('should use MockService when enabled is false (async)', async () => {
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: LoggerProvider.CONSOLE,
              enabled: false,
              useFactory: () => ({}),
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(MockService);
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
