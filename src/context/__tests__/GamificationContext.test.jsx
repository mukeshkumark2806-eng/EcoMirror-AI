import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { UserProvider } from '../UserContext';
import { GamificationProvider, useGamificationState } from '../GamificationContext';

function TestGamificationComponent() {
  const {
    state,
    completeDailyChallenge,
    logWeeklyChallengeProgress,
    mockNewDay,
    mockNewWeek,
    resetAllGamification,
    unlockedBadges,
    unlockBadge,
    updateStreak,
    checkAchievements,
  } = useGamificationState();

  return (
    <div>
      <span data-testid="points">{state.points}</span>
      <span data-testid="streak">{state.dailyStreak}</span>
      <span data-testid="badge-count">{unlockedBadges.length}</span>
      <button onClick={() => completeDailyChallenge('daily_plastic_free')}>Complete Daily</button>
      <button onClick={() => logWeeklyChallengeProgress('weekly_car_free_weekend')}>Log Weekly</button>
      <button onClick={() => mockNewDay()}>Mock Day</button>
      <button onClick={() => mockNewWeek()}>Mock Week</button>
      <button onClick={() => resetAllGamification()}>Reset</button>
      <button onClick={() => unlockBadge('badge_first_step')}>Unlock First Step</button>
      <button onClick={() => updateStreak()}>Update Streak</button>
      <button onClick={() => checkAchievements({ activitiesCount: 1, completedChallenges: [], isOnboarded: true })}>Check Achievements</button>
    </div>
  );
}

describe('GamificationProvider', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with default gamification state', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    expect(screen.getByTestId('points').textContent).toBe('0');
    expect(screen.getByTestId('streak').textContent).toBe('0');
    expect(screen.getByTestId('badge-count').textContent).toBe('0');
  });

  it('should complete daily challenges and update points and streak', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    act(() => {
      screen.getByText('Complete Daily').click();
    });

    // daily_plastic_free is worth 15 points
    expect(screen.getByTestId('points').textContent).toBe('15');
    // first daily challenge completes updates streak to 1
    expect(screen.getByTestId('streak').textContent).toBe('1');
  });

  it('should log weekly challenge progress and complete it when target is reached', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    // Day 1
    act(() => {
      screen.getByText('Log Weekly').click();
    });
    // weekly_car_free_weekend requires 2 days, so it is not completed yet (points remain 0)
    expect(screen.getByTestId('points').textContent).toBe('0');

    // Day 2
    act(() => {
      screen.getByText('Log Weekly').click();
    });
    // Now completed (worth 50 points)
    expect(screen.getByTestId('points').textContent).toBe('50');
  });

  it('should handle manual streak updates and unlocking badges', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    act(() => {
      screen.getByText('Update Streak').click();
    });
    expect(screen.getByTestId('streak').textContent).toBe('1');

    act(() => {
      screen.getByText('Unlock First Step').click();
    });
    expect(screen.getByTestId('badge-count').textContent).toBe('1');
  });

  it('should reset state on new day, new week, and reset all', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    act(() => {
      screen.getByText('Complete Daily').click();
      screen.getByText('Mock Day').click();
      screen.getByText('Mock Week').click();
    });
    // Completed dailies reset, but points/streak persist
    expect(screen.getByTestId('points').textContent).toBe('15');

    act(() => {
      screen.getByText('Reset').click();
    });
    expect(screen.getByTestId('points').textContent).toBe('0');
  });

  it('should check achievements and unlock onboarding or logging badges', () => {
    render(
      <UserProvider>
        <GamificationProvider>
          <TestGamificationComponent />
        </GamificationProvider>
      </UserProvider>
    );

    expect(screen.getByTestId('badge-count').textContent).toBe('0');

    for (let i = 0; i < 7; i++) {
      act(() => {
        screen.getByText('Update Streak').click();
      });
    }

    act(() => {
      screen.getByText('Check Achievements').click();
    });

    // Should unlock badge_first_step (onboarding complete), badge_first_log (total_logs >= 1), and badge_logger (streak >= 7)
    expect(screen.getByTestId('badge-count').textContent).toBe('3');
  });

  it('should unlock badge on weekly completion when category count threshold is met', () => {
    const wrapper = ({ children }) => (
      <UserProvider>
        <GamificationProvider>
          {children}
        </GamificationProvider>
      </UserProvider>
    );
    const { result } = renderHook(() => useGamificationState(), { wrapper });

    expect(result.current.unlockedBadges.length).toBe(0);

    // Day 1: Complete daily public transport
    act(() => {
      result.current.completeDailyChallenge('daily_public_transport');
    });
    
    // Mock new day
    act(() => {
      result.current.mockNewDay();
    });

    // Day 2: Complete daily public transport again
    act(() => {
      result.current.completeDailyChallenge('daily_public_transport');
    });

    // Log weekly car free weekend day 1
    act(() => {
      result.current.logWeeklyChallengeProgress('weekly_car_free_weekend');
    });

    // Log weekly car free weekend day 2 (completing it)
    let logRes;
    act(() => {
      logRes = result.current.logWeeklyChallengeProgress('weekly_car_free_weekend');
    });

    // Weekly completion should return the unlocked badge
    expect(logRes.isCompleted).toBe(true);
    expect(logRes.newBadge).toBeDefined();
    expect(logRes.newBadge.id).toBe('badge_green_traveler');
    expect(result.current.unlockedBadges.length).toBe(1);
    expect(result.current.unlockedBadges[0].id).toBe('badge_green_traveler');
  });
});
