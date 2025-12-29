import { ConsoleConfig, FileConfig, MongoConfig } from '../providers';
import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { LoggerConfig } from './logger.config';

export type LoggerConfigType = ConsoleConfig | FileConfig | MongoConfig;

export type LoggerAsyncConfig = Pick<ModuleMetadata, 'imports'> &
  Pick<
    FactoryProvider<
      Omit<LoggerConfigType, 'provider' | 'isGlobal' | 'enabled'>
    >,
    'useFactory' | 'inject'
  > &
  LoggerConfig;
