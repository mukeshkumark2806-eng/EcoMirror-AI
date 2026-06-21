import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../../context/UserContext';
import { LanguageProvider } from '../../../context/LanguageContext';
import LandingPage from '../LandingPage';

describe('LandingPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <UserProvider>
          <LanguageProvider>
            <LandingPage />
          </LanguageProvider>
        </UserProvider>
      </BrowserRouter>
    );
  };

  it('renders brand name and tagline', () => {
    renderLandingPage();

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe('EcoMirror AI');
    expect(screen.getByText(/Mirror your lifestyle/i)).toBeInTheDocument();
  });

  it('renders CTA discover button when not onboarded', () => {
    renderLandingPage();

    const ctaBtn = screen.getByRole('button', { name: /Discover Your Eco Score|Go to Dashboard/i });
    expect(ctaBtn).toBeInTheDocument();
  });

  it('contains primary features list', () => {
    renderLandingPage();

    // Features section contains items
    expect(screen.getByText(/^Smart Insights$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Learn & Grow$/i)).toBeInTheDocument();
  });
});
