import { Mock } from 'mockingbird';

class RpcResponseDataFixture {
  @Mock((faker) => faker.lorem.word())
  message: string;
}

export class RpcResponseFixture {
  @Mock(RpcResponseDataFixture)
  data?: RpcResponseDataFixture;
}
