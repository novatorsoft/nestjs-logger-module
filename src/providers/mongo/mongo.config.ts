import { LoggerConfig } from '../../config/logger.config';
import { LoggerProvider } from '../../enum';

export class MongoConfig extends LoggerConfig {
  readonly provider = LoggerProvider.MONGODB;
  uri: string;
  schemaName?: string;
}
