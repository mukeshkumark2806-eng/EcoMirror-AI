import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { UserProvider, useUser } from '../UserContext';

function TestComponent() {
  const {
    user,
    isOnboarded,
    completeOnboarding,
    updatePreferences,
    updateName,
    resetUser,
    exportData,
    importData,
  } = useUser();

  return (
    <div>
      <div data-testid="username">{user.name}</div>
      <div data-testid="onboarded">{isOnboarded ? 'yes' : 'no'}</div>
      <div data-testid="units">{user.preferences.units}</div>
      <button onClick={() => completeOnboarding({ test: 'quiz' })}>Complete Onboarding</button>
      <button onClick={() => updatePreferences({ units: 'imperial' })}>Set Imperial</button>
      <button onClick={() => updateName('New Name')}>Change Name</button>
      <button onClick={() => resetUser()}>Reset</button>
      <button onClick={() => {
        const exported = exportData();
        window.exportedData = exported;
      }}>Export</button>
      <button onClick={() => {
        const res = importData({
          ecomirror_user: {
            ...user,
            name: 'Imported User',
            onboardingComplete: true
          }
        });
        window.importResult = res;
      }}>Import</button>
    </div>
  );
}

describe('UserContext', () => {
  it('manages user profile, preferences, and data import/export', () => {
    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(screen.getByTestId('username').textContent).toBe('EcoExplorer');
    expect(screen.getByTestId('onboarded').textContent).toBe('no');
    expect(screen.getByTestId('units').textContent).toBe('metric');

    // Onboarding
    act(() => {
      screen.getByText('Complete Onboarding').click();
    });
    expect(screen.getByTestId('onboarded').textContent).toBe('yes');

    // Update preferences
    act(() => {
      screen.getByText('Set Imperial').click();
    });
    expect(screen.getByTestId('units').textContent).toBe('imperial');

    // Update name
    act(() => {
      screen.getByText('Change Name').click();
    });
    expect(screen.getByTestId('username').textContent).toBe('New Name');

    // Export
    act(() => {
      screen.getByText('Export').click();
    });
    expect(window.exportedData).toBeDefined();

    // Import
    act(() => {
      screen.getByText('Import').click();
    });
    expect(window.importResult.success).toBe(true);
    expect(screen.getByTestId('username').textContent).toBe('Imported User');

    // Reset
    act(() => {
      screen.getByText('Reset').click();
    });
    expect(screen.getByTestId('username').textContent).toBe('EcoExplorer');
    expect(screen.getByTestId('onboarded').textContent).toBe('no');
  });

  it('throws error when useUser is used outside of UserProvider', () => {
    const TestComponentError = () => {
      useUser();
      return null;
    };

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponentError />)).toThrow('useUser must be used within UserProvider');

    spy.mockRestore();
  });
});
