import * as fs from 'node:fs';
import * as path from 'node:path';

import { Test, TestingModule } from '@nestjs/testing';

import { FileConfigFixture } from '../../../test/fixtures';
import { FileService } from './file.service';
import { LOGGER_CONFIG } from '../../config';
import { MockFactory } from 'mockingbird';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('FileService', () => {
  let service: FileService;
  const fsMock = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-28T10:00:00.000Z'));

    (fsMock.existsSync as jest.Mock).mockReset();
    (fsMock.mkdirSync as jest.Mock).mockReset();
    (fsMock.appendFileSync as jest.Mock).mockReset();
    (fsMock.readdirSync as jest.Mock).mockReset();
    (fsMock.unlinkSync as jest.Mock).mockReset();

    const loggerConfig = MockFactory(FileConfigFixture).one();

    (fsMock.existsSync as jest.Mock).mockReturnValue(false);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: LOGGER_CONFIG, useValue: loggerConfig },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor side effects', () => {
    it('should create logs directory if it does not exist', () => {
      expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
      expect(fsMock.mkdirSync).toHaveBeenCalledTimes(1);

      const expectedLogsDir = path.join(process.cwd(), 'logs');
      expect(fsMock.mkdirSync).toHaveBeenCalledWith(expectedLogsDir, {
        recursive: true,
      });
    });

    it('should not create logs directory if it already exists', async () => {
      (fsMock.mkdirSync as jest.Mock).mockReset();
      (fsMock.existsSync as jest.Mock).mockReturnValue(true);

      const loggerConfig = MockFactory(FileConfigFixture).one();
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FileService,
          { provide: LOGGER_CONFIG, useValue: loggerConfig },
        ],
      }).compile();

      const svc = module.get<FileService>(FileService);

      expect(svc).toBeDefined();
      expect(fsMock.mkdirSync).not.toHaveBeenCalled();
    });
  });

  function expectedLogFilePath() {
    const logsDir = path.join(process.cwd(), 'logs');
    return path.join(logsDir, 'log-2025-12-28.log');
  }

  function expectAppendCalledWithLevel(level: string) {
    expect(fsMock.appendFileSync).toHaveBeenCalledTimes(1);

    const [filePath, content, encoding] = (fsMock.appendFileSync as jest.Mock)
      .mock.calls[0] as [string, string, string];

    expect(filePath).toBe(expectedLogFilePath());
    expect(encoding).toBe('utf8');

    expect(typeof content).toBe('string');
    expect(content.endsWith('\n')).toBe(true);

    const parsed = JSON.parse(content.trim()) as {
      timestamp: string;
      level: string;
      message: string;
      context?: string;
      stack?: string;
    };
    expect(parsed).toMatchObject({
      timestamp: '2025-12-28T10:00:00.000Z',
      level,
    });
  }

  describe('serviceName', () => {
    it('should not include serviceName when serviceName is undefined', () => {
      service.log('Test log message');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
        serviceName?: string;
      };
      expect(parsed.serviceName).toBeUndefined();
    });

    it('should include serviceName when serviceName is defined', async () => {
      const loggerConfig = MockFactory(FileConfigFixture).one();
      loggerConfig.serviceName = 'TestService';

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FileService,
          { provide: LOGGER_CONFIG, useValue: loggerConfig },
        ],
      }).compile();

      const svc = module.get<FileService>(FileService);
      svc.log('Test log message');

      expectAppendCalledWithLevel('LOG');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
        serviceName?: string;
      };
      expect(parsed.serviceName).toBe(loggerConfig.serviceName);
    });
  });

  describe('log', () => {
    it('should write LOG entry to file', () => {
      service.log('Test log message');

      expectAppendCalledWithLevel('LOG');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.message).toBe('Test log message');
      expect(parsed.context).toBeUndefined();
      expect(parsed.stack).toBeUndefined();
    });

    it('should write LOG entry with context', () => {
      service.log('Test log message', 'TestContext');

      expectAppendCalledWithLevel('LOG');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.context).toBe('TestContext');
    });
  });

  describe('debug', () => {
    it('should write DEBUG entry to file', () => {
      service.debug('Test debug message');

      expectAppendCalledWithLevel('DEBUG');
    });

    it('should write DEBUG entry with context', () => {
      service.debug('Test debug message', 'TestContext');

      expectAppendCalledWithLevel('DEBUG');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.context).toBe('TestContext');
    });
  });

  describe('warn', () => {
    it('should write WARN entry to file', () => {
      service.warn('Test warn message');

      expectAppendCalledWithLevel('WARN');
    });

    it('should write WARN entry with context', () => {
      service.warn('Test warn message', 'TestContext');

      expectAppendCalledWithLevel('WARN');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.context).toBe('TestContext');
    });
  });

  describe('verbose', () => {
    it('should write VERBOSE entry to file', () => {
      service.verbose('Test verbose message');

      expectAppendCalledWithLevel('VERBOSE');
    });
  });

  describe('error', () => {
    it('should write ERROR entry to file', () => {
      service.error('Test error message');

      expectAppendCalledWithLevel('ERROR');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.message).toBe('Test error message');
    });

    it('should write ERROR entry with stack', () => {
      service.error('Test error message', 'Error stack trace');

      expectAppendCalledWithLevel('ERROR');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.stack).toBe('Error stack trace');
    });

    it('should write ERROR entry with stack and context', () => {
      service.error('Test error message', 'Error stack trace', 'TestContext');

      expectAppendCalledWithLevel('ERROR');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.stack).toBe('Error stack trace');
      expect(parsed.context).toBe('TestContext');
    });
  });

  describe('fatal', () => {
    it('should write FATAL entry to file', () => {
      service.fatal('Test fatal message');

      expectAppendCalledWithLevel('FATAL');
    });

    it('should write FATAL entry with stack and context', () => {
      service.fatal('Test fatal message', 'Fatal stack trace', 'TestContext');

      expectAppendCalledWithLevel('FATAL');

      const [, content] = (fsMock.appendFileSync as jest.Mock).mock
        .calls[0] as [string, string, string];
      const parsed = JSON.parse(String(content).trim()) as {
        timestamp: string;
        level: string;
        message: string;
        context?: string;
        stack?: string;
      };
      expect(parsed.stack).toBe('Fatal stack trace');
      expect(parsed.context).toBe('TestContext');
    });
  });

  describe('handleOldLogCleanupAsync', () => {
    const logsDir = path.join(process.cwd(), 'logs');
    const cutoffDate = new Date(2025, 11, 22);

    it('should delete log files older than cutoffDate', async () => {
      (fsMock.readdirSync as jest.Mock).mockReturnValue([
        'log-2025-12-20.log',
        'log-2025-12-25.log',
        'log-2025-12-28.log',
      ]);

      await service.handleOldLogCleanupAsync(cutoffDate);

      expect(fsMock.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fsMock.unlinkSync).toHaveBeenCalledWith(
        path.join(logsDir, 'log-2025-12-20.log'),
      );
    });

    it('should not delete log files newer than cutoffDate', async () => {
      (fsMock.readdirSync as jest.Mock).mockReturnValue([
        'log-2025-12-25.log',
        'log-2025-12-27.log',
        'log-2025-12-28.log',
      ]);

      await service.handleOldLogCleanupAsync(cutoffDate);

      expect(fsMock.unlinkSync).not.toHaveBeenCalled();
    });

    it('should skip files that do not match log pattern', async () => {
      (fsMock.readdirSync as jest.Mock).mockReturnValue([
        'readme.txt',
        'log-2025-12-20.log',
        'other-file.json',
        '.gitkeep',
      ]);

      await service.handleOldLogCleanupAsync(cutoffDate);

      expect(fsMock.unlinkSync).toHaveBeenCalledTimes(1);
      expect(fsMock.unlinkSync).toHaveBeenCalledWith(
        path.join(logsDir, 'log-2025-12-20.log'),
      );
    });

    it('should delete multiple old log files', async () => {
      (fsMock.readdirSync as jest.Mock).mockReturnValue([
        'log-2025-12-10.log',
        'log-2025-12-15.log',
        'log-2025-12-19.log',
        'log-2025-12-28.log',
      ]);

      await service.handleOldLogCleanupAsync(cutoffDate);

      expect(fsMock.unlinkSync).toHaveBeenCalledTimes(3);
      expect(fsMock.unlinkSync).toHaveBeenCalledWith(
        path.join(logsDir, 'log-2025-12-10.log'),
      );
      expect(fsMock.unlinkSync).toHaveBeenCalledWith(
        path.join(logsDir, 'log-2025-12-15.log'),
      );
      expect(fsMock.unlinkSync).toHaveBeenCalledWith(
        path.join(logsDir, 'log-2025-12-19.log'),
      );
    });

    it('should catch errors and log to console.error', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Permission denied');
      (fsMock.readdirSync as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await service.handleOldLogCleanupAsync(cutoffDate);

      expect(consoleSpy).toHaveBeenCalledWith(error);

      consoleSpy.mockRestore();
    });
  });
});
