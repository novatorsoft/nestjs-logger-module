import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { ConsoleConfig, FileConfig } from '../providers';
import { LoggerConfig } from './logger.config';

export type LoggerConfigType = ConsoleConfig | FileConfig;

export type LoggerAsyncConfig = Pick<ModuleMetadata, 'imports'> &
  Pick<
    FactoryProvider<
      Omit<LoggerConfigType, 'provider' | 'isGlobal' | 'enabled'>
    >,
    'useFactory' | 'inject'
  > &
  LoggerConfig;
