/**
 * @fileoverview Global test setup for Vitest + React Testing Library.
 * Imports jest-dom matchers and clears localStorage between tests.
 */

import '@testing-library/jest-dom';

// Mock IntersectionObserver for Framer Motion / react-intersection-observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for smooth scroll effects in components like EcoCoachPage
window.HTMLElement.prototype.scrollIntoView = function() {};

// Clear localStorage before each test to ensure isolation
beforeEach(() => {
  localStorage.clear();
});

// Suppress noisy console.warn in tests (e.g. localStorage quota warnings)
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('[EcoMirror]')) return;
    originalWarn(...args);
  };
});
afterAll(() => {
  console.warn = originalWarn;
});
