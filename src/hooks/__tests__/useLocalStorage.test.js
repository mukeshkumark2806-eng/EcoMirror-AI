/**
 * @fileoverview Tests for the useLocalStorage hook.
 * @module hooks/__tests__/useLocalStorage.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('useLocalStorage', () => {
  it('initialises with the default value when no stored data exists', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads an existing value from localStorage', () => {
    localStorage.setItem('ecomirror_testKey', JSON.stringify('hello'));
    const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
    expect(result.current[0]).toBe('hello');
  });

  it('persists value updates to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => result.current[1](99));
    expect(JSON.parse(localStorage.getItem('ecomirror_counter'))).toBe(99);
  });

  it('accepts functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 10));
    act(() => result.current[1](prev => prev + 5));
    expect(result.current[0]).toBe(15);
  });

  it('remove() clears localStorage and resets to default', () => {
    const { result } = renderHook(() => useLocalStorage('toRemove', 'initial'));
    act(() => result.current[1]('changed'));
    expect(result.current[0]).toBe('changed');
    act(() => result.current[2]()); // call remove()
    // State should reset to the default value
    expect(result.current[0]).toBe('initial');
  });

  it('handles corrupt localStorage gracefully', () => {
    localStorage.setItem('ecomirror_corrupt', '{{not valid json}}');
    const { result } = renderHook(() => useLocalStorage('corrupt', 'safe'));
    expect(result.current[0]).toBe('safe');
  });

  it('applies the ecomirror_ prefix to the storage key', () => {
    const { result } = renderHook(() => useLocalStorage('myKey', 'test'));
    act(() => result.current[1]('newVal'));
    expect(localStorage.getItem('ecomirror_myKey')).toBe(JSON.stringify('newVal'));
    expect(localStorage.getItem('myKey')).toBeNull();
  });
});
