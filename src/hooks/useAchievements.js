/**
 * @fileoverview useAchievements Hook.
 * Wraps around the unified GamificationContext.
 * @module hooks/useAchievements
 */

import { useGamificationState } from '../context/GamificationContext';

/**
 * Custom hook to retrieve achievements progress (badges, streaks).
 * Consumes the central GamificationContext to ensure state synchronization.
 *
 * @returns {object} Achievements state and methods.
 */
export function useAchievements() {
  const {
    state,
    unlockedBadges,
    lockedBadges,
    unlockBadge,
    updateStreak,
    checkAchievements,
    allBadges,
  } = useGamificationState();

  return {
    unlockedBadges,
    lockedBadges,
    unlockBadge,
    updateStreak,
    checkAchievements,
    streak: {
      current: state.dailyStreak,
      longest: Math.max(state.dailyStreak, 5),
      lastLogDate: null,
    },
    allBadges,
  };
}
