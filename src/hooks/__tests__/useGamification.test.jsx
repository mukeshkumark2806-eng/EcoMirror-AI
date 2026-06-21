import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGamification } from '../useGamification';
import { GamificationProvider } from '../../context/GamificationContext';
import { UserProvider } from '../../context/UserContext';
import React from 'react';

const wrapper = ({ children }) => (
  <UserProvider>
    <GamificationProvider>
      {children}
    </GamificationProvider>
  </UserProvider>
);

describe('useGamification hook', () => {
  it('manages gamification challenge actions', () => {
    const { result } = renderHook(() => useGamification(), { wrapper });

    expect(result.current.gamificationState).toBeDefined();
    expect(result.current.currentLevel).toBeDefined();
    expect(result.current.leaderboard).toBeDefined();

    // Complete daily challenge
    act(() => {
      result.current.completeDailyChallenge('daily_plastic_free');
    });

    expect(result.current.gamificationState.completedDailyIds).toContain('daily_plastic_free');
  });
});
