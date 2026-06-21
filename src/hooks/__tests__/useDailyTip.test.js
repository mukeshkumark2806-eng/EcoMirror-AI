import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDailyTip } from '../useDailyTip';
import tips from '../../data/tips.json';

describe('useDailyTip', () => {
  it('returns a valid tip object from tips.json', () => {
    const { result } = renderHook(() => useDailyTip());
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('id');
    expect(result.current).toHaveProperty('category');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('icon');
    expect(tips).toContainEqual(result.current);
  });
});
