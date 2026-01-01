import { ConsoleConfig } from '../../../src/providers/console/console.config';
import { Mock } from 'mockingbird';

export class ConsoleConfigFixture extends ConsoleConfig {
  @Mock(true)
  declare enabled: boolean;

  @Mock(true)
  declare isGlobal?: boolean;
}
