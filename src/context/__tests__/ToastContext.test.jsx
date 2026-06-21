import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../ToastContext';

function TestComponent() {
  const { toasts, addToast, removeToast, success, error, info, achievement } = useToast();
  return (
    <div>
      <div data-testid="toast-count">{toasts.length}</div>
      <button onClick={() => addToast('Simple toast', 'info', 1000)}>Add Info</button>
      <button onClick={() => success('Success toast')}>Success</button>
      <button onClick={() => error('Error toast')}>Error</button>
      <button onClick={() => achievement('Achievement toast')}>Achievement</button>
      <button onClick={() => removeToast(toasts[0]?.id)}>Remove First</button>
      <ul>
        {toasts.map(t => (
          <li key={t.id}>
            {t.message} ({t.type})
          </li>
        ))}
      </ul>
    </div>
  );
}

describe('ToastContext', () => {
  it('provides toast API and renders toasts dynamically', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    expect(screen.getByTestId('toast-count').textContent).toBe('0');

    // Click Add Info
    act(() => {
      screen.getByText('Add Info').click();
    });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');
    expect(screen.getByText('Simple toast (info)')).toBeInTheDocument();

    // Click Success
    act(() => {
      screen.getByText('Success').click();
    });
    expect(screen.getByTestId('toast-count').textContent).toBe('2');
    expect(screen.getByText('Success toast (success)')).toBeInTheDocument();

    // Click Remove First
    act(() => {
      screen.getByText('Remove First').click();
    });
    expect(screen.getByTestId('toast-count').textContent).toBe('1');
    expect(screen.queryByText('Simple toast (info)')).not.toBeInTheDocument();
    expect(screen.getByText('Success toast (success)')).toBeInTheDocument();
  });

  it('throws error when useToast is used outside of ToastProvider', () => {
    const TestComponentError = () => {
      useToast();
      return null;
    };

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponentError />)).toThrow('useToast must be used within ToastProvider');

    spy.mockRestore();
  });
});
