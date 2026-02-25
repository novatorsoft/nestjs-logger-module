import { LoggerProvider } from '../enum';

export class LoggerConfig {
  provider: LoggerProvider;
  isGlobal?: boolean;
  enabled?: boolean;
  serviceName?: string;
  retentionDays?: number;
}
