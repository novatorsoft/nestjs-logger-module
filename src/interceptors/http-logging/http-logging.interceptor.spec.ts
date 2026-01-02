import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  HttpRequestFixture,
  HttpResponseFixture,
} from '../../../test/fixtures';
import { Observer, of, throwError } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';

import { HttpLoggingInterceptor } from './http-logging.interceptor';
import { LoggerService } from '../../logger.service';
import { MockFactory } from 'mockingbird';

describe('HttpLoggingInterceptor', () => {
  let interceptor: HttpLoggingInterceptor;
  let loggerService: jest.Mocked<LoggerService>;
  let executionContext: jest.Mocked<ExecutionContext>;
  let callHandler: jest.Mocked<CallHandler>;
  let mockRequest: HttpRequestFixture;
  let mockResponse: HttpResponseFixture;

  const createMockExecutionContext = (
    request: any,
    response: any,
  ): jest.Mocked<ExecutionContext> => {
    return {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
        getResponse: jest.fn().mockReturnValue(response),
      }),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
    } as unknown as jest.Mocked<ExecutionContext>;
  };

  beforeEach(async () => {
    mockRequest = MockFactory(HttpRequestFixture).one();
    mockResponse = MockFactory(HttpResponseFixture).one();

    executionContext = createMockExecutionContext(mockRequest, mockResponse);

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
        HttpLoggingInterceptor,
        {
          provide: LoggerService,
          useValue: loggerService,
        },
      ],
    }).compile();

    interceptor = module.get<HttpLoggingInterceptor>(HttpLoggingInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    describe('successful requests', () => {
      it('should not log if context type is not http', () => {
        executionContext.getType.mockReturnValue('tcp');
        callHandler.handle.mockReturnValue(of(mockResponse.body));
        interceptor.intercept(executionContext, callHandler).subscribe();
        expect(jest.spyOn(loggerService, 'log')).not.toHaveBeenCalled();
      });

      it('should log successful request with all data', (done) => {
        callHandler.handle.mockReturnValue(of(mockResponse.body));

        const observer: Partial<Observer<unknown>> = {
          next: (result) => {
            expect(result).toEqual(mockResponse.body);
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              {
                requestBody: mockRequest.body,
                requestHeaders: mockRequest.headers,
                statusCode: mockResponse.statusCode,
                responseBody: mockResponse.body,
                method: mockRequest.method,
                url: mockRequest.url,
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

      it('should log successful request with default empty body when responseBody is null', (done) => {
        callHandler.handle.mockReturnValue(of(null));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                responseBody: {},
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

      it('should log successful request with default status code when statusCode is missing', (done) => {
        delete mockResponse.statusCode;
        executionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );
        callHandler.handle.mockReturnValue(of({ data: 'test' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                statusCode: HttpStatus.OK,
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

      it('should log successful request with default empty body when request body is missing', (done) => {
        delete mockRequest.body;
        executionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );
        callHandler.handle.mockReturnValue(of({ data: 'test' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                requestBody: {},
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

      it('should log successful request with default empty headers when request headers are missing', (done) => {
        delete mockRequest.headers;
        executionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );
        callHandler.handle.mockReturnValue(of({ data: 'test' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                requestHeaders: {},
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

      it('should log different HTTP methods correctly', (done) => {
        mockRequest.method = 'POST';
        executionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );
        callHandler.handle.mockReturnValue(of({ data: 'created' }));

        const observer: Partial<Observer<unknown>> = {
          next: () => {
            expect(jest.spyOn(loggerService, 'log')).toHaveBeenCalledWith(
              expect.objectContaining({
                method: 'POST',
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
      it('should log HttpException error with status code and response', (done) => {
        const httpException = new HttpException(
          { message: 'Bad Request' },
          HttpStatus.BAD_REQUEST,
        );
        callHandler.handle.mockReturnValue(throwError(() => httpException));

        const observer: Partial<Observer<unknown>> = {
          error: (error) => {
            expect(error).toBe(httpException);
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              {
                method: mockRequest.method,
                url: mockRequest.url,
                requestBody: mockRequest.body,
                requestHeaders: mockRequest.headers,
                statusCode: HttpStatus.BAD_REQUEST,
                responseBody: { message: 'Bad Request' },
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

      it('should log regular Error with INTERNAL_SERVER_ERROR status', (done) => {
        const error = new Error('Internal server error');
        error.stack = 'Error stack trace';
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: (thrownError) => {
            expect(thrownError).toBe(error);
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              {
                method: mockRequest.method,
                url: mockRequest.url,
                requestBody: mockRequest.body,
                requestHeaders: mockRequest.headers,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                responseBody: {},
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
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                responseBody: {},
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

      it('should log HttpException with default empty response when getResponse returns null', (done) => {
        const httpException = new HttpException(
          'Not Found',
          HttpStatus.NOT_FOUND,
        );
        jest
          .spyOn(httpException, 'getResponse')
          .mockReturnValue(null as unknown as string | Record<string, unknown>);
        callHandler.handle.mockReturnValue(throwError(() => httpException));

        const observer: Partial<Observer<unknown>> = {
          error: () => {
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              expect.objectContaining({
                statusCode: HttpStatus.NOT_FOUND,
                responseBody: {},
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

      it('should rethrow the error after logging', (done) => {
        const error = new HttpException('Error', HttpStatus.BAD_REQUEST);
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

      it('should log error with request data even when request body is missing', (done) => {
        delete mockRequest.body;
        executionContext = createMockExecutionContext(
          mockRequest,
          mockResponse,
        );
        const error = new HttpException('Error', HttpStatus.BAD_REQUEST);
        callHandler.handle.mockReturnValue(throwError(() => error));

        const observer: Partial<Observer<unknown>> = {
          error: () => {
            expect(jest.spyOn(loggerService, 'error')).toHaveBeenCalledWith(
              expect.objectContaining({
                requestBody: {},
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
