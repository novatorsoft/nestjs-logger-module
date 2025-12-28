import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '../../logger.service';
import { MockService } from './mock.service';

describe('MockService', () => {
  let service: LoggerService;
  let consoleSpy: {
    log: jest.SpyInstance;
    error: jest.SpyInstance;
    warn: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockService],
    }).compile();

    service = module.get<MockService>(MockService);

    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      debug: jest.spyOn(console, 'debug').mockImplementation(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should not log anything', () => {
      const message = 'Test log message';
      service.log(message);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not log anything with context', () => {
      const message = 'Test log message';
      const context = 'TestContext';
      service.log(message, context);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.log('message');
        service.log('message', 'context');
      }).not.toThrow();
    });
  });

  describe('debug', () => {
    it('should not debug anything', () => {
      const message = 'Test debug message';
      service.debug(message);
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not debug anything with context', () => {
      const message = 'Test debug message';
      const context = 'TestContext';
      service.debug(message, context);
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.debug('message');
        service.debug('message', 'context');
      }).not.toThrow();
    });
  });

  describe('error', () => {
    it('should not error anything', () => {
      const message = 'Test error message';
      service.error(message);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not error anything with stack', () => {
      const message = 'Test error message';
      const stack = 'Error stack trace';
      service.error(message, stack);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not error anything with stack and context', () => {
      const message = 'Test error message';
      const stack = 'Error stack trace';
      const context = 'TestContext';
      service.error(message, stack, context);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.error('message');
        service.error('message', 'stack');
        service.error('message', 'stack', 'context');
      }).not.toThrow();
    });
  });

  describe('fatal', () => {
    it('should not fatal anything', () => {
      const message = 'Test fatal message';
      service.fatal(message);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not fatal anything with stack and context', () => {
      const message = 'Test fatal message';
      const stack = 'Fatal stack trace';
      const context = 'TestContext';
      service.fatal(message, stack, context);
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.fatal('message');
        service.fatal('message', 'stack');
        service.fatal('message', 'stack', 'context');
      }).not.toThrow();
    });
  });

  describe('verbose', () => {
    it('should not verbose anything', () => {
      const message = 'Test verbose message';
      service.verbose(message);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not verbose anything with context', () => {
      const message = 'Test verbose message';
      const context = 'TestContext';
      service.verbose(message, context);
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.verbose('message');
        service.verbose('message', 'context');
      }).not.toThrow();
    });
  });

  describe('warn', () => {
    it('should not warn anything', () => {
      const message = 'Test warn message';
      service.warn(message);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not warn anything with context', () => {
      const message = 'Test warn message';
      const context = 'TestContext';
      service.warn(message, context);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    it('should not throw error when called', () => {
      expect(() => {
        service.warn('message');
        service.warn('message', 'context');
      }).not.toThrow();
    });
  });

  describe('MockService behavior', () => {
    it('should silently handle all logging methods without any output', () => {
      service.log('log message', 'context');
      service.debug('debug message', 'context');
      service.error('error message', 'stack', 'context');
      service.fatal('fatal message', 'stack', 'context');
      service.verbose('verbose message', 'context');
      service.warn('warn message', 'context');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });
});
