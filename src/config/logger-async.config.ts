import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { ConsoleConfig } from '../providers';
import { LoggerConfig } from './logger.config';

export type LoggerConfigType = ConsoleConfig;

export type LoggerAsyncConfig = Pick<ModuleMetadata, 'imports'> &
  Pick<
    FactoryProvider<Omit<LoggerConfigType, 'provider' | 'isGlobal'>>,
    'useFactory' | 'inject'
  > &
  LoggerConfig;
