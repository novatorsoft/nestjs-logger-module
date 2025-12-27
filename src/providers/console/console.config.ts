import { LoggerConfig } from '../../config/logger.config';
import { LoggerProvider } from '../../enum';

export class ConsoleConfig extends LoggerConfig {
  readonly logger = LoggerProvider.CONSOLE;
}
