import { Mock } from 'mockingbird';

export class HttpResponseFixture {
  @Mock(200)
  statusCode?: number;

  @Mock((faker) => faker.lorem.word())
  body: string;
}
