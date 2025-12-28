import { LoggerConfig } from '../../config/logger.config';
import { LoggerProvider } from '../../enum';

export class FileConfig extends LoggerConfig {
  readonly provider: LoggerProvider = LoggerProvider.FILE;
}
