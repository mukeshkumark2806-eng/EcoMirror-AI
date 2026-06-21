/**
 * @fileoverview useGamification Hook.
 * Wraps around the unified GamificationContext.
 * @module hooks/useGamification
 */

import { useGamificationState } from '../context/GamificationContext';

export {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  BADGES,
  LEVELS,
  getLevelDetails
} from '../context/GamificationContext';

/**
 * Custom hook to manage the gamified challenges, levels, streaks, and local leaderboard.
 * Consumes the central GamificationContext to ensure state synchronization.
 *
 * @returns {object} Gamification state and methods.
 */
export function useGamification() {
  const {
    state,
    currentLevel,
    leaderboard,
    completeDailyChallenge,
    logWeeklyChallengeProgress,
    mockNewDay,
    mockNewWeek,
    resetAllGamification,
    DAILY_CHALLENGES: dailyChallenges,
    WEEKLY_CHALLENGES: weeklyChallenges,
    BADGES: badges,
    LEVELS: levels,
  } = useGamificationState();

  return {
    gamificationState: state,
    currentLevel,
    leaderboard,
    completeDailyChallenge,
    logWeeklyChallengeProgress,
    mockNewDay,
    mockNewWeek,
    resetAllGamification,
    dailyChallenges,
    weeklyChallenges,
    badges,
    levels,
  };
}
