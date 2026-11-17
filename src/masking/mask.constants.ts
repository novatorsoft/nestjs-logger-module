export const MASK_VALUE = '***';

export const DEFAULT_MASKED_KEYS: readonly string[] = [
  // Credentials
  'password',
  'passwd',
  'pwd',
  'secret',
  'client-secret',
  'private-key',

  // Tokens
  'token',
  'access-token',
  'refresh-token',
  'id-token',
  'auth-token',

  // HTTP headers
  'authorization',
  'proxy-authorization',
  'api-key',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'cookie',
  'set-cookie',

  // Payment
  'credit-card',
  'card-number',
  'cvv',
  'cvc',
];

export const MASKED_KEY_FRAGMENTS: readonly string[] = [
  'password',
  'passwd',
  'secret',
  'apikey',
];
