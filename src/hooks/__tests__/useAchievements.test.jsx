import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAchievements } from '../useAchievements';
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

describe('useAchievements hook', () => {
  it('returns achievements, badges, and streaks state', () => {
    const { result } = renderHook(() => useAchievements(), { wrapper });

    expect(result.current.unlockedBadges).toBeDefined();
    expect(result.current.lockedBadges).toBeDefined();
    expect(result.current.streak).toBeDefined();
    expect(typeof result.current.unlockBadge).toBe('function');
    expect(typeof result.current.updateStreak).toBe('function');
    expect(result.current.streak.current).toBe(0);
  });
});
