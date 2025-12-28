import { Test, TestingModule } from '@nestjs/testing';

import { ConsoleService } from './console.service';
import { LOGGER_CONFIG } from '../../config';
import { Logger } from '@nestjs/common';
import { LoggerConfigFixture } from '../../../test/fixtures';
import { MockFactory } from 'mockingbird';

describe('ConsoleService', () => {
  let service: ConsoleService;
  let loggerSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
    verbose: jest.SpyInstance;
    fatal: jest.SpyInstance;
  };

  beforeEach(async () => {
    const loggerConfig = MockFactory(LoggerConfigFixture).one();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsoleService,
        { provide: LOGGER_CONFIG, useValue: loggerConfig },
      ],
    }).compile();

    service = module.get<ConsoleService>(ConsoleService);

    loggerSpy = {
      log: jest.spyOn(Logger.prototype, 'log').mockImplementation(),
      error: jest.spyOn(Logger.prototype, 'error').mockImplementation(),
      warn: jest.spyOn(Logger.prototype, 'warn').mockImplementation(),
      debug: jest.spyOn(Logger.prototype, 'debug').mockImplementation(),
      verbose: jest.spyOn(Logger.prototype, 'verbose').mockImplementation(),
      fatal: jest.spyOn(Logger.prototype, 'fatal').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should log a message', () => {
      const message = 'Test log message';
      service.log(message);
      expect(loggerSpy.log).toHaveBeenCalledWith(message);
    });

    it('should log a message with context', () => {
      const message = 'Test log message';
      const context = 'TestContext';
      service.log(message, context);
      expect(loggerSpy.log).toHaveBeenCalledWith(message);
    });
  });

  describe('debug', () => {
    it('should debug a message', () => {
      const message = 'Test debug message';
      service.debug(message);
      expect(loggerSpy.debug).toHaveBeenCalledWith(message);
    });

    it('should debug a message with context', () => {
      const message = 'Test debug message';
      const context = 'TestContext';
      service.debug(message, context);
      expect(loggerSpy.debug).toHaveBeenCalledWith(message);
    });
  });

  describe('error', () => {
    it('should error a message', () => {
      const message = 'Test error message';
      service.error(message);
      expect(loggerSpy.error).toHaveBeenCalled();
    });

    it('should error a message with stack', () => {
      const message = 'Test error message';
      const stack = 'Error stack trace';
      service.error(message, stack);
      expect(loggerSpy.error).toHaveBeenCalledWith(message, stack, undefined);
    });

    it('should error a message with stack and context', () => {
      const message = 'Test error message';
      const stack = 'Error stack trace';
      const context = 'TestContext';
      service.error(message, stack, context);
      expect(loggerSpy.error).toHaveBeenCalledWith(message, stack, context);
    });
  });

  describe('fatal', () => {
    it('should fatal a message', () => {
      const message = 'Test fatal message';
      service.fatal(message);
      expect(loggerSpy.fatal).toHaveBeenCalled();
    });

    it('should fatal a message with stack', () => {
      const message = 'Test fatal message';
      const stack = 'Fatal stack trace';
      service.fatal(message, stack);
      expect(loggerSpy.fatal).toHaveBeenCalledWith(message, stack, undefined);
    });

    it('should fatal a message with stack and context', () => {
      const message = 'Test fatal message';
      const stack = 'Fatal stack trace';
      const context = 'TestContext';
      service.fatal(message, stack, context);
      expect(loggerSpy.fatal).toHaveBeenCalledWith(message, stack, context);
    });
  });

  describe('verbose', () => {
    it('should verbose a message', () => {
      const message = 'Test verbose message';
      service.verbose(message);
      expect(loggerSpy.verbose).toHaveBeenCalledWith(message);
    });

    it('should verbose a message with context', () => {
      const message = 'Test verbose message';
      const context = 'TestContext';
      service.verbose(message, context);
      expect(loggerSpy.verbose).toHaveBeenCalledWith(message);
    });
  });

  describe('warn', () => {
    it('should warn a message', () => {
      const message = 'Test warn message';
      service.warn(message);
      expect(loggerSpy.warn).toHaveBeenCalledWith(message);
    });

    it('should warn a message with context', () => {
      const message = 'Test warn message';
      const context = 'TestContext';
      service.warn(message, context);
      expect(loggerSpy.warn).toHaveBeenCalledWith(message);
    });
  });
});
