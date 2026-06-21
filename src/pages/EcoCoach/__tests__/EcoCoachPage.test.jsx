import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../../context/UserContext';
import { LanguageProvider } from '../../../context/LanguageContext';
import EcoCoachPage from '../EcoCoachPage';

describe('EcoCoachPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderCoach = () => {
    return render(
      <BrowserRouter>
        <UserProvider>
          <LanguageProvider>
            <EcoCoachPage />
          </LanguageProvider>
        </UserProvider>
      </BrowserRouter>
    );
  };

  it('renders empty state when no assessment data exists', () => {
    renderCoach();

    expect(screen.getByText(/Coach Needs Your Data/i)).toBeInTheDocument();
  });

  it('renders chat interface and quick topics when assessment data is present', async () => {
    const mockResult = {
      ecoScore: 60,
      responses: { transport: 'car' }
    };
    localStorage.setItem('ecomirror_assessment_result', JSON.stringify(mockResult));

    renderCoach();

    // Renders header & banners
    expect(screen.getByText(/Eco Coach/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Topics/i)).toBeInTheDocument();

    // Renders welcome message
    expect(screen.getByText(/AI Coach/i)).toBeInTheDocument();
  });
});
