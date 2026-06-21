import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from '../useMediaQuery';

describe('useMediaQuery', () => {
  it('should return query match states based on mock window.matchMedia', () => {
    const listeners = new Set();
    
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: query === '(max-width: 639px)',
      addEventListener: (event, callback) => {
        listeners.add(callback);
      },
      removeEventListener: (event, callback) => {
        listeners.delete(callback);
      },
    }));

    const { result: isMobile } = renderHook(() => useIsMobile());
    expect(isMobile.current).toBe(true);

    const { result: isTablet } = renderHook(() => useIsTablet());
    expect(isTablet.current).toBe(false);

    const { result: isDesktop } = renderHook(() => useIsDesktop());
    expect(isDesktop.current).toBe(false);

    const { result: customQuery } = renderHook(() => useMediaQuery('(max-width: 639px)'));
    expect(customQuery.current).toBe(true);
  });
});
