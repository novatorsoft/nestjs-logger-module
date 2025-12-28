import { LoggerConfig } from '../../../src/config';
import { LoggerProvider } from '../../../src/enum';
import { Mock } from 'mockingbird';

export class LoggerConfigFixture extends LoggerConfig {
  @Mock(LoggerProvider)
  declare provider: LoggerProvider;
}
