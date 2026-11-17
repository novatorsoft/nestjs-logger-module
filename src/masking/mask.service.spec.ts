import { MASK_VALUE } from './mask.constants';
import { MaskService } from './mask.service';

describe('MaskService', () => {
  let service: MaskService;

  beforeEach(() => {
    service = new MaskService();
  });

  it('should return primitives unchanged', () => {
    expect(service.mask('plain text')).toBe('plain text');
    expect(service.mask(42)).toBe(42);
    expect(service.mask(true)).toBe(true);
    expect(service.mask(null)).toBeNull();
    expect(service.mask(undefined)).toBeUndefined();
  });

  it('should mask default sensitive keys', () => {
    const result = service.mask({
      username: 'john',
      password: 'secret123',
      token: 'abc',
      accessToken: 'abc',
      refresh_token: 'abc',
    });

    expect(result).toEqual({
      username: 'john',
      password: MASK_VALUE,
      token: MASK_VALUE,
      accessToken: MASK_VALUE,
      refresh_token: MASK_VALUE,
    });
  });

  it('should match keys case and separator insensitively', () => {
    const result = service.mask({
      'x-api-key': 'k1',
      'X-API-KEY': 'k2',
      xApiKey: 'k3',
      Authorization: 'Bearer xyz',
      'set-cookie': ['a=b'],
    });

    expect(result).toEqual({
      'x-api-key': MASK_VALUE,
      'X-API-KEY': MASK_VALUE,
      xApiKey: MASK_VALUE,
      Authorization: MASK_VALUE,
      'set-cookie': MASK_VALUE,
    });
  });

  it('should mask header style keys', () => {
    const result = service.mask({
      'x-auth-token': 'a',
      'X-Access-Token': 'b',
      'proxy-authorization': 'c',
      'x-stripe-api-key': 'd',
      'content-type': 'application/json',
    });

    expect(result).toEqual({
      'x-auth-token': MASK_VALUE,
      'X-Access-Token': MASK_VALUE,
      'proxy-authorization': MASK_VALUE,
      'x-stripe-api-key': MASK_VALUE,
      'content-type': 'application/json',
    });
  });

  it('should mask keys containing sensitive fragments', () => {
    const result = service.mask({
      newPassword: 'a',
      confirm_password: 'b',
      clientSecretValue: 'c',
      stripeApiKey: 'd',
      tokenType: 'Bearer',
    });

    expect(result).toEqual({
      newPassword: MASK_VALUE,
      confirm_password: MASK_VALUE,
      clientSecretValue: MASK_VALUE,
      stripeApiKey: MASK_VALUE,
      tokenType: 'Bearer',
    });
  });

  it('should mask nested objects and arrays', () => {
    const result = service.mask({
      requestHeaders: { authorization: 'Bearer xyz', host: 'localhost' },
      requestBody: {
        users: [
          { name: 'a', password: '1' },
          { name: 'b', password: '2' },
        ],
      },
    });

    expect(result).toEqual({
      requestHeaders: { authorization: MASK_VALUE, host: 'localhost' },
      requestBody: {
        users: [
          { name: 'a', password: MASK_VALUE },
          { name: 'b', password: MASK_VALUE },
        ],
      },
    });
  });

  it('should not mutate the original object', () => {
    const original = { password: 'secret', nested: { token: 'abc' } };
    service.mask(original);

    expect(original).toEqual({ password: 'secret', nested: { token: 'abc' } });
  });

  it('should mask sensitive keys inside JSON strings', () => {
    const result = service.mask('{"user":"john","password":"123"}');

    expect(JSON.parse(result)).toEqual({ user: 'john', password: MASK_VALUE });
  });

  it('should return invalid JSON-like strings unchanged', () => {
    expect(service.mask('{not json}')).toBe('{not json}');
  });

  it('should support additional keys', () => {
    const customService = new MaskService({
      maskedKeys: ['tcNo', 'phone-number'],
    });
    const result = customService.mask({
      tcNo: '12345678901',
      phoneNumber: '555',
      name: 'john',
    });

    expect(result).toEqual({
      tcNo: MASK_VALUE,
      phoneNumber: MASK_VALUE,
      name: 'john',
    });
  });

  it('should handle circular references', () => {
    const obj: Record<string, unknown> = { password: 'x' };
    obj.self = obj;

    expect(service.mask(obj)).toEqual({
      password: MASK_VALUE,
      self: '[Circular]',
    });
  });

  it('should keep repeated (non-circular) references', () => {
    const shared = { password: 'x', a: 1 };

    expect(service.mask({ first: shared, second: shared })).toEqual({
      first: { password: MASK_VALUE, a: 1 },
      second: { password: MASK_VALUE, a: 1 },
    });
  });

  it('should mask class instances and toJSON results', () => {
    class LoginDto {
      email = 'a@b.com';
      password = '123';
    }
    const withToJSON = { toJSON: () => ({ secret: 's', id: 1 }) };

    expect(service.mask(new LoginDto())).toEqual({
      email: 'a@b.com',
      password: MASK_VALUE,
    });
    expect(service.mask(withToJSON)).toEqual({ secret: MASK_VALUE, id: 1 });
  });

  it('should leave opaque objects untouched', () => {
    const error = new Error('boom');
    const date = new Date();
    const buffer = Buffer.from('data');

    expect(service.mask(error)).toBe(error);
    expect(service.mask(date)).toBe(date);
    expect(service.mask(buffer)).toBe(buffer);
  });
});
