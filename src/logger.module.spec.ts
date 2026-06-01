import { ConsoleConfig, MongoConfig } from './providers';
import {
  ConsoleConfigFixture,
  FileConfigFixture,
  MongoConfigFixture,
} from './../test/fixtures';
import { DynamicModule, FactoryProvider } from '@nestjs/common';
import { Log, LogSchema } from './providers/mongo/log.scheme';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';

import { Connection } from 'mongoose';
import { LOGGER_CONFIG } from './config';
import { LoggerModule } from './logger.module';
import { LoggerProvider } from './enum';
import { LoggerService } from './logger.service';
import { MockFactory } from 'mockingbird';
import { Test } from '@nestjs/testing';

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

function getLogModelProvider(dynamicModule: DynamicModule): FactoryProvider {
  const provider = dynamicModule.providers?.find(
    (p): p is FactoryProvider =>
      typeof p === 'object' &&
      p !== null &&
      'provide' in p &&
      p.provide === getModelToken(Log.name),
  );

  if (!provider || !('useFactory' in provider)) {
    throw new Error('Log model provider not found');
  }

  return provider;
}

interface MockLogModel {
  insertOne: jest.Mock;
}

function createMockConnection(): {
  connection: Connection;
  model: jest.Mock<MockLogModel, unknown[]>;
  mockLogModel: MockLogModel;
} {
  const mockLogModel: MockLogModel = { insertOne: jest.fn() };
  const model = jest
    .fn<MockLogModel, unknown[]>()
    .mockReturnValue(mockLogModel);

  return {
    connection: { model } as unknown as Connection,
    model,
    mockLogModel,
  };
}

function runLogModelFactory(
  provider: FactoryProvider,
  connection: Connection,
  config: MongoConfig,
): void {
  if (!provider.useFactory) {
    throw new Error('useFactory is not defined');
  }

  provider.useFactory(connection, config);
}

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
    describe('Log model provider', () => {
      const registerMongoModule = (mongoConfig: MongoConfig) =>
        LoggerModule.register(mongoConfig);

      const registerMongoModuleAsync = (mongoConfig: MongoConfig) =>
        LoggerModule.registerAsync({
          provider: LoggerProvider.MONGODB,
          useFactory: () => mongoConfig,
          inject: [],
        });

      it.each([
        ['register', registerMongoModule],
        ['registerAsync', registerMongoModuleAsync],
      ])(
        'should inject connection and LOGGER_CONFIG (%s)',
        (_, registerModule) => {
          const mongoConfig = MockFactory(MongoConfigFixture).one();
          const modelProvider = getLogModelProvider(
            registerModule(mongoConfig),
          );

          expect(modelProvider.inject).toEqual([
            getConnectionToken(),
            LOGGER_CONFIG,
          ]);
        },
      );

      it.each([
        ['register', registerMongoModule],
        ['registerAsync', registerMongoModuleAsync],
      ])(
        'should use schemaName as MongoDB collection (%s)',
        (_, registerModule) => {
          const schemaName = 'application_logs';
          const mongoConfig = MockFactory(MongoConfigFixture).one();
          mongoConfig.schemaName = schemaName;
          const {
            connection,
            model: modelMock,
            mockLogModel,
          } = createMockConnection();
          const modelProvider = getLogModelProvider(
            registerModule(mongoConfig),
          );

          runLogModelFactory(modelProvider, connection, mongoConfig);

          expect(modelMock).toHaveBeenCalledWith(
            Log.name,
            LogSchema,
            schemaName,
          );
          expect(modelMock).toHaveReturnedWith(mockLogModel);
        },
      );

      it.each([
        ['register', registerMongoModule],
        ['registerAsync', registerMongoModuleAsync],
      ])(
        'should default collection to "logger" when schemaName is omitted (%s)',
        (_, registerModule) => {
          const mongoConfig = MockFactory(MongoConfigFixture).one();
          delete mongoConfig.schemaName;
          const { connection, model: modelMock } = createMockConnection();
          const modelProvider = getLogModelProvider(
            registerModule(mongoConfig),
          );

          runLogModelFactory(modelProvider, connection, mongoConfig);

          expect(modelMock).toHaveBeenCalledWith(Log.name, LogSchema, 'logger');
        },
      );
    });

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
