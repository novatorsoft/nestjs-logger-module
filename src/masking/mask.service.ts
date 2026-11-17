import { Inject, Injectable, Optional } from '@nestjs/common';
import { LOGGER_CONFIG, LoggerConfig } from '../config';
import {
  DEFAULT_MASKED_KEYS,
  MASK_VALUE,
  MASKED_KEY_FRAGMENTS,
} from './mask.constants';

@Injectable()
export class MaskService {
  private readonly maskedKeys: Set<string>;
  private readonly maskedKeyFragments: string[];

  constructor(
    @Optional()
    @Inject(LOGGER_CONFIG)
    loggerConfig?: Pick<LoggerConfig, 'maskedKeys'>,
  ) {
    const keys = [...DEFAULT_MASKED_KEYS, ...(loggerConfig?.maskedKeys ?? [])];
    this.maskedKeys = new Set(keys.map((key) => this.normalizeKey(key)));
    this.maskedKeyFragments = MASKED_KEY_FRAGMENTS.map((fragment) =>
      this.normalizeKey(fragment),
    );
  }

  mask<T>(value: T): T {
    return this.maskValue(value, new WeakSet()) as T;
  }

  isMaskedKey(key: string): boolean {
    const normalizedKey = this.normalizeKey(key);

    if (this.maskedKeys.has(normalizedKey)) return true;

    return this.maskedKeyFragments.some((fragment) =>
      normalizedKey.includes(fragment),
    );
  }

  private maskValue(value: unknown, visited: WeakSet<object>): unknown {
    if (typeof value === 'string') return this.maskString(value, visited);
    if (!this.isMaskableObject(value)) return value;

    if (visited.has(value)) return '[Circular]';
    visited.add(value);

    const result = this.maskObject(value, visited);

    visited.delete(value);
    return result;
  }

  private maskObject(value: object, visited: WeakSet<object>): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.maskValue(item, visited));
    }

    if (this.hasToJSON(value)) {
      return this.maskValue(value.toJSON(), visited);
    }

    const result: Record<string, unknown> = {};
    for (const [key, nestedValue] of Object.entries(value)) {
      result[key] = this.isMaskedKey(key)
        ? MASK_VALUE
        : this.maskValue(nestedValue, visited);
    }
    return result;
  }

  private maskString(value: string, visited: WeakSet<object>): string {
    if (!this.looksLikeJson(value)) return value;

    try {
      const parsed: unknown = JSON.parse(value);
      return JSON.stringify(this.maskValue(parsed, visited));
    } catch {
      return value;
    }
  }

  private looksLikeJson(value: string): boolean {
    const text = value.trim();
    return (
      (text.startsWith('{') && text.endsWith('}')) ||
      (text.startsWith('[') && text.endsWith(']'))
    );
  }

  private isMaskableObject(value: unknown): value is object {
    if (value === null || typeof value !== 'object') return false;

    const isBuiltIn =
      value instanceof Error ||
      value instanceof Date ||
      value instanceof RegExp ||
      value instanceof Map ||
      value instanceof Set ||
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value);

    return !isBuiltIn;
  }

  private hasToJSON(value: object): value is { toJSON: () => unknown } {
    return typeof (value as { toJSON?: unknown }).toJSON === 'function';
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
