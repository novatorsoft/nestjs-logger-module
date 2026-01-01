import {
  ConsoleConfigFixture,
  FileConfigFixture,
  MongoConfigFixture,
} from './../test/fixtures';

import { ConsoleConfig } from './providers';
import { Log } from './providers/mongo/log.scheme';
import { LoggerModule } from './logger.module';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';
import { MockFactory } from 'mockingbird';
import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

jest.mock('@nestjs/mongoose', () => {
  const actual =
    jest.requireActual<typeof import('@nestjs/mongoose')>('@nestjs/mongoose');
  const mockLogModel = {
    insertOne: jest.fn(),
  };
  return {
    ...actual,
    MongooseModule: {
      ...actual.MongooseModule,
      forRootAsync: jest.fn(() => ({
        module: class MockMongooseRootModule {},
        global: false,
      })),
      forFeature: jest.fn(() => ({
        module: class MockMongooseFeatureModule {},
        providers: [
          {
            provide: getModelToken('Log'),
            useValue: mockLogModel,
          },
        ],
        exports: [getModelToken('Log')],
      })),
    },
  };
});

describe('LoggerModule', () => {
  describe('Console Provider', () => {
    describe('Register', () => {
      it('Logger Service should be defined (with console provider)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(consoleConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
    describe('RegisterAsync', () => {
      it('Logger Service should be defined (with console provider)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: consoleConfig.provider,
              useFactory: () => consoleConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
  });

  describe('File Provider', () => {
    describe('Register', () => {
      it('Logger Service should be defined (with file provider)', async () => {
        const fileConfig = MockFactory(FileConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(fileConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
    describe('RegisterAsync', () => {
      it('Logger Service should be defined (with file provider)', async () => {
        const fileConfig = MockFactory(FileConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: fileConfig.provider,
              useFactory: () => fileConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
  });

  describe('MongoDB Provider', () => {
    describe('Register', () => {
      it('Logger Service should be defined (with mongo provider)', async () => {
        const mongoConfig = MockFactory(MongoConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(mongoConfig)],
        })
          .overrideProvider(getModelToken(Log.name))
          .useValue({
            insertOne: jest.fn(),
          })
          .compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
    describe('RegisterAsync', () => {
      it('Logger Service should be defined (with mongo provider)', async () => {
        const mongoConfig = MockFactory(MongoConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: LoggerProvider.MONGODB,
              isGlobal: false,
              useFactory: () => mongoConfig,
              inject: [],
            }),
          ],
        })
          .overrideProvider(getModelToken(Log.name))
          .useValue({
            insertOne: jest.fn(),
          })
          .compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
  });

  describe('Global', () => {
    describe('Register', () => {
      it('Logger Service should be defined (with console provider, global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(consoleConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with console provider, not global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture)
          .mutate({
            isGlobal: false,
          })
          .one();

        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(consoleConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with console provider, default global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        delete consoleConfig.isGlobal;
        const module = await Test.createTestingModule({
          imports: [LoggerModule.register(consoleConfig)],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
    describe('RegisterAsync', () => {
      it('Logger Service should be defined (with console provider, global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: consoleConfig.provider,
              isGlobal: true,
              useFactory: () => consoleConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with console provider, not global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture)
          .mutate({
            isGlobal: false,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: consoleConfig.provider,
              isGlobal: false,
              useFactory: () => consoleConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });

      it('Logger Service should be defined (with console provider, default global)', async () => {
        const consoleConfig = MockFactory(ConsoleConfigFixture).one();
        delete consoleConfig.isGlobal;
        const module = await Test.createTestingModule({
          imports: [
            LoggerModule.registerAsync({
              provider: consoleConfig.provider,
              useFactory: () => consoleConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<LoggerService>(LoggerService);
        expect(service).toBeDefined();
      });
    });
  });

  describe('Invalid Provider Error Handling', () => {
    it('should throw an error when given an invalid provider', () => {
      expect(() => {
        LoggerModule.register({
          provider: 'invalid' as LoggerProvider,
        } as ConsoleConfig);
      }).toThrow('Invalid logger provider');
    });
  });
});
