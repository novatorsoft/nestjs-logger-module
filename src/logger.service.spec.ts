import { Test, TestingModule } from '@nestjs/testing';

import { LOGGER_CONFIG } from './config';
import { LoggerService } from './logger.service';

class TestLoggerService extends LoggerService {
  doDebug(): void {}
  doLog(): void {}
  doError(): void {}
  doFatal(): void {}
  doVerbose(): void {}
  doWarn(): void {}
}

describe('LoggerService', () => {
  let service: TestLoggerService;
  let doDebugSpy: jest.SpyInstance;
  let doLogSpy: jest.SpyInstance;
  let doErrorSpy: jest.SpyInstance;
  let doFatalSpy: jest.SpyInstance;
  let doVerboseSpy: jest.SpyInstance;
  let doWarnSpy: jest.SpyInstance;

  describe('when logger is enabled', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestLoggerService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: true },
          },
        ],
      }).compile();

      service = module.get<TestLoggerService>(TestLoggerService);
      doDebugSpy = jest.spyOn(service, 'doDebug');
      doLogSpy = jest.spyOn(service, 'doLog');
      doErrorSpy = jest.spyOn(service, 'doError');
      doFatalSpy = jest.spyOn(service, 'doFatal');
      doVerboseSpy = jest.spyOn(service, 'doVerbose');
      doWarnSpy = jest.spyOn(service, 'doWarn');
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('debug', () => {
      it('should call doDebug when debug is called', () => {
        service.debug('test message');
        expect(doDebugSpy).toHaveBeenCalledWith('test message', undefined);
      });

      it('should call doDebug when debug is called with context', () => {
        service.debug('test message', 'context');
        expect(doDebugSpy).toHaveBeenCalledWith('test message', 'context');
      });
    });

    describe('log', () => {
      it('should call doLog when log is called', () => {
        service.log('test message');
        expect(doLogSpy).toHaveBeenCalledWith('test message', undefined);
      });

      it('should call doLog when log is called with context', () => {
        service.log('test message', 'context');
        expect(doLogSpy).toHaveBeenCalledWith('test message', 'context');
      });
    });

    describe('error', () => {
      it('should call doError when error is called', () => {
        service.error('test message');
        expect(doErrorSpy).toHaveBeenCalledWith(
          'test message',
          undefined,
          undefined,
        );
      });

      it('should call doError when error is called with stack', () => {
        service.error('test message', 'stack trace');
        expect(doErrorSpy).toHaveBeenCalledWith(
          'test message',
          'stack trace',
          undefined,
        );
      });

      it('should call doError when error is called with stack and context', () => {
        service.error('test message', 'stack trace', 'context');
        expect(doErrorSpy).toHaveBeenCalledWith(
          'test message',
          'stack trace',
          'context',
        );
      });
    });

    describe('fatal', () => {
      it('should call doFatal when fatal is called', () => {
        service.fatal('test message');
        expect(doFatalSpy).toHaveBeenCalledWith(
          'test message',
          undefined,
          undefined,
        );
      });

      it('should call doFatal when fatal is called with stack', () => {
        service.fatal('test message', 'stack trace');
        expect(doFatalSpy).toHaveBeenCalledWith(
          'test message',
          'stack trace',
          undefined,
        );
      });

      it('should call doFatal when fatal is called with stack and context', () => {
        service.fatal('test message', 'stack trace', 'context');
        expect(doFatalSpy).toHaveBeenCalledWith(
          'test message',
          'stack trace',
          'context',
        );
      });
    });

    describe('verbose', () => {
      it('should call doVerbose when verbose is called', () => {
        service.verbose('test message');
        expect(doVerboseSpy).toHaveBeenCalledWith('test message', undefined);
      });

      it('should call doVerbose when verbose is called with context', () => {
        service.verbose('test message', 'context');
        expect(doVerboseSpy).toHaveBeenCalledWith('test message', 'context');
      });
    });

    describe('warn', () => {
      it('should call doWarn when warn is called', () => {
        service.warn('test message');
        expect(doWarnSpy).toHaveBeenCalledWith('test message', undefined);
      });

      it('should call doWarn when warn is called with context', () => {
        service.warn('test message', 'context');
        expect(doWarnSpy).toHaveBeenCalledWith('test message', 'context');
      });
    });
  });

  describe('when logger is disabled', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestLoggerService,
          {
            provide: LOGGER_CONFIG,
            useValue: { enabled: false },
          },
        ],
      }).compile();

      service = module.get<TestLoggerService>(TestLoggerService);
      doDebugSpy = jest.spyOn(service, 'doDebug');
      doLogSpy = jest.spyOn(service, 'doLog');
      doErrorSpy = jest.spyOn(service, 'doError');
      doFatalSpy = jest.spyOn(service, 'doFatal');
      doVerboseSpy = jest.spyOn(service, 'doVerbose');
      doWarnSpy = jest.spyOn(service, 'doWarn');
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    describe('debug', () => {
      it('should not call doDebug when debug is called', () => {
        service.debug('test message');
        expect(doDebugSpy).not.toHaveBeenCalled();
      });

      it('should not call doDebug when debug is called with context', () => {
        service.debug('test message', 'context');
        expect(doDebugSpy).not.toHaveBeenCalled();
      });
    });

    describe('log', () => {
      it('should not call doLog when log is called', () => {
        service.log('test message');
        expect(doLogSpy).not.toHaveBeenCalled();
      });

      it('should not call doLog when log is called with context', () => {
        service.log('test message', 'context');
        expect(doLogSpy).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should not call doError when error is called', () => {
        service.error('test message');
        expect(doErrorSpy).not.toHaveBeenCalled();
      });

      it('should not call doError when error is called with stack', () => {
        service.error('test message', 'stack trace');
        expect(doErrorSpy).not.toHaveBeenCalled();
      });

      it('should not call doError when error is called with stack and context', () => {
        service.error('test message', 'stack trace', 'context');
        expect(doErrorSpy).not.toHaveBeenCalled();
      });
    });

    describe('fatal', () => {
      it('should not call doFatal when fatal is called', () => {
        service.fatal('test message');
        expect(doFatalSpy).not.toHaveBeenCalled();
      });

      it('should not call doFatal when fatal is called with stack', () => {
        service.fatal('test message', 'stack trace');
        expect(doFatalSpy).not.toHaveBeenCalled();
      });

      it('should not call doFatal when fatal is called with stack and context', () => {
        service.fatal('test message', 'stack trace', 'context');
        expect(doFatalSpy).not.toHaveBeenCalled();
      });
    });

    describe('verbose', () => {
      it('should not call doVerbose when verbose is called', () => {
        service.verbose('test message');
        expect(doVerboseSpy).not.toHaveBeenCalled();
      });

      it('should not call doVerbose when verbose is called with context', () => {
        service.verbose('test message', 'context');
        expect(doVerboseSpy).not.toHaveBeenCalled();
      });
    });

    describe('warn', () => {
      it('should not call doWarn when warn is called', () => {
        service.warn('test message');
        expect(doWarnSpy).not.toHaveBeenCalled();
      });

      it('should not call doWarn when warn is called with context', () => {
        service.warn('test message', 'context');
        expect(doWarnSpy).not.toHaveBeenCalled();
      });
    });

    it('should not throw when any method is called', () => {
      expect(() => {
        service.debug('test');
        service.log('test');
        service.error('test');
        service.error('test', 'stack');
        service.error('test', 'stack', 'context');
        service.fatal('test');
        service.fatal('test', 'stack');
        service.fatal('test', 'stack', 'context');
        service.verbose('test');
        service.warn('test');
      }).not.toThrow();
    });
  });

  describe('when enabled is undefined', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TestLoggerService,
          {
            provide: LOGGER_CONFIG,
            useValue: {},
          },
        ],
      }).compile();

      service = module.get<TestLoggerService>(TestLoggerService);
      doDebugSpy = jest.spyOn(service, 'doDebug');
      doLogSpy = jest.spyOn(service, 'doLog');
      doErrorSpy = jest.spyOn(service, 'doError');
      doFatalSpy = jest.spyOn(service, 'doFatal');
      doVerboseSpy = jest.spyOn(service, 'doVerbose');
      doWarnSpy = jest.spyOn(service, 'doWarn');
    });

    it('should not call doDebug when enabled is undefined', () => {
      service.debug('test message');
      expect(doDebugSpy).toHaveBeenCalled();
    });

    it('should not call doLog when enabled is undefined', () => {
      service.log('test message');
      expect(doLogSpy).toHaveBeenCalled();
    });

    it('should not call doError when enabled is undefined', () => {
      service.error('test message');
      expect(doErrorSpy).toHaveBeenCalled();
    });

    it('should not call doFatal when enabled is undefined', () => {
      service.fatal('test message');
      expect(doFatalSpy).toHaveBeenCalled();
    });

    it('should not call doVerbose when enabled is undefined', () => {
      service.verbose('test message');
      expect(doVerboseSpy).toHaveBeenCalled();
    });

    it('should not call doWarn when enabled is undefined', () => {
      service.warn('test message');
      expect(doWarnSpy).toHaveBeenCalled();
    });
  });
});
