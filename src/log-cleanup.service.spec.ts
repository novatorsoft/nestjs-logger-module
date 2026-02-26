import { Test, TestingModule } from '@nestjs/testing';

import { LOGGER_CONFIG } from './config';
import { LogCleanupService } from './log-cleanup.service';
import { LoggerService } from './logger.service';

describe('LogCleanupService', () => {
  let service: LogCleanupService;
  let mockHandleOldLogCleanupAsync: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    service?.onModuleDestroy();
    jest.useRealTimers();
  });

  describe('when logger is enabled and retentionDays is set', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: true, retentionDays: 7 },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).toHaveBeenCalled();
    });

    it('should run cleanup on module init', () => {
      service.onModuleInit();
      expect(mockHandleOldLogCleanupAsync).toHaveBeenCalledTimes(1);
    });

    it('should schedule interval on module init', () => {
      service.onModuleInit();
      mockHandleOldLogCleanupAsync.mockClear();

      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(mockHandleOldLogCleanupAsync).toHaveBeenCalledTimes(1);
    });

    it('should clear interval on module destroy', () => {
      service.onModuleInit();
      service.onModuleDestroy();
      mockHandleOldLogCleanupAsync.mockClear();

      jest.advanceTimersByTime(24 * 60 * 60 * 1000);
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });
  });

  describe('when logger is enabled and retentionDays is not set', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: true },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should not call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });

    it('should not schedule interval on module init', () => {
      service.onModuleInit();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });
  });

  describe('when logger is enabled and retentionDays is 0', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: true, retentionDays: 0 },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should not call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });
  });

  describe('when logger is enabled and retentionDays is negative', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: true, retentionDays: -1 },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should not call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });
  });

  describe('when logger is disabled', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: false, retentionDays: 7 },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should not call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });

    it('should not schedule interval on module init', () => {
      service.onModuleInit();
      expect(mockHandleOldLogCleanupAsync).not.toHaveBeenCalled();
    });
  });

  describe('when enabled is undefined and retentionDays is set', () => {
    beforeEach(async () => {
      mockHandleOldLogCleanupAsync = jest.fn().mockResolvedValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          LogCleanupService,
          {
            provide: LOGGER_CONFIG,
            useValue: { retentionDays: 7 },
          },
          {
            provide: LoggerService,
            useValue: {
              handleOldLogCleanupAsync: mockHandleOldLogCleanupAsync,
            },
          },
        ],
      }).compile();

      service = module.get<LogCleanupService>(LogCleanupService);
    });

    it('should call loggerService.handleOldLogCleanupAsync', async () => {
      await service.handleOldLogCleanup();
      expect(mockHandleOldLogCleanupAsync).toHaveBeenCalled();
    });

    it('should run cleanup on module init', () => {
      service.onModuleInit();
      expect(mockHandleOldLogCleanupAsync).toHaveBeenCalledTimes(1);
    });
  });
});
