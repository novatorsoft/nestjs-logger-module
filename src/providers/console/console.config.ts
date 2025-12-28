import { LoggerConfig } from '../../config/logger.config';
import { LoggerProvider } from '../../enum';

export class ConsoleConfig extends LoggerConfig {
  readonly provider = LoggerProvider.CONSOLE;
}
