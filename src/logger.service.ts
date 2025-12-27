import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class LoggerService {
  abstract debug(message: any, context?: string): void;
  abstract log(message: any, context?: string): void;
  abstract error(message: any, context?: string): void;
  abstract error(message: any, stack: string, context?: string): void;
  abstract fatal(message: any, context?: string): void;
  abstract fatal(message: any, stack: string, context?: string): void;
  abstract verbose(message: any, context?: string): void;
  abstract warn(message: any, context?: string): void;
}
