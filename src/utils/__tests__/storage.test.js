/**
 * @fileoverview Tests for the safe storage utilities.
 * @module utils/__tests__/storage.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  safeRead,
  safeWrite,
  safeRemove,
  validateImportPayload,
  exportAllData,
  clearAllData,
} from '../storage';

beforeEach(() => {
  localStorage.clear();
});

describe('safeRead', () => {
  it('returns fallback for missing key', () => {
    expect(safeRead('ecomirror_missing', 'default')).toBe('default');
  });

  it('parses and returns stored JSON', () => {
    localStorage.setItem('ecomirror_test', JSON.stringify({ a: 1 }));
    expect(safeRead('ecomirror_test')).toEqual({ a: 1 });
  });

  it('returns fallback on corrupt JSON', () => {
    localStorage.setItem('ecomirror_corrupt', 'not-json{{{');
    expect(safeRead('ecomirror_corrupt', null)).toBeNull();
  });
});

describe('safeWrite', () => {
  it('returns true on successful write', () => {
    expect(safeWrite('ecomirror_key', { x: 2 })).toBe(true);
    expect(safeRead('ecomirror_key')).toEqual({ x: 2 });
  });
});

describe('safeRemove', () => {
  it('removes the key without throwing', () => {
    safeWrite('ecomirror_rem', 42);
    safeRemove('ecomirror_rem');
    expect(safeRead('ecomirror_rem', null)).toBeNull();
  });
});

describe('validateImportPayload', () => {
  it('rejects null', () => {
    expect(validateImportPayload(null).valid).toBe(false);
  });

  it('rejects arrays', () => {
    expect(validateImportPayload([]).valid).toBe(false);
  });

  it('rejects payloads with no known keys', () => {
    const result = validateImportPayload({ malicious: 'data' });
    expect(result.valid).toBe(false);
  });

  it('accepts payloads with known ecomirror_ keys', () => {
    const result = validateImportPayload({ ecomirror_user: { name: 'Test' } });
    expect(result.valid).toBe(true);
    expect(result.sanitized).toHaveProperty('ecomirror_user');
  });

  it('strips unknown keys from sanitized output', () => {
    const result = validateImportPayload({
      ecomirror_user: { name: 'Test' },
      ecomirror_unknown_key: 'should be dropped',
      evil: 'payload',
    });
    expect(result.sanitized).not.toHaveProperty('evil');
    expect(result.sanitized).not.toHaveProperty('ecomirror_unknown_key');
  });
});

describe('exportAllData / clearAllData', () => {
  it('exports only ecomirror_ prefixed keys', () => {
    localStorage.setItem('ecomirror_user', JSON.stringify({ name: 'Test' }));
    localStorage.setItem('other_key', 'should not appear');
    const data = exportAllData();
    expect(data).toHaveProperty('ecomirror_user');
    expect(data).not.toHaveProperty('other_key');
  });

  it('clearAllData removes only ecomirror_ keys', () => {
    localStorage.setItem('ecomirror_user', JSON.stringify({ name: 'Test' }));
    localStorage.setItem('other_key', 'preserved');
    clearAllData();
    expect(localStorage.getItem('ecomirror_user')).toBeNull();
    expect(localStorage.getItem('other_key')).toBe('preserved');
  });
});
