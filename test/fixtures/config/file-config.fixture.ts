import { FileConfig } from '../../../src/providers/file/file.config';
import { Mock } from 'mockingbird';

export class FileConfigFixture extends FileConfig {
  @Mock(true)
  declare enabled: boolean;

  @Mock(true)
  declare isGlobal?: boolean;
}
