import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../logger.service';

@Injectable()
export class MockService extends LoggerService {
  debug(): void {}
  log(): void {}
  error(): void {}
  fatal(): void {}
  verbose(): void {}
  warn(): void {}
}
