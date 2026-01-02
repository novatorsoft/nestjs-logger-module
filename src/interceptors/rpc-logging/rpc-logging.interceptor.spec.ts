import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observer, of, throwError } from 'rxjs';
import { RpcRequestFixture, RpcResponseFixture } from '../../../test/fixtures';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '../../logger.service';
import { MockFactory } from 'mockingbird';
import { RpcLoggingInterceptor } from './rpc-logging.interceptor';

describe('RpcLoggingInterceptor', () => {
  let interceptor: RpcLoggingInterceptor;
  let loggerService: jest.Mocked<LoggerService>;
  let executionContext: jest.Mocked<ExecutionContext>;
  let callHandler: jest.Mocked<CallHandler>;
  let mockRpcData: RpcRequestFixture;
  let mockResponse: RpcResponseFixture;

  const createMockExecutionContext = (
    rpcData: any,
  ): jest.Mocked<ExecutionContext> => {
    return {
      getType: jest.fn().mockReturnValue('rpc'),
      switchToRpc: jest.fn().mockReturnValue({
        getData: jest.fn().mockReturnValue(rpcData),
      }),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
    } as unknown as jest.Mocked<ExecutionContext>;
  };

  beforeEach(async () => {
    mockRpcData = MockFactory(RpcRequestFixture).one();
    mockResponse = MockFactory(RpcResponseFixture).one();

    executionContext = createMockExecutionContext(mockRpcData);

    loggerService = {
      log: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      verbose: jest.fn(),
      fatal: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    callHandler = { handle: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RpcLoggingInterceptor,
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    interceptor = module.get<RpcLoggingInterceptor>(RpcLoggingInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    describe('successful requests', () => {
      it('should not log if context type is not rpc', () => {
        executionContext.getType.mockReturnValue('http');
        callHandler.handle.mockReturnValue(of(mockResponse.data));
        interceptor.intercept(executionContext, callHandler).subscribe();
        expect(jest.spyOn(loggerService, 'log')).not.toHaveBeenCalled();
      });

      it('should log successful RPC call with all data', (done) => {
        callHandler.handle.mockReturnValue(of(mockResponse.data));

        const observer: Partial<Observer<unknown>> = {
          next: (result) => {
            expect(result).toEqual(mockResponse.data);
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              {
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                responseData: mockResponse.data,
                requestType: 'rpc-request',
              },
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log successful RPC call with default empty object when responseData is null', (done) => {
        callHandler.handle.mockReturnValue(of(null));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                responseData: {},
              }),
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log successful RPC call with default empty object when responseData is undefined', (done) => {
        callHandler.handle.mockReturnValue(of(undefined));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                responseData: {},
              }),
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log successful RPC call with null when requestData is missing', (done) => {
        const rpcDataWithoutData = { pattern: mockRpcData.pattern };
        executionContext = createMockExecutionContext(rpcDataWithoutData);
        callHandler.handle.mockReturnValue(of({ data: 'test' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: null,
                responseData: { data: 'test' },
              }),
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log successful RPC call with null when requestData is undefined', (done) => {
        const rpcDataWithUndefined = {
          pattern: mockRpcData.pattern,
          data: undefined,
        };
        executionContext = createMockExecutionContext(rpcDataWithUndefined);
        callHandler.handle.mockReturnValue(of({ data: 'test' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: null,
                responseData: { data: 'test' },
              }),
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });
    });

    describe('error handling', () => {
      it('should log HttpException error with message and stack', (done) => {
        const httpException = new HttpException(
          { message: 'RPC Error' },
          HttpStatus.BAD_REQUEST,
        );
        callHandler.handle.mockReturnValue(throwError(() => httpException));

        const observer: Partial<Observer<unknown>> = {
          error: (error) => {
            expect(error).toBe(httpException);
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              {
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                error: httpException.message,
                responseData: null,
                requestType: 'rpc-request',
              },
              httpException.stack,
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log regular Error with message and stack', (done) => {
        const error = new Error('RPC processing error');
        error.stack = 'Error stack trace';
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: (thrownError) => {
            expect(thrownError).toBe(error);
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              {
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                error: error.message,
                responseData: null,
                requestType: 'rpc-request',
              },
              'Error stack trace',
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log Error without stack trace', (done) => {
        const error = new Error('Error without stack');
        delete error.stack;
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: () => {
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: mockRpcData.data,
                error: error.message,
                responseData: null,
              }),
              '',
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should rethrow the error after logging', (done) => {
        const error = new HttpException('RPC Error', HttpStatus.BAD_REQUEST);
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: (thrownError) => {
            expect(thrownError).toBe(error);
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalled();
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });

      it('should log error with request data even when request data is missing', (done) => {
        const rpcDataWithoutData = { pattern: mockRpcData.pattern };
        executionContext = createMockExecutionContext(rpcDataWithoutData);
        const error = new HttpException('Error', HttpStatus.BAD_REQUEST);
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: () => {
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              expect.objectContaining({
                pattern: mockRpcData.pattern,
                requestData: null,
                error: error.message,
                responseData: null,
              }),
              expect.any(String),
              'TestController',
            );
            done();
          },
        };
        interceptor
          .intercept(executionContext, callHandler)
          .subscribe(observer);
      });
    });
  });
});
