import { Mock } from 'mockingbird';

class httpHeadersFixture {
  @Mock((faker) => faker.internet.userAgent())
  userAgent: string;
}

export class HttpRequestFixture {
  @Mock((faker) => faker.internet.httpMethod())
  method: string;

  @Mock((faker) => faker.internet.url())
  url: string;

  @Mock((faker) => faker.lorem.word())
  body?: string;

  @Mock(httpHeadersFixture)
  headers?: httpHeadersFixture;
}
