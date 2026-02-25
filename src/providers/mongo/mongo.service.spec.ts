import { Test, TestingModule } from '@nestjs/testing';

import { LOGGER_CONFIG } from '../../config';
import { Log } from './log.scheme';
import { MockFactory } from 'mockingbird';
import { MongoConfigFixture } from '../../../test/fixtures';
import { MongoService } from './mongo.service';
import { getModelToken } from '@nestjs/mongoose';

describe('MongoService', () => {
  let service: MongoService;
  const mockInsertOne = jest.fn();

  beforeEach(async () => {
    const mongoConfig = MockFactory(MongoConfigFixture).one();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoService,
        {
          provide: LOGGER_CONFIG,
          useValue: mongoConfig,
        },
        {
          provide: getModelToken(Log.name),
          useValue: {
            insertOne: mockInsertOne,
          },
        },
      ],
    }).compile();

    service = module.get<MongoService>(MongoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockInsertOne.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('serviceName', () => {
    it('should not include serviceName when serviceName is undefined', () => {
      service.log('Test log message');

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.not.objectContaining({
          serviceName: expect.anything() as string,
        }),
      );
    });

    it('should include serviceName when serviceName is defined', () => {
      const loggerConfig = MockFactory(MongoConfigFixture).one();
      loggerConfig.serviceName = 'TestService';

      const modulePromise = Test.createTestingModule({
        providers: [
          MongoService,
          { provide: LOGGER_CONFIG, useValue: loggerConfig },
          {
            provide: getModelToken(Log.name),
            useValue: { insertOne: mockInsertOne },
          },
        ],
      }).compile();

      return modulePromise.then((module) => {
        const svc = module.get<MongoService>(MongoService);
        svc.log('Test log message');

        expect(mockInsertOne).toHaveBeenCalledWith(
          expect.objectContaining({
            serviceName: loggerConfig.serviceName,
            message: 'Test log message',
          }),
        );
      });
    });
  });

  describe('Log Levels', () => {
    it('doDebug: should insert a log with level DEBUG', () => {
      const message = 'debug message';
      const context = 'DebugContext';

      service.doDebug(message, context);

      expect(mockInsertOne).toHaveBeenCalledWith({
        timestamp: expect.any(Date) as Date,
        level: 'DEBUG',
        message: message,
        context: context as string,
      });
    });

    it('doLog: should insert a log with level LOG', () => {
      const message = 'log message';
      const context = 'LogContext';

      service.doLog(message, context);

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'LOG',
          message: message,
          context: context,
        }),
      );
    });

    it('doVerbose: should insert a log with level VERBOSE', () => {
      service.doVerbose('verbose msg');

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'VERBOSE',
          message: 'verbose msg',
        }),
      );
    });

    it('doWarn: should insert a log with level WARN', () => {
      service.doWarn('warn msg');

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'WARN',
          message: 'warn msg',
        }),
      );
    });
  });

  describe('Error Log Levels (with Stack)', () => {
    it('doError: should insert a log with level ERROR and stack trace', () => {
      const message = 'error message';
      const stack = 'Error stack trace...';
      const context = 'ErrorContext';

      service.doError(message, stack, context);

      expect(mockInsertOne).toHaveBeenCalledWith({
        timestamp: expect.any(Date) as Date,
        level: 'ERROR',
        message: message,
        context: context,
        stack: stack,
      });
    });

    it('doFatal: should insert a log with level FATAL and stack trace', () => {
      const message = 'fatal error';
      const stack = 'Fatal stack...';

      service.doFatal(message, stack);

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'FATAL',
          message: message,
          stack: stack,
        }),
      );
    });
  });

  describe('insertLog (Private Method Logic)', () => {
    it('should catch errors if insertOne fails', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Database connection failed');
      mockInsertOne.mockRejectedValueOnce(error);

      service.doLog('test message');

      await new Promise((resolve) => setImmediate(resolve));

      expect(mockInsertOne).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
    });
  });

  describe('doHandleOldLogCleanupAsync', () => {
    let cleanupService: MongoService;
    const mockDeleteMany = jest.fn();
    const retentionDays = 7;

    beforeEach(async () => {
      const mongoConfig = MockFactory(MongoConfigFixture).one();
      mongoConfig.retentionDays = retentionDays;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MongoService,
          {
            provide: LOGGER_CONFIG,
            useValue: mongoConfig,
          },
          {
            provide: getModelToken(Log.name),
            useValue: {
              insertOne: mockInsertOne,
              deleteMany: mockDeleteMany,
            },
          },
        ],
      }).compile();

      cleanupService = module.get<MongoService>(MongoService);
    });

    afterEach(() => {
      mockDeleteMany.mockClear();
    });

    it('should call deleteMany with cutoff date', async () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      mockDeleteMany.mockResolvedValueOnce({ deletedCount: 5 });

      await cleanupService.doHandleOldLogCleanupAsync();

      const expectedCutoffDate = new Date(
        now - retentionDays * 24 * 60 * 60 * 1000,
      );

      expect(mockDeleteMany).toHaveBeenCalledWith({
        timestamp: { $lt: expectedCutoffDate },
      });

      jest.restoreAllMocks();
    });

    it('should catch errors if deleteMany fails', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Database connection failed');
      mockDeleteMany.mockRejectedValueOnce(error);

      await cleanupService.doHandleOldLogCleanupAsync();

      expect(mockDeleteMany).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
    });
  });
});
