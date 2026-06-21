/**
 * @fileoverview XSS-safe text renderer.
 * Converts a limited set of trusted Markdown-lite markup into React elements,
 * completely avoiding dangerouslySetInnerHTML.
 * @module utils/sanitize
 */

import React from 'react';

/**
 * Parses a simple markdown-like string into React nodes.
 * Supports:
 *  - **bold**  → <strong>
 *  - \n        → <br />
 *  - • bullet  → bullet point (preserved as text)
 *
 * @param {string} text - Input text with limited markdown.
 * @returns {React.ReactNode[]} Array of React nodes.
 */
export function parseMarkdown(text) {
  if (!text) return [];

  // Split on line breaks first
  const lines = String(text).split('\n');
  const nodes = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) {
      nodes.push(React.createElement('br', { key: `br-${lineIdx}` }));
    }

    // Split each line on **bold** markers
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    parts.forEach((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const content = part.slice(2, -2);
        nodes.push(
          React.createElement('strong', { key: `b-${lineIdx}-${partIdx}` }, content)
        );
      } else if (part) {
        nodes.push(part);
      }
    });
  });

  return nodes;
}

/**
 * React component that safely renders markdown-lite text.
 * @param {{ text: string, className?: string, as?: string }} props
 */
export function SafeText({ text, className, as = 'span' }) {
  return React.createElement(
    as,
    { className },
    ...parseMarkdown(text)
  );
}
