import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../../context/UserContext';
import { LanguageProvider } from '../../../context/LanguageContext';
import AssessmentPage from '../AssessmentPage';

describe('AssessmentPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderAssessment = () => {
    return render(
      <BrowserRouter>
        <UserProvider>
          <LanguageProvider>
            <AssessmentPage />
          </LanguageProvider>
        </UserProvider>
      </BrowserRouter>
    );
  };

  it('renders step 1 (Transportation) and options', () => {
    renderAssessment();

    expect(screen.getByText(/Transportation/i)).toBeInTheDocument();
    expect(screen.getByText(/How do you usually get around/i)).toBeInTheDocument();
    expect(screen.getByText(/^Car$/i)).toBeInTheDocument();
    expect(screen.getByText(/Bicycle/i)).toBeInTheDocument();
  });

  it('enables continue button only when an option is selected', () => {
    renderAssessment();

    const nextBtn = screen.getByRole('button', { name: /Continue|See My EcoMirror/i });
    expect(nextBtn).toBeDisabled();

    act(() => {
      screen.getByText('Bicycle').click();
    });

    expect(nextBtn).toBeEnabled();
  });
});
