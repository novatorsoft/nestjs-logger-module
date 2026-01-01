import { Mock } from 'mockingbird';
import { MongoConfig } from '../../../src/providers/mongo/mongo.config';

export class MongoConfigFixture extends MongoConfig {
  @Mock(true)
  declare enabled: boolean;

  @Mock((faker) => faker.internet.url())
  declare uri: string;

  @Mock(true)
  declare isGlobal?: boolean;
}
