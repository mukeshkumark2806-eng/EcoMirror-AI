/**
 * @fileoverview Tests for the sanitize utility (XSS-safe renderer).
 * @module utils/__tests__/sanitize.test
 */

import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../sanitize';

describe('parseMarkdown', () => {
  it('returns empty array for empty string', () => {
    expect(parseMarkdown('')).toEqual([]);
  });

  it('returns plain text as-is', () => {
    const result = parseMarkdown('Hello world');
    expect(result.join('')).toBe('Hello world');
  });

  it('converts **bold** to strong elements', () => {
    const result = parseMarkdown('Use **LED bulbs** today');
    const boldElement = result.find(n => n?.type === 'strong');
    expect(boldElement).toBeDefined();
    expect(boldElement.props.children).toBe('LED bulbs');
  });

  it('converts newlines to br elements', () => {
    const result = parseMarkdown('Line one\nLine two');
    const brElement = result.find(n => n?.type === 'br');
    expect(brElement).toBeDefined();
  });

  it('handles multiple bold spans', () => {
    const result = parseMarkdown('**A** and **B**');
    const bolds = result.filter(n => n?.type === 'strong');
    expect(bolds).toHaveLength(2);
  });

  it('handles text without any markdown', () => {
    const result = parseMarkdown('Just plain text');
    expect(result).toContain('Just plain text');
  });

  it('does not create any raw HTML strings', () => {
    const result = parseMarkdown('<script>alert("xss")</script>');
    // Result should be plain text nodes, no raw HTML
    const htmlStrings = result.filter(n => typeof n === 'string' && n.includes('<script>'));
    expect(htmlStrings.length).toBeGreaterThan(0); // preserved as text
    // Crucially, no React element renders this as HTML
    const scriptElements = result.filter(n => n?.type === 'script');
    expect(scriptElements).toHaveLength(0);
  });
});
