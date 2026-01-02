import { Mock } from 'mockingbird';

class RpcRequestDataFixture {
  @Mock((faker) => faker.datatype.uuid())
  id: string;
}

export class RpcRequestFixture {
  @Mock((faker) => faker.lorem.word())
  pattern: string;

  @Mock(RpcRequestDataFixture)
  data?: RpcRequestDataFixture;
}
