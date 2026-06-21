import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../LanguageContext';

function TestComponent() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang">{language}</span>
      <span data-testid="title">{t('brand.name.eco', 'Eco')}</span>
      <span data-testid="fallback">{t('missing.key', 'Default Fallback')}</span>
      <button onClick={() => setLanguage('hi')}>Change to Hindi</button>
    </div>
  );
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides the default language and fallback translates', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Default language is 'en'
    expect(screen.getByTestId('lang').textContent).toBe('en');

    // Eventually loads English dictionary and translates
    await waitFor(() => {
      expect(screen.getByTestId('title').textContent).toBe('Eco');
    });

    // Correctly falls back to default value if key is missing
    expect(screen.getByTestId('fallback').textContent).toBe('Default Fallback');
  });

  it('can change the language and loads new translations', async () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Click to change to Hindi
    act(() => {
      screen.getByText('Change to Hindi').click();
    });

    // Language code should update
    expect(screen.getByTestId('lang').textContent).toBe('hi');

    // Eventually loads Hindi dictionary
    await waitFor(() => {
      expect(screen.getByTestId('title').textContent).toBe('इको');
    }, { timeout: 3000 });

    expect(localStorage.getItem('ecomirror_language')).toBe('hi');
  });
});
