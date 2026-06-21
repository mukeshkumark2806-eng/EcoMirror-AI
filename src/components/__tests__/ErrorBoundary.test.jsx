/**
 * @fileoverview Tests for the ErrorBoundary component.
 * @module components/__tests__/ErrorBoundary.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ui/ErrorBoundary';

/** Helper component that throws synchronously. */
function ThrowingComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Normal content</div>;
}

// Suppress React's own console.error for caught errors
const originalError = console.error;
beforeAll(() => { console.error = vi.fn(); });
afterAll(() => { console.error = originalError; });

describe('ErrorBoundary', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders the role="alert" on the fallback', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders a custom fallback prop', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText('Custom error')).toBeInTheDocument();
  });

  it('displays the error message in details', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText(/Test render error/i)).toBeInTheDocument();
  });

  it('has a "Return to Home" button', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument();
  });
});
