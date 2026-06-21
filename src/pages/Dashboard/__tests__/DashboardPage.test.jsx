import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from '../../../context/UserContext';
import { LanguageProvider } from '../../../context/LanguageContext';
import { GamificationProvider } from '../../../context/GamificationContext';
import DashboardPage from '../DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <UserProvider>
          <GamificationProvider>
            <LanguageProvider>
              <DashboardPage />
            </LanguageProvider>
          </GamificationProvider>
        </UserProvider>
      </BrowserRouter>
    );
  };

  it('renders empty state when no assessment result exists', () => {
    renderDashboard();

    expect(screen.getByText(/Take Your Assessment First/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start Assessment/i })).toBeInTheDocument();
  });

  it('renders comparative panels when assessment result is present', () => {
    const mockResult = {
      ecoScore: 65,
      impactLevel: 'Moderate',
      impactColor: '#fbbf24',
      totalCarbon: 40,
      responses: {
        transport: 'car',
        food: 'mixed',
        water: 'medium',
        energy: { ac_hours: 4, fan_hours: 8, appliance_hours: 4 }
      }
    };
    localStorage.setItem('ecomirror_assessment_result', JSON.stringify(mockResult));

    renderDashboard();

    // Verify current vs future panels are rendered
    expect(screen.getByText(/Current You/i)).toBeInTheDocument();
    expect(screen.getByText(/Future Eco You/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Comparison/i)).toBeInTheDocument();
    
    // Toggles should be present
    expect(screen.getByText(/Switch to Bus/i)).toBeInTheDocument();
  });
});
