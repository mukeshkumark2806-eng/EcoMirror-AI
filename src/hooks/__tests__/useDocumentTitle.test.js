import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDocumentTitle } from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  let originalTitle;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('sets page title correctly when argument is provided', () => {
    renderHook(() => useDocumentTitle('Test Page'));
    expect(document.title).toBe('Test Page — EcoMirror AI');
  });

  it('sets base title when page title is empty', () => {
    renderHook(() => useDocumentTitle(''));
    expect(document.title).toBe('EcoMirror AI');
  });

  it('restores previous title on unmount', () => {
    document.title = 'Initial Title';
    const { unmount } = renderHook(() => useDocumentTitle('New Page'));
    expect(document.title).toBe('New Page — EcoMirror AI');
    unmount();
    expect(document.title).toBe('Initial Title');
  });
});
